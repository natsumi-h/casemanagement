import { AppShell, Badge, Group, NavLink, Stack, Text, Title } from '@mantine/core'
import { IconFileText, IconLogout, IconSignature, IconUsers } from '@tabler/icons-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { roleLabel } from '../lib/format'

export function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const items = [
    { to: '/templates', label: 'テンプレート', icon: IconFileText, visible: true },
    { to: '/agreements', label: '契約書', icon: IconSignature, visible: true },
    { to: '/users', label: 'ユーザー', icon: IconUsers, visible: user?.role === 'admin' },
  ]

  return (
    <AppShell header={{ height: 56 }} navbar={{ width: 220, breakpoint: 0 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Title order={4}>契約管理アプリ</Title>
          <Group gap="xs">
            {user && <Badge variant="light">{roleLabel[user.role]}</Badge>}
            <Text size="sm">{user?.email}</Text>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <Stack gap={4} h="100%">
          {items
            .filter((i) => i.visible)
            .map((i) => (
              <NavLink
                key={i.to}
                component={Link}
                to={i.to}
                label={i.label}
                leftSection={<i.icon size={18} />}
                active={location.pathname.startsWith(i.to)}
              />
            ))}
          <NavLink
            mt="auto"
            label="ログアウト"
            leftSection={<IconLogout size={18} />}
            onClick={() => {
              logout()
              navigate('/login')
            }}
          />
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
