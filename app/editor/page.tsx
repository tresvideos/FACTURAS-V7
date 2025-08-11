'use client';
export const dynamic = 'force-dynamic';

import React, { Suspense, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp, type Item } from '@/lib/store';
import { calcTotals } from '@/lib/calc';
import { PDFViewer } from '@react-pdf/renderer';
import InvoicePDF from '@/components/InvoicePDF';

function newId(){ return Math.random().toString(36).slice(2); }

function EditorInner(){
  const params = useSearchParams();
  const router = useRouter();
  const tpl = params.get('tpl') || 'minimal';
  const { saveInvoice } = useApp();

  const [title, setTitle] = useState('Factura 1');
  const [number, setNumber] = useState('F-0001');
  const [sellerName, setSellerName] = useState('Mi Empresa SL');
  const [sellerTax, setSellerTax] = useState('B12345678');
  const [sellerAddr, setSellerAddr] = useState('C/ Ejemplo 123, Barcelona');
  const [sellerEmail, setSellerEmail] = useState('hola@miempresa.com');
  const [sellerPhone, setSellerPhone] = useState('+34 600 000 000');
  const [sellerWeb, setSellerWeb] = useState('https://miempresa.com');
  const [sellerIBAN, setSellerIBAN] = useState('ES12 3456 7890 1234 5678 9012');
  const [sellerLogo, setSellerLogo] = useState<string | undefined>(undefined);

  const [buyerName, setBuyerName] = useState('Cliente Ejemplo');
  const [buyerAddr, setBuyerAddr] = useState('C/ Cliente 99, Madrid');
  const [buyerEmail, setBuyerEmail] = useState('cliente@ejemplo.com');
  const [buyerTax, setBuyerTax] = useState('X1234567Y');

  const [items, setItems] = useState<Item[]>([{ description:'Servicio', qty:1, price:100, tax:21 }]);
  const [notes, setNotes] = useState('Gracias por su confianza.');
  const totals = useMemo(()=>calcTotals(items),[items]);

  function setItem(i:number, patch: Partial<Item>){
    setItems(prev => prev.map((it,idx)=> idx===i ? {...it, ...patch} : it));
  }
  function addItem(){ setItems(prev=> [...prev, { description:'', qty:1, price:0, tax:21 }]); }
  function delItem(i:number){ setItems(prev => prev.filter((_,idx)=> idx!==i)); }

  function onLogoChange(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0]; if(!f) return;
    const reader = new FileReader();
    reader.onload = () => setSellerLogo(reader.result as string);
    reader.readAsDataURL(f);
  }

  const inv = {
    id: newId(), number, title,
    seller: { name: sellerName, taxId: sellerTax, address: sellerAddr, email: sellerEmail, phone: sellerPhone, website: sellerWeb, iban: sellerIBAN, logo: sellerLogo },
    buyer: { name: buyerName, address: buyerAddr, email: buyerEmail, taxId: buyerTax },
    items, ...totals,
    notes,
    createdAt: new Date().toISOString(),
    paid050: false,
    theme: tpl
  };

  function handleSave(){ saveInvoice(inv as any); router.push(`/dashboard`); }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-semibold">Editor — <span className="text-brand-600">{tpl}</span></h1>
          <Link href="/plantillas" className="text-sm text-brand-600 hover:underline">Cambiar diseño</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="label col-span-2">Título<input className="input" value={title} onChange={e=>setTitle(e.target.value)}/></label>
          <label className="label">Número<input className="input" value={number} onChange={e=>setNumber(e.target.value)}/></label>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-6">
          <div>
            <h2 className="font-medium mb-2">Emisor</h2>
            <label className="label">Nombre<input className="input" value={sellerName} onChange={e=>setSellerName(e.target.value)}/></label>
            <label className="label">CIF/NIF<input className="input" value={sellerTax} onChange={e=>setSellerTax(e.target.value)}/></label>
            <label className="label">Dirección<input className="input" value={sellerAddr} onChange={e=>setSellerAddr(e.target.value)}/></label>
            <label className="label">Email<input className="input" value={sellerEmail} onChange={e=>setSellerEmail(e.target.value)}/></label>
            <label className="label">Teléfono<input className="input" value={sellerPhone} onChange={e=>setSellerPhone(e.target.value)}/></label>
            <label className="label">Web<input className="input" value={sellerWeb} onChange={e=>setSellerWeb(e.target.value)}/></label>
            <label className="label">IBAN<input className="input" value={sellerIBAN} onChange={e=>setSellerIBAN(e.target.value)}/></label>
            <label className="label">Logo
              <input type="file" accept="image/*" onChange={onLogoChange} className="mt-1" />
            </label>
            {sellerLogo && <img src={sellerLogo} alt="Logo preview" className="mt-2 h-12 object-contain" />}
          </div>
          <div>
            <h2 className="font-medium mb-2">Cliente</h2>
            <label className="label">Nombre<input className="input" value={buyerName} onChange={e=>setBuyerName(e.target.value)}/></label>
            <label className="label">Dirección<input className="input" value={buyerAddr} onChange={e=>setBuyerAddr(e.target.value)}/></label>
            <label className="label">Email<input className="input" value={buyerEmail} onChange={e=>setBuyerEmail(e.target.value)}/></label>
            <label className="label">CIF/NIF<input className="input" value={buyerTax} onChange={e=>setBuyerTax(e.target.value)}/></label>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="font-medium mb-2">Conceptos</h2>
          <div className="space-y-3">
            {items.map((it, i)=> (
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

        <div className="mt-4">
          <h2 className="font-medium mb-2">Notas</h2>
          <textarea className="textarea" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Información adicional, agradecimiento, condiciones, etc."/>
        </div>

        <div className="mt-6 flex gap-3">
          <button className="btn btn-primary" onClick={handleSave}>Guardar en mi panel</button>
          <Link className="btn btn-ghost" href="/dashboard">Volver</Link>
        </div>
      </div>

      <div className="card">
        <h2 className="font-medium mb-3">Previsualización PDF</h2>
        <div className="rounded-xl overflow-hidden border">
          <PDFViewer width="100%" height={700} showToolbar={false}>
            <InvoicePDF inv={inv} />
          </PDFViewer>
        </div>
        <p className="text-xs text-gray-500 mt-2">Así se verá tu factura al descargarla.</p>
      </div>
    </div>
  );
}

export default function Page(){
  return (
    <Suspense fallback={<div className="card">Cargando editor…</div>}>
      <EditorInner/>
    </Suspense>
  );
}
