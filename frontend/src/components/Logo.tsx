interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const TAMANHOS: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'h-8 w-auto',
  md: 'h-12 w-auto',
  lg: 'h-20 w-auto',
  xl: 'w-full max-w-[160px] h-auto mx-auto',
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  return (
    <img
      src="/logo-aerocode.png"
      alt="Aerocode"
      className={`${TAMANHOS[size]} object-contain select-none ${className}`}
      draggable={false}
    />
  )
}
