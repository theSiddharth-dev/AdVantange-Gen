import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import AuthPage from './AuthPage.jsx'
import Dashboard from './Dashboard.jsx'

const ProtectedRoute = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('user')
  return token ? <Outlet /> : <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}