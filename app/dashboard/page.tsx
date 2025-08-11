'use client';
import Sidebar from '@/components/Sidebar';
import { useApp } from '@/lib/store';
import Link from 'next/link';

export default function Dashboard(){
  const { invoices, markPaid, removeInvoice } = useApp();

  async function download(inv: any){
    if(!inv.paid050){
      const ok = confirm('Demo de pago: se simulará un cobro de 0,50€ y luego podrás descargar. ¿Continuar?');
      if(!ok) return;
      markPaid(inv.id);
      alert('Pago demo realizado. (No es un cobro real)');
    }
    const res = await fetch('/api/pdf', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(inv)});
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${inv.number}.pdf`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      <Sidebar/>
      <div className="col-span-3 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Mis facturas</h1>
          <Link href="/plantillas" className="btn btn-primary">Crear nueva factura</Link>
        </div>
        {invoices.length===0 ? (
          <div className="card">
            <p className="text-gray-600">Aún no tienes facturas. Crea la primera desde «Plantillas».</p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Número</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Diseño</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv=> (
                  <tr key={inv.id} className="border-b last:border-0">
                    <td className="py-2">{inv.number}</td>
                    <td>{inv.buyer.name}</td>
                    <td>{inv.total.toFixed(2)} €</td>
                    <td>{inv.theme || 'minimal'}</td>
                    <td>{inv.paid050 ? 'Pagada 0,50€ (demo)' : 'Pendiente'}</td>
                    <td className="text-right space-x-2">
                      <Link className="btn btn-ghost" href={`/preview/${inv.id}`}>Preview</Link>
                      <Link className="btn btn-ghost" href={`/edit/${inv.id}`}>Editar</Link>
                      <button className="btn btn-ghost" onClick={()=>download(inv)}>Descargar</button>
                      <button className="btn btn-ghost" onClick={()=>removeInvoice(inv.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
