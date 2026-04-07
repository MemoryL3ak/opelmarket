import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { User, Mail, Building2, Ticket, CheckCircle, AlertCircle, ShoppingBasket } from 'lucide-react'

export default function PublicForm() {
  const [form, setForm] = useState({ nombre: '', correo: '', empresa: '', numero_tarjeta: '', conocia_opelmarket: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'numero_tarjeta') {
      const cleaned = value.replace(/\D/g, '')
      const num = parseInt(cleaned, 10)
      if (cleaned === '' || (num >= 1 && num <= 4000)) {
        setForm(prev => ({ ...prev, [name]: cleaned }))
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!form.conocia_opelmarket) {
      setError('Por favor indica si conocías OpelMarket.')
      setLoading(false)
      return
    }

    const { data: existing } = await supabase
      .from('registrations')
      .select('nombre, correo, numero_tarjeta')
      .or(`nombre.ilike.${form.nombre},correo.ilike.${form.correo},numero_tarjeta.eq.${form.numero_tarjeta}`)

    if (existing && existing.length > 0) {
      const dup = existing[0]
      if (dup.nombre.toLowerCase() === form.nombre.toLowerCase()) {
        setError('Ya existe un registro con ese nombre.')
      } else if (dup.correo.toLowerCase() === form.correo.toLowerCase()) {
        setError('Ya existe un registro con ese correo electrónico.')
      } else {
        setError('Ya existe un registro con ese número de flyer.')
      }
      setLoading(false)
      return
    }

    const payload = {
      nombre: form.nombre,
      correo: form.correo,
      empresa: form.empresa,
      numero_tarjeta: form.numero_tarjeta,
      conocia_opelmarket: form.conocia_opelmarket === 'si',
      estado: 'Ingresado'
    }

    const { error: err } = await supabase.from('registrations').insert([payload])

    if (err) {
      setError('Ocurrió un error al enviar el formulario. Intenta nuevamente.')
    } else {
      setSuccess(true)
      setForm({ nombre: '', correo: '', empresa: '', numero_tarjeta: '', conocia_opelmarket: '' })
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
    <div className="min-h-screen flex" style={{background: 'linear-gradient(135deg, #A30C5A 0%, #7d0945 50%, #1a0012 100%)'}}>
      {/* Left decorative panel — solo desktop */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-[#E2B52C]"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#E2B52C] opacity-50"></div>
        </div>
        <div className="relative z-10 text-center text-white">
          <div className="flex items-center justify-center mb-8">
            <img src="/logo.png" alt="Opel Market" className="w-72 " />
          </div>
          <p className="text-xl text-white/70 mt-4 max-w-sm leading-relaxed">
            Regístrate y accede a nuestros beneficios
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4">
            {['Seguro', 'Rápido', 'Confiable', 'Fácil'].map((item) => (
              <div key={item} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-white/80 font-medium text-sm">
                ✓ {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Logo mobile — sobre fondo blanco */}
            <div className="flex justify-center lg:hidden">
              <img src="/logo.png" alt="Opel Market" className="w-64" style={{marginTop: '-28px', marginBottom: '-28px'}} />
            </div>
            {/* Header */}
            <div className="px-6 sm:px-8 pt-5 pb-6 mt-4" style={{background: 'linear-gradient(135deg, #A30C5A, #c4106e)'}}>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Registro de Beneficio</h2>
              <p className="text-white/70 text-sm mt-1">Completa tus datos para continuar</p>
            </div>

            {/* Form body */}
            <div className="px-6 sm:px-8 py-6 sm:py-8">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={40} className="text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-[#333333] mb-2">¡Registro exitoso!</h3>
                  <p className="text-gray-500 text-sm mb-6">Tu información ha sido guardada correctamente.</p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="px-6 py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                    style={{background: 'linear-gradient(135deg, #A30C5A, #c4106e)'}}
                  >
                    Registrar otro
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {/* Nombre */}
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2 uppercase tracking-wide">Nombre completo</label>
                    <div className="relative">
                      <User size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'nombre' ? 'text-[#A30C5A]' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        onFocus={() => setFocused('nombre')}
                        onBlur={() => setFocused('')}
                        required
                        placeholder="Juan Pérez"
                        className={inputClass('nombre')}
                      />
                    </div>
                  </div>

                  {/* Correo */}
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2 uppercase tracking-wide">Correo electrónico</label>
                    <div className="relative">
                      <Mail size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'correo' ? 'text-[#A30C5A]' : 'text-gray-400'}`} />
                      <input
                        type="email"
                        name="correo"
                        value={form.correo}
                        onChange={handleChange}
                        onFocus={() => setFocused('correo')}
                        onBlur={() => setFocused('')}
                        required
                        placeholder="juan@empresa.com"
                        className={inputClass('correo')}
                        inputMode="email"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Empresa */}
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2 uppercase tracking-wide">Empresa</label>
                    <div className="relative">
                      <Building2 size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'empresa' ? 'text-[#A30C5A]' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        name="empresa"
                        value={form.empresa}
                        onChange={handleChange}
                        onFocus={() => setFocused('empresa')}
                        onBlur={() => setFocused('')}
                        required
                        placeholder="Mi Empresa S.A."
                        className={inputClass('empresa')}
                      />
                    </div>
                  </div>

                  {/* Tarjeta */}
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2 uppercase tracking-wide">N° de Flyer</label>
                    <div className="relative">
                      <Ticket size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'numero_tarjeta' ? 'text-[#A30C5A]' : 'text-gray-400'}`} />
                      <input
                        type="number"
                        name="numero_tarjeta"
                        value={form.numero_tarjeta}
                        onChange={handleChange}
                        onFocus={() => setFocused('numero_tarjeta')}
                        onBlur={() => setFocused('')}
                        required
                        min="1"
                        max="4000"
                        placeholder="Ej: 245"
                        className={inputClass('numero_tarjeta')}
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                  {/* ¿Conocías OpelMarket? */}
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-3 uppercase tracking-wide">¿Conocías OpelMarket?</label>
                    <div className="flex gap-3">
                      {[{ value: 'si', label: 'Sí' }, { value: 'no', label: 'No' }].map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, conocia_opelmarket: value }))}
                          className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200 ${
                            form.conocia_opelmarket === value
                              ? 'border-[#A30C5A] bg-[#A30C5A] text-white shadow-[0_0_0_4px_rgba(163,12,90,0.12)]'
                              : 'border-gray-200 text-gray-500 hover:border-[#CCCCCC] bg-white'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl text-sm">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-2"
                    style={{background: 'linear-gradient(135deg, #A30C5A, #c4106e)'}}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Enviando...
                      </span>
                    ) : 'Registrar'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
