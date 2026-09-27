import { Alert, Button, Group, Text, Title } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { resolveFileUrl } from '../lib/files'
import { supabase } from '../lib/supabase'
import type { Template } from '../lib/types'
import { useWebViewer } from '../lib/useWebViewer'

/** /templates/create と /templates/:id の DOCX エディタ（保存処理はデモのため省略） */
export function TemplateEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isCreate = !id
  const [template, setTemplate] = useState<Template | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { viewerRef, instance } = useWebViewer({ enableOfficeEditing: true })

  useEffect(() => {
    if (isCreate) return
    supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) setError('テンプレートが見つかりません')
        else setTemplate(data as Template)
      })
  }, [id, isCreate])

  useEffect(() => {
    if (!instance) return
    if (isCreate) {
      instance.Core.documentViewer.loadBlankOfficeEditorDocument()
    } else if (template) {
      instance.UI.loadDocument(resolveFileUrl(template.file), {
        filename: `${template.title}.docx`,
        extension: 'docx',
        enableOfficeEditing: true,
      })
    }
  }, [instance, isCreate, template])

  return (
    <>
      <Group justify="space-between" mb="sm">
        <Group>
          <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/templates')}>
            一覧へ戻る
          </Button>
          <Title order={4}>{isCreate ? 'テンプレート作成' : `テンプレート編集：${template?.title ?? ''}`}</Title>
        </Group>
        <Button onClick={() => navigate('/templates')}>保存</Button>
      </Group>
      <Text size="xs" c="dimmed" mb="xs">
        ※デモのため保存処理は行われません
      </Text>
      {error && <Alert color="red">{error}</Alert>}
      <div ref={viewerRef} style={{ flex: 1, minHeight: 0 }} />
    </>
  )
}
