import { ActionIcon, Badge, Button, Group, Table, Title, Tooltip } from '@mantine/core'
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { ConfirmDelete } from '../components/ConfirmDelete'
import { fullName, roleLabel } from '../lib/format'
import { supabase } from '../lib/supabase'
import type { AppUser } from '../lib/types'

/** ユーザー一覧（作成・保存・削除はデモのため省略） */
export function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [deleting, setDeleting] = useState<AppUser | null>(null)

  useEffect(() => {
    supabase
      .from('users')
      .select('*')
      .order('created_at')
      .then(({ data }) => setUsers((data as AppUser[]) ?? []))
  }, [])

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={3}>ユーザー</Title>
        <Button leftSection={<IconPlus size={16} />}>作成</Button>
      </Group>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>氏名</Table.Th>
            <Table.Th>メールアドレス</Table.Th>
            <Table.Th>住所</Table.Th>
            <Table.Th>権限</Table.Th>
            <Table.Th w={120}>アクション</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((u) => (
            <Table.Tr key={u.id}>
              <Table.Td>{fullName(u)}</Table.Td>
              <Table.Td>{u.email}</Table.Td>
              <Table.Td>{u.address}</Table.Td>
              <Table.Td>
                <Badge color={u.role === 'admin' ? 'grape' : 'gray'} variant="light">
                  {roleLabel[u.role]}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Tooltip label="編集">
                    <ActionIcon variant="light">
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="削除">
                    <ActionIcon variant="light" color="red" onClick={() => setDeleting(u)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <ConfirmDelete
        opened={!!deleting}
        targetName={deleting ? fullName(deleting) : ''}
        onClose={() => setDeleting(null)}
        onConfirm={() => setDeleting(null)}
      />
    </>
  )
}
