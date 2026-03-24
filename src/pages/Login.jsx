import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Mail, Lock, ShoppingBasket, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.')
    } else {
      navigate('/beneficios')
    }
    setLoading(false)
  }

  const inputClass = (field) => `
    w-full pl-12 pr-4 py-4 rounded-xl border-2 outline-none transition-all duration-200 bg-white text-gray-800 text-sm font-medium
    ${focused === field
      ? 'border-[#A30C5A] shadow-[0_0_0_4px_rgba(163,12,90,0.12)]'
      : 'border-gray-200 hover:border-[#CCCCCC]'}
  `

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{background: 'linear-gradient(135deg, #A30C5A 0%, #7d0945 50%, #1a0012 100%)'}}>
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#E2B52C] opacity-5"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white opacity-5"></div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo area */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Opel Market" className="w-64 mx-auto" style={{marginTop: '-28px', marginBottom: '-28px'}} />
          <p className="text-white/50 text-sm mt-1">Panel de administración</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="px-8 pt-8 pb-2">
            <h2 className="text-xl font-bold text-[#333333]">Bienvenido de vuelta</h2>
            <p className="text-gray-400 text-sm mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#333333] mb-2 uppercase tracking-wide">Correo electrónico</label>
              <div className="relative">
                <Mail size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'email' ? 'text-[#A30C5A]' : 'text-gray-400'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  required
                  placeholder="admin@opelmarket.com"
                  className={inputClass('email')}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#333333] mb-2 uppercase tracking-wide">Contraseña</label>
              <div className="relative">
                <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'password' ? 'text-[#A30C5A]' : 'text-gray-400'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  required
                  placeholder="••••••••"
                  className={inputClass('password') + ' pr-12'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#A30C5A] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              style={{background: 'linear-gradient(135deg, #A30C5A, #c4106e)'}}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Iniciando sesión...
                </span>
              ) : 'Iniciar sesión'}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
