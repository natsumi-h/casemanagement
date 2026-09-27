import { ActionIcon, Badge, Button, Group, Table, Text, Title, Tooltip } from '@mantine/core'
import { IconEye, IconPlus, IconTrash } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfirmDelete } from '../components/ConfirmDelete'
import { useAuth } from '../lib/auth'
import { formatJaDate, fullName, statusLabel } from '../lib/format'
import { supabase } from '../lib/supabase'
import { AGREEMENT_SELECT, type AgreementWithRelations } from '../lib/types'

export function AgreementsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [agreements, setAgreements] = useState<AgreementWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<AgreementWithRelations | null>(null)

  useEffect(() => {
    if (!user) return
    // ログインユーザーが作成者 または 署名者の契約書のみ
    supabase
      .from('agreements')
      .select(AGREEMENT_SELECT)
      .or(`user_id.eq.${user.id},created_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error)
        setAgreements((data as unknown as AgreementWithRelations[]) ?? [])
        setLoading(false)
      })
  }, [user])

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={3}>契約書</Title>
        <Button leftSection={<IconPlus size={16} />}>作成</Button>
      </Group>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>タイトル</Table.Th>
            <Table.Th>署名者</Table.Th>
            <Table.Th>作成者</Table.Th>
            <Table.Th>テンプレート</Table.Th>
            <Table.Th>ステータス</Table.Th>
            <Table.Th>作成日</Table.Th>
            <Table.Th w={120}>アクション</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {agreements.map((a) => (
            <Table.Tr key={a.id}>
              <Table.Td>{a.title}</Table.Td>
              <Table.Td>{fullName(a.signer)}</Table.Td>
              <Table.Td>{fullName(a.creator)}</Table.Td>
              <Table.Td>{a.template?.title ?? '-'}</Table.Td>
              <Table.Td>
                <Badge color={a.status === 'signed' ? 'green' : 'orange'} variant="light">
                  {statusLabel[a.status]}
                </Badge>
              </Table.Td>
              <Table.Td>{formatJaDate(a.created_at)}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Tooltip label="閲覧">
                    <ActionIcon variant="light" onClick={() => navigate(`/agreements/${a.id}`)}>
                      <IconEye size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="削除">
                    <ActionIcon variant="light" color="red" onClick={() => setDeleting(a)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {!loading && agreements.length === 0 && (
        <Text c="dimmed" mt="md">
          表示できる契約書がありません
        </Text>
      )}

      <ConfirmDelete
        opened={!!deleting}
        targetName={deleting?.title ?? ''}
        onClose={() => setDeleting(null)}
        onConfirm={() => setDeleting(null)}
      />
    </>
  )
}
