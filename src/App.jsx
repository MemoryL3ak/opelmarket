import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PublicForm from './pages/PublicForm'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/registro" element={<PublicForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/beneficios" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/registro" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
