'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useApp } from '@/lib/store';
import { PDFViewer } from '@react-pdf/renderer';
import InvoicePDF from '@/components/InvoicePDF';
import Link from 'next/link';

export default function Preview(){
  const { id } = useParams() as { id: string };
  const { invoices } = useApp();
  const inv = invoices.find(i => i.id === id);
  const router = useRouter();
  useEffect(()=>{ if(!inv){ router.replace('/dashboard'); } },[inv, router]);
  if(!inv) return null;
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Previsualización — {inv.number}</h1>
        <Link href="/dashboard" className="btn btn-ghost">Volver</Link>
      </div>
      <div className="rounded-xl overflow-hidden border">
        <PDFViewer width="100%" height={800} showToolbar={true}>
          <InvoicePDF inv={inv} />
        </PDFViewer>
      </div>
    </div>
  );
}
