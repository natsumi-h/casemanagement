import { Center, Loader } from '@mantine/core'
import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { AuthProvider, useAuth } from './lib/auth'
import { AgreementsPage } from './pages/AgreementsPage'
import { AgreementViewPage } from './pages/AgreementViewPage'
import { LoginPage } from './pages/LoginPage'
import { TemplateEditorPage } from './pages/TemplateEditorPage'
import { TemplatesPage } from './pages/TemplatesPage'
import { UsersPage } from './pages/UsersPage'

function RequireAuth({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth()
  if (loading)
    return (
      <Center h="100dvh">
        <Loader />
      </Center>
    )
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/agreements" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/templates/create" element={<TemplateEditorPage key="create" />} />
            <Route path="/templates/:id" element={<TemplateEditorPage />} />
            <Route
              path="/users"
              element={
                <RequireAuth adminOnly>
                  <UsersPage />
                </RequireAuth>
              }
            />
            <Route path="/agreements" element={<AgreementsPage />} />
            <Route path="/agreements/:id" element={<AgreementViewPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/agreements" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
