import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import QRCodeStyling from 'qr-code-styling'
import {
  FileText, Menu, X, RefreshCw, Upload, Trash2, ExternalLink,
  CheckCircle, Circle, Calendar, QrCode, Download, AlertCircle
} from 'lucide-react'
import Sidebar from '../components/Sidebar'

const BUCKET = 'precios-helados'
const PUBLIC_URL = 'https://www.opelmarket.shop/precios-helados'

const qrCode = new QRCodeStyling({
  width: 280,
  height: 280,
  type: 'canvas',
  data: PUBLIC_URL,
  image: '/logo.png',
  dotsOptions: { color: '#A30C5A', type: 'rounded' },
  cornersSquareOptions: { color: '#7d0945', type: 'extra-rounded' },
  cornersDotOptions: { color: '#E2B52C', type: 'dot' },
  backgroundOptions: { color: '#ffffff' },
  imageOptions: { crossOrigin: 'anonymous', margin: 6, imageSize: 0.3 },
})

export default function PreciosAdmin() {
  const [listas, setListas] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [nombre, setNombre] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const qrRef = useRef(null)

  const fetchListas = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('precios_listas')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setListas(data || [])
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    fetchListas()
  }, [])

  useEffect(() => {
    if (qrRef.current) {
      qrRef.current.innerHTML = ''
      qrCode.append(qrRef.current)
    }
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    setError('')
    if (!file) {
      setError('Selecciona un archivo PDF.')
      return
    }
    if (file.type !== 'application/pdf') {
      setError('El archivo debe ser un PDF.')
      return
    }
    setUploading(true)

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    const path = `${Date.now()}-${safeName}`

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: 'application/pdf', upsert: false })

    if (upErr) {
      setError('Error al subir el archivo: ' + upErr.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)

    const esPrimera = listas.length === 0
    const { error: insErr } = await supabase.from('precios_listas').insert([{
      nombre: nombre.trim() || file.name.replace(/\.pdf$/i, ''),
      pdf_url: urlData.publicUrl,
      pdf_path: path,
      activo: esPrimera, // la primera lista queda activa automáticamente
    }])

    if (insErr) {
      setError('Error al guardar el registro: ' + insErr.message)
      setUploading(false)
      return
    }

    setNombre('')
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setUploading(false)
    fetchListas()
  }

  const handleActivar = async (id) => {
    await supabase.from('precios_listas').update({ activo: false }).eq('activo', true)
    const { error } = await supabase.from('precios_listas').update({ activo: true }).eq('id', id)
    if (!error) {
      setListas(prev => prev.map(l => ({ ...l, activo: l.id === id })))
    }
  }

  const handleEliminar = async (lista) => {
    if (!window.confirm(`¿Eliminar el listado "${lista.nombre}"? Esta acción no se puede deshacer.`)) return
    await supabase.storage.from(BUCKET).remove([lista.pdf_path])
    const { error } = await supabase.from('precios_listas').delete().eq('id', lista.id)
    if (!error) {
      setListas(prev => prev.filter(l => l.id !== lista.id))
    }
  }

  const downloadQR = () => {
    qrCode.download({ name: 'qr-opelmarket-precios-helados', extension: 'png' })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 min-h-screen flex-col shadow-xl" style={{ background: 'linear-gradient(180deg, #6b0a3a 0%, #3d0622 100%)' }}>
        <Sidebar user={user} active="precios" />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 flex flex-col shadow-2xl" style={{ background: 'linear-gradient(180deg, #6b0a3a 0%, #3d0622 100%)' }}>
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white">
              <X size={22} />
            </button>
            <Sidebar user={user} active="precios" onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
              <Menu size={22} />
            </button>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-[#333333]">Listado de Precios</h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-0.5 hidden sm:block">Sube los listados de precios en PDF y gestiona el activo</p>
            </div>
          </div>
          <button
            onClick={fetchListas}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all hover:shadow-md whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #A30C5A, #c4106e)', color: 'white' }}
          >
            <RefreshCw size={15} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

            {/* QR fijo */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
              <div className="flex items-center gap-2 self-start mb-4">
                <QrCode size={18} className="text-[#A30C5A]" />
                <h2 className="font-bold text-[#333333]">Código QR fijo</h2>
              </div>
              <div ref={qrRef} className="mb-4" />
              <p className="text-xs text-gray-400 text-center mb-1">Este QR nunca cambia.</p>
              <p className="text-xs text-gray-500 text-center break-all mb-4 font-mono">{PUBLIC_URL}</p>
              <button
                onClick={downloadQR}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm w-full justify-center"
                style={{ background: 'linear-gradient(135deg, #E2B52C, #c99a1a)', color: 'white' }}
              >
                <Download size={15} />
                Descargar QR (PNG)
              </button>
            </div>

            {/* Subir nuevo listado */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Upload size={18} className="text-[#A30C5A]" />
                <h2 className="font-bold text-[#333333]">Subir nuevo listado</h2>
              </div>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500">Nombre del listado</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Precios Helados — Junio 2026"
                    className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#A30C5A] focus:ring-2 focus:ring-[#A30C5A]/10 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Archivo PDF</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="mt-1 w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#A30C5A]/10 file:text-[#A30C5A] hover:file:bg-[#A30C5A]/20 file:cursor-pointer cursor-pointer"
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #A30C5A, #c4106e)' }}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload size={15} />
                      Subir listado
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-400">El listado marcado como <span className="font-semibold text-[#A30C5A]">Activo</span> es el que verán quienes escaneen el QR.</p>
              </form>
            </div>
          </div>

          {/* Tabla de listados */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-[#333333]">Listados subidos</h2>
              <span className="text-xs sm:text-sm text-gray-400 font-medium">{listas.length} listados</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#A30C5A] border-t-transparent"></div>
              </div>
            ) : listas.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <FileText size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No hay listados subidos</p>
                <p className="text-sm mt-1">Sube tu primer PDF de precios arriba</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {listas.map((lista) => (
                      <tr key={lista.id} className="hover:bg-pink-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#A30C5A15' }}>
                              <FileText size={16} className="text-[#A30C5A]" />
                            </div>
                            <span className="text-sm font-semibold text-[#333333]">{lista.nombre}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar size={13} />
                            {new Date(lista.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {lista.activo ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              <CheckCircle size={12} />
                              Activo
                            </span>
                          ) : (
                            <button
                              onClick={() => handleActivar(lista.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 hover:bg-[#A30C5A]/10 hover:text-[#A30C5A] transition-colors"
                            >
                              <Circle size={12} />
                              Marcar activo
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={lista.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#A30C5A] hover:bg-[#A30C5A]/10 transition-colors"
                            >
                              <ExternalLink size={13} />
                              Ver PDF
                            </a>
                            <button
                              onClick={() => handleEliminar(lista)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={13} />
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
