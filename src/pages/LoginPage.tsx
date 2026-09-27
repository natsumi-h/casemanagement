import { Alert, Button, Center, Code, Paper, Stack, Text, TextInput, Title } from '@mantine/core'
import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { isSupabaseConfigured } from '../lib/supabase'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/agreements" replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email)
      navigate('/agreements')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Center h="100dvh" bg="gray.0">
      <Paper withBorder shadow="sm" p="xl" w={380}>
        <form onSubmit={onSubmit}>
          <Stack>
            <Title order={3}>ログイン</Title>
            {!isSupabaseConfigured && (
              <Alert color="yellow" title="Supabase 未設定">
                <Code>.env</Code> に VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定してください。
              </Alert>
            )}
            <TextInput
              label="メールアドレス"
              type="email"
              placeholder="admin@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            {error && (
              <Text c="red" size="sm">
                {error}
              </Text>
            )}
            <Button type="submit" loading={submitting}>
              ログイン
            </Button>
            <Text size="xs" c="dimmed">
              デモ用：admin@example.com / tanaka@example.com / sato@example.com
            </Text>
          </Stack>
        </form>
      </Paper>
    </Center>
  )
}
