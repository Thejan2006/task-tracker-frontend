import Link from 'next/link';

export function BrandLogo({ href = '/', compact = false }: { href?: string; compact?: boolean }) {
  return <Link href={href} className="inline-flex items-center gap-2.5 text-[1.1rem] font-bold tracking-[-0.03em]"><span className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl border border-white/20 bg-[#11142c] shadow-neon"><img src="/taskflow-logo.png" alt="Taskflow" className="h-full w-full object-cover" /></span>{!compact && <span>Taskflow</span>}</Link>;
}
