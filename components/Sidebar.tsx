'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar(){
  const p = usePathname();
  return (
    <aside className="sidebar">
      <div className="text-xs uppercase text-gray-500 mb-2">Mi cuenta</div>
      <Link href="/dashboard" className={p==='/dashboard' ? 'active' : ''}>Facturas</Link>
      <Link href="/dashboard/suscripcion" className={p?.startsWith('/dashboard/suscripcion') ? 'active' : ''}>Suscripción</Link>
      <Link href="/instrucciones" className={p?.startsWith('/instrucciones') ? 'active' : ''}>Instrucciones</Link>
      <div className="text-xs uppercase text-gray-500 mt-4 mb-2">Soporte</div>
      <a href="#" className="">Centro de ayuda</a>
    </aside>
  );
}
