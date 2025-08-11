'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useApp, type Item, type Invoice } from '@/lib/store';
import { calcTotals } from '@/lib/calc';
import Link from 'next/link';

export default function EditPage(){
  const { id } = useParams() as { id: string };
  const { invoices, updateInvoice } = useApp();
  const found = invoices.find(i=>i.id===id);
  const router = useRouter();
  useEffect(()=>{ if(!found){ router.replace('/dashboard'); } },[found,router]);
  if(!found) return null;

  const [inv, setInv] = useState<Invoice>(found);
  const totals = useMemo(()=>calcTotals(inv.items),[inv.items]);

  function setItem(i:number, patch: Partial<Item>){
    setInv(prev => ({...prev, items: prev.items.map((it,idx)=> idx===i ? {...it, ...patch} : it)}));
  }
  function addItem(){ setInv(prev=> ({...prev, items:[...prev.items, { description:'', qty:1, price:0, tax:21 }]})); }
  function delItem(i:number){ setInv(prev=> ({...prev, items: prev.items.filter((_,idx)=> idx!==i)})); }

  function save(){
    updateInvoice({ ...inv, ...totals });
    router.push('/dashboard');
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-semibold">Editar — {inv.number}</h1>
        <Link href="/dashboard" className="btn btn-ghost">Volver</Link>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label className="label">Título<input className="input" value={inv.title} onChange={e=>setInv({...inv, title:e.target.value})}/></label>
        <label className="label">Número<input className="input" value={inv.number} onChange={e=>setInv({...inv, number:e.target.value})}/></label>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-6">
        <div>
          <h2 className="font-medium mb-2">Emisor</h2>
          <label className="label">Nombre<input className="input" value={inv.seller.name} onChange={e=>setInv({...inv, seller:{...inv.seller, name:e.target.value}})}/></label>
          <label className="label">CIF/NIF<input className="input" value={inv.seller.taxId} onChange={e=>setInv({...inv, seller:{...inv.seller, taxId:e.target.value}})}/></label>
          <label className="label">Dirección<input className="input" value={inv.seller.address||''} onChange={e=>setInv({...inv, seller:{...inv.seller, address:e.target.value}})}/></label>
        </div>
        <div>
          <h2 className="font-medium mb-2">Cliente</h2>
          <label className="label">Nombre<input className="input" value={inv.buyer.name} onChange={e=>setInv({...inv, buyer:{...inv.buyer, name:e.target.value}})}/></label>
          <label className="label">Dirección<input className="input" value={inv.buyer.address||''} onChange={e=>setInv({...inv, buyer:{...inv.buyer, address:e.target.value}})}/></label>
        </div>
      </div>
      <div className="mt-4">
        <h2 className="font-medium mb-2">Conceptos</h2>
        <div className="space-y-3">
          {inv.items.map((it, i)=> (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-6">
                <label className="label">Descripción<input className="input" value={it.description} onChange={e=>setItem(i,{description:e.target.value})}/></label>
              </div>
              <div className="col-span-2">
                <label className="label">Cant.<input type="number" className="input" value={it.qty} onChange={e=>setItem(i,{qty:+e.target.value})}/></label>
              </div>
              <div className="col-span-2">
                <label className="label">Precio<input type="number" className="input" value={it.price} onChange={e=>setItem(i,{price:+e.target.value})}/></label>
              </div>
              <div className="col-span-2">
                <label className="label">% IVA<input type="number" className="input" value={it.tax} onChange={e=>setItem(i,{tax:+e.target.value})}/></label>
              </div>
              <button onClick={()=>delItem(i)} className="justify-self-end text-sm text-red-600">Eliminar</button>
            </div>
          ))}
          <button className="btn btn-ghost" onClick={addItem}>+ Añadir concepto</button>
        </div>
      </div>
      <div className="mt-6">
        <button className="btn btn-primary" onClick={save}>Guardar cambios</button>
      </div>
    </div>
  );
}
