import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PublicForm from './pages/PublicForm'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PreciosHelados from './pages/PreciosHelados'
import PreciosAdmin from './pages/PreciosAdmin'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/registro" element={<PublicForm />} />
        <Route path="/acceso-interno" element={<Login />} />
        <Route path="/beneficios" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/precios-helados" element={<PreciosHelados />} />
        <Route path="/precios" element={
          <ProtectedRoute>
            <PreciosAdmin />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/acceso-interno" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
