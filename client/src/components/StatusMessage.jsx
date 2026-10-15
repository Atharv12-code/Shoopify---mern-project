function StatusMessage({ message, type = 'error' }) {
  if (!message) return null

  const isError = type === 'error'

  return (
    <div 
      className={`p-3.5 rounded-xl border text-sm font-sans flex items-start gap-2.5 transition-all ${
        isError 
          ? 'bg-[#C2331F]/10 border-[#C2331F]/30 text-[#C2331F]' 
          : 'bg-[#0B7A4B]/10 border-[#0B7A4B]/30 text-[#0B7A4B]'
      }`} 
      role={isError ? 'alert' : 'status'}
    >
      <span aria-hidden="true" className="tabular-nums font-bold text-base leading-none">
        {isError ? '!' : '✓'}
      </span>
      <span className="leading-snug">{message}</span>
    </div>
  )
}

export default StatusMessage
