import { ActionIcon, Button, Group, Table, Text, Title, Tooltip } from '@mantine/core'
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfirmDelete } from '../components/ConfirmDelete'
import { formatJaDate } from '../lib/format'
import { supabase } from '../lib/supabase'
import type { Template } from '../lib/types'

export function TemplatesPage() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<Template | null>(null)

  useEffect(() => {
    // 本来はユーザー／チームに紐づくテンプレートのみ取得するが、デモのため全件表示
    supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setTemplates((data as Template[]) ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={3}>テンプレート</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/templates/create')}>
          作成
        </Button>
      </Group>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>タイトル</Table.Th>
            <Table.Th>作成日</Table.Th>
            <Table.Th w={120}>アクション</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {templates.map((t) => (
            <Table.Tr key={t.id}>
              <Table.Td>{t.title}</Table.Td>
              <Table.Td>{formatJaDate(t.created_at)}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Tooltip label="編集">
                    <ActionIcon variant="light" onClick={() => navigate(`/templates/${t.id}`)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="削除">
                    <ActionIcon variant="light" color="red" onClick={() => setDeleting(t)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {!loading && templates.length === 0 && (
        <Text c="dimmed" mt="md">
          テンプレートがありません
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
