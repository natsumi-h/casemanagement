import type { WebViewerInstance } from '@pdftron/webviewer'
import { Alert, Badge, Button, Group, Text, Title } from '@mantine/core'
import { IconArrowLeft, IconSignature } from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { resolveFileUrl } from '../lib/files'
import { formatJaDate, fullName, statusLabel } from '../lib/format'
import { AGREEMENT_BUCKET, supabase } from '../lib/supabase'
import { AGREEMENT_SELECT, type AgreementWithRelations } from '../lib/types'
import { useWebViewer } from '../lib/useWebViewer'

const SIGNATURE_PLACEHOLDER = '[customersignature]'
const SIGNATURE_FIELD_NAME = 'customersignature'

/**
 * テンプレート中の [customersignature] の位置を探し、
 * プレースホルダー文字列を白い矩形で隠したうえで署名フィールドを配置する。
 */
async function placeSignatureField(instance: WebViewerInstance, canSign: boolean) {
  const { Annotations, documentViewer, annotationManager } = instance.Core
  const doc = documentViewer.getDocument()

  for (let page = 1; page <= doc.getPageCount(); page++) {
    const text = await doc.loadPageText(page)
    const index = text.indexOf(SIGNATURE_PLACEHOLDER)
    if (index < 0) continue

    const quads = await doc.getTextPosition(page, index, index + SIGNATURE_PLACEHOLDER.length)
    if (quads.length === 0) continue
    const xs = quads.flatMap((q) => [q.x1, q.x2, q.x3, q.x4])
    const ys = quads.flatMap((q) => [q.y1, q.y2, q.y3, q.y4])
    const left = Math.min(...xs)
    const top = Math.min(...ys)
    const right = Math.max(...xs)
    const bottom = Math.max(...ys)

    // プレースホルダー文字列を隠す
    const cover = new Annotations.RectangleAnnotation({
      PageNumber: page,
      X: left - 1,
      Y: top - 1,
      Width: right - left + 2,
      Height: bottom - top + 2,
      FillColor: new Annotations.Color(255, 255, 255),
      StrokeColor: new Annotations.Color(255, 255, 255),
      StrokeThickness: 0,
    })
    cover.ReadOnly = true
    cover.Locked = true
    cover.NoView = false

    // 署名フィールド
    const flags = new Annotations.WidgetFlags()
    flags.set(Annotations.WidgetFlags.REQUIRED, true)
    if (!canSign) flags.set(Annotations.WidgetFlags.READ_ONLY, true)
    const field = new Annotations.Forms.Field(SIGNATURE_FIELD_NAME, { type: 'Sig', flags })
    const widget = new Annotations.SignatureWidgetAnnotation(field)
    const height = 48
    widget.PageNumber = page
    widget.X = left
    widget.Y = (top + bottom) / 2 - height / 2
    widget.Width = 200
    widget.Height = height

    annotationManager.getFieldManager().addField(field)
    annotationManager.addAnnotations([cover, widget])
    annotationManager.drawAnnotationsFromList([cover, widget])
    return widget
  }
  return null
}

export function AgreementViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [agreement, setAgreement] = useState<AgreementWithRelations | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const widgetRef = useRef<InstanceType<WebViewerInstance['Core']['Annotations']['SignatureWidgetAnnotation']> | null>(
    null,
  )
  const { viewerRef, instance } = useWebViewer()

  const isSigner = !!user && agreement?.user_id === user.id
  const canSign = isSigner && agreement?.status === 'awaiting_signature'

  const fetchAgreement = useCallback(async () => {
    const { data, error } = await supabase.from('agreements').select(AGREEMENT_SELECT).eq('id', id).maybeSingle()
    if (error || !data) {
      setError('契約書が見つかりません')
      return
    }
    const a = data as unknown as AgreementWithRelations
    if (user && a.user_id !== user.id && a.created_user_id !== user.id) {
      setError('この契約書を閲覧する権限がありません')
      return
    }
    setAgreement(a)
  }, [id, user])

  useEffect(() => {
    fetchAgreement()
  }, [fetchAgreement])

  // ドキュメントの読み込み
  useEffect(() => {
    if (!instance || !agreement) return
    const { documentViewer, annotationManager } = instance.Core

    const onLoaded = async () => {
      if (!canSign) annotationManager.enableReadOnlyMode()
      else annotationManager.disableReadOnlyMode()
      if (agreement.status === 'awaiting_signature') {
        widgetRef.current = await placeSignatureField(instance, canSign)
      }
    }
    documentViewer.addEventListener('documentLoaded', onLoaded, { once: true })

    if (agreement.status === 'signed' && agreement.file) {
      // 署名済み PDF
      instance.UI.loadDocument(resolveFileUrl(agreement.file), { filename: `${agreement.title}.pdf` })
    } else if (agreement.template) {
      // テンプレート (docx) に値を差し込んで表示
      instance.UI.loadDocument(resolveFileUrl(agreement.template.file), {
        filename: `${agreement.title}.docx`,
        extension: 'docx',
        officeOptions: {
          templateValues: {
            date: formatJaDate(agreement.created_at),
            lastname: agreement.signer?.lastname ?? '',
            firstname: agreement.signer?.firstname ?? '',
            address: agreement.signer?.address ?? '',
          },
        },
      })
    }

    return () => documentViewer.removeEventListener('documentLoaded', onLoaded)
  }, [instance, agreement, canSign])

  const completeSignature = async () => {
    if (!instance || !agreement) return
    const widget = widgetRef.current
    if (!widget || !widget.isSignedByAppearance()) {
      setMessage('署名フィールドをクリックして署名してください')
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const { documentViewer, annotationManager } = instance.Core
      const xfdfString = await annotationManager.exportAnnotations()
      const data = await documentViewer.getDocument().getFileData({ xfdfString, flatten: true, downloadType: 'pdf' })
      const blob = new Blob([new Uint8Array(data)], { type: 'application/pdf' })
      const path = `${agreement.id}.pdf`

      const upload = await supabase.storage
        .from(AGREEMENT_BUCKET)
        .upload(path, blob, { upsert: true, contentType: 'application/pdf' })
      if (upload.error) throw upload.error

      const update = await supabase
        .from('agreements')
        .update({ status: 'signed', file: path })
        .eq('id', agreement.id)
      if (update.error) throw update.error

      setMessage('署名が完了しました')
      await fetchAgreement()
    } catch (e) {
      setMessage(`保存に失敗しました: ${(e as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Group justify="space-between" mb="sm">
        <Group>
          <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/agreements')}>
            一覧へ戻る
          </Button>
          <Title order={4}>{agreement?.title}</Title>
          {agreement && (
            <Badge color={agreement.status === 'signed' ? 'green' : 'orange'} variant="light">
              {statusLabel[agreement.status]}
            </Badge>
          )}
        </Group>
        {canSign && (
          <Button leftSection={<IconSignature size={16} />} loading={saving} onClick={completeSignature}>
            署名を完了する
          </Button>
        )}
      </Group>

      {agreement && (
        <Text size="xs" c="dimmed" mb="xs">
          署名者：{fullName(agreement.signer)} ／ 作成者：{fullName(agreement.creator)} ／ 作成日：
          {formatJaDate(agreement.created_at)}
          {agreement.status === 'awaiting_signature' && !isSigner && '（署名者のみ署名できます）'}
        </Text>
      )}
      {message && (
        <Alert mb="xs" color={message.includes('失敗') ? 'red' : 'blue'} withCloseButton onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}
      {error && <Alert color="red">{error}</Alert>}
      <div ref={viewerRef} style={{ flex: 1, minHeight: 0, display: error ? 'none' : undefined }} />
    </>
  )
}
