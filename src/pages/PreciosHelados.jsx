import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ExternalLink, IceCream, AlertCircle } from 'lucide-react'

export default function PreciosHelados() {
  const [lista, setLista] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActiva = async () => {
      setLoading(true)
      // Trae la lista marcada como activa; si no hay, la más reciente.
      let { data } = await supabase
        .from('precios_listas')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false })
        .limit(1)

      if (!data || data.length === 0) {
        const fallback = await supabase
          .from('precios_listas')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
        data = fallback.data
      }

      setLista(data && data.length > 0 ? data[0] : null)
      setLoading(false)
    }
    fetchActiva()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #A30C5A 0%, #7d0945 100%)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    )
  }

  if (!lista) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: 'linear-gradient(135deg, #A30C5A 0%, #7d0945 50%, #1a0012 100%)' }}>
        <img src="/logo.png" alt="Opel Market" className="w-48 mb-6" />
        <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-md">
          <AlertCircle size={40} className="mx-auto mb-3 text-[#E2B52C]" />
          <p className="text-white font-semibold text-lg">Aún no hay un listado de precios disponible</p>
          <p className="text-white/60 text-sm mt-2">Vuelve a escanear el código más tarde.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Barra superior branded */}
      <header className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-md" style={{ background: 'linear-gradient(135deg, #A30C5A, #7d0945)' }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <IceCream size={22} className="text-[#E2B52C] flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-white font-bold text-sm sm:text-base leading-tight truncate">Precios Helados</h1>
            <p className="text-white/60 text-xs truncate">{lista.nombre}</p>
          </div>
        </div>
        <a
          href={lista.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #E2B52C, #c99a1a)', color: 'white' }}
        >
          <ExternalLink size={15} />
          Abrir PDF
        </a>
      </header>

      {/* Visor del PDF */}
      <div className="flex-1 relative">
        <object data={`${lista.pdf_url}#view=FitH`} type="application/pdf" className="absolute inset-0 w-full h-full">
          <iframe src={lista.pdf_url} title={lista.nombre} className="absolute inset-0 w-full h-full border-0" />
          <div className="flex flex-col items-center justify-center h-full px-6 text-center text-gray-600">
            <p className="font-medium mb-3">No se pudo mostrar el PDF en el navegador.</p>
            <a
              href={lista.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #A30C5A, #c4106e)' }}
            >
              <ExternalLink size={16} />
              Abrir listado de precios
            </a>
          </div>
        </object>
      </div>
    </div>
  )
}
