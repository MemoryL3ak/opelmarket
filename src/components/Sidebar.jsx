import { Users, FileText, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'

const navItems = [
  { label: 'Registros', href: '/beneficios', icon: Users, key: 'registros' },
  { label: 'Listado de Precios', href: '/precios', icon: FileText, key: 'precios' },
]

export default function Sidebar({ user, active, onNavigate }) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <>
      <div className="px-6 overflow-hidden" style={{ marginTop: '-28px', marginBottom: '-28px' }}>
        <img src="/logo.png" alt="Opel Market" className="w-4/5" />
      </div>

      <nav className="flex-1 px-4">
        <div className="text-white/40 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Principal</div>
        {navItems.map((item) => {
          const isActive = active === item.key
          return (
            <a
              key={item.key}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm mb-1 transition-all ${
                isActive
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/10 font-medium'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </a>
          )
        })}
      </nav>

      <div className="px-4 pb-6">
        <div className="bg-white/10 rounded-2xl p-4 mb-4">
          <p className="text-white/50 text-xs">Sesión activa</p>
          <p className="text-white font-semibold text-sm mt-0.5 truncate">{user?.user_metadata?.name || user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </>
  )
}
