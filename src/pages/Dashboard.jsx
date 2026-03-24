import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  ShoppingBasket, Users, CreditCard, Building2, LogOut,
  Search, RefreshCw, Calendar, Mail, ChevronUp, ChevronDown,
  TrendingUp, Coffee, Menu, X
} from 'lucide-react'

export default function Dashboard() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setRegistrations(data || [])
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const handleEntregarCafe = async (id) => {
    const { error } = await supabase
      .from('registrations')
      .update({ estado: 'Entregado' })
      .eq('id', id)
    if (!error) {
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, estado: 'Entregado' } : r))
    }
  }

  const filtered = registrations
    .filter(r =>
      r.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      r.correo?.toLowerCase().includes(search.toLowerCase()) ||
      r.empresa?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const va = a[sortField] || ''
      const vb = b[sortField] || ''
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp size={14} className="text-gray-300" />
    return sortDir === 'asc' ? <ChevronUp size={14} className="text-[#A30C5A]" /> : <ChevronDown size={14} className="text-[#A30C5A]" />
  }

  const stats = [
    { label: 'Total registros', value: registrations.length, icon: Users, color: '#A30C5A' },
    { label: 'Empresas únicas', value: new Set(registrations.map(r => r.empresa)).size, icon: Building2, color: '#E2B52C' },
    { label: 'Este mes', value: registrations.filter(r => new Date(r.created_at).getMonth() === new Date().getMonth()).length, icon: TrendingUp, color: '#A30C5A' },
    { label: 'Registros hoy', value: registrations.filter(r => new Date(r.created_at).toDateString() === new Date().toDateString()).length, icon: CreditCard, color: '#E2B52C' },
  ]

  const SidebarContent = () => (
    <>
      <div className="px-6 overflow-hidden" style={{marginTop: '-28px', marginBottom: '-28px'}}>
        <img src="/logo.png" alt="Opel Market" className="w-4/5" />
      </div>

      <nav className="flex-1 px-4">
        <div className="text-white/40 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Principal</div>
        <a href="/beneficios" className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/15 text-white font-semibold text-sm mb-1">
          <Users size={18} />
          Registros
        </a>
      </nav>

      <div className="px-4 pb-6">
        <div className="bg-white/10 rounded-2xl p-4 mb-4">
          <p className="text-white/50 text-xs">Sesión activa</p>
          <p className="text-white font-semibold text-sm mt-0.5 truncate">{user?.email}</p>
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

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 min-h-screen flex-col shadow-xl" style={{background: 'linear-gradient(180deg, #6b0a3a 0%, #3d0622 100%)'}}>
        <SidebarContent />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 flex flex-col shadow-2xl" style={{background: 'linear-gradient(180deg, #6b0a3a 0%, #3d0622 100%)'}}>
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X size={22} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Top bar */}
        <header className="bg-white shadow-sm px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-[#333333]">Registro de Beneficios</h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-0.5 hidden sm:block">Administra todos los registros del sistema</p>
            </div>
          </div>
          <button
            onClick={fetchRegistrations}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all hover:shadow-md whitespace-nowrap"
            style={{background: 'linear-gradient(135deg, #A30C5A, #c4106e)', color: 'white'}}
          >
            <RefreshCw size={15} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center" style={{background: stat.color + '15'}}>
                    <stat.icon size={18} style={{color: stat.color}} />
                  </div>
                  <span className="text-xl sm:text-2xl font-black" style={{color: stat.color}}>{stat.value}</span>
                </div>
                <p className="text-gray-500 text-xs sm:text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Table card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Search bar */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#A30C5A] focus:ring-2 focus:ring-[#A30C5A]/10 transition-all"
                />
              </div>
              <span className="text-xs sm:text-sm text-gray-400 font-medium whitespace-nowrap">{filtered.length} resultados</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#A30C5A] border-t-transparent"></div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Users size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No hay registros</p>
                <p className="text-sm mt-1">Los registros aparecerán aquí</p>
              </div>
            ) : (
              <>
                {/* Tabla — solo md en adelante */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        {[
                          { key: 'nombre', label: 'Nombre', icon: Users },
                          { key: 'correo', label: 'Correo', icon: Mail },
                          { key: 'empresa', label: 'Empresa', icon: Building2 },
                          { key: 'numero_tarjeta', label: 'N° Tarjeta', icon: CreditCard },
                          { key: 'created_at', label: 'Fecha', icon: Calendar },
                          { key: 'estado', label: 'Estado', icon: Coffee },
                        ].map(col => (
                          <th
                            key={col.key}
                            onClick={() => !['numero_tarjeta', 'estado'].includes(col.key) && handleSort(col.key)}
                            className={`px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${!['numero_tarjeta', 'estado'].includes(col.key) ? 'cursor-pointer hover:text-[#A30C5A]' : ''}`}
                          >
                            <div className="flex items-center gap-2">
                              <col.icon size={14} />
                              {col.label}
                              {!['numero_tarjeta', 'estado'].includes(col.key) && <SortIcon field={col.key} />}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filtered.map((reg) => (
                        <tr key={reg.id} className="hover:bg-pink-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{background: 'linear-gradient(135deg, #A30C5A, #c4106e)'}}>
                                {reg.nombre?.charAt(0)?.toUpperCase()}
                              </div>
                              <span className="text-sm font-semibold text-[#333333]">{reg.nombre}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{reg.correo}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700">
                              <Building2 size={11} />
                              {reg.empresa}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm text-[#333333]">{reg.numero_tarjeta}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {new Date(reg.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            {reg.estado === 'Entregado' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                <Coffee size={11} />
                                Entregado
                              </span>
                            ) : (
                              <button
                                onClick={() => handleEntregarCafe(reg.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#A30C5A]/10 text-[#A30C5A] hover:bg-[#A30C5A] hover:text-white transition-colors"
                              >
                                <Coffee size={11} />
                                Entregar café
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tarjetas — solo mobile */}
                <div className="md:hidden divide-y divide-gray-100">
                  {filtered.map((reg) => (
                    <div key={reg.id} className="p-4 hover:bg-pink-50/20 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{background: 'linear-gradient(135deg, #A30C5A, #c4106e)'}}>
                            {reg.nombre?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#333333]">{reg.nombre}</p>
                            <p className="text-xs text-gray-400">{reg.correo}</p>
                          </div>
                        </div>
                        {reg.estado === 'Entregado' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex-shrink-0">
                            <Coffee size={10} />
                            Entregado
                          </span>
                        ) : (
                          <button
                            onClick={() => handleEntregarCafe(reg.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#A30C5A]/10 text-[#A30C5A] hover:bg-[#A30C5A] hover:text-white transition-colors flex-shrink-0"
                          >
                            <Coffee size={10} />
                            Entregar café
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 font-semibold">
                          <Building2 size={10} />
                          {reg.empresa}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-mono">
                          # {reg.numero_tarjeta}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                          <Calendar size={10} />
                          {new Date(reg.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
