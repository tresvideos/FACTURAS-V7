'use client';
import { create } from 'zustand';

export type Item = { description: string; qty: number; price: number; tax: number };
export type Invoice = {
  id: string;
  number: string;
  title: string;
  seller: { name: string; taxId: string; address?: string; email?: string; phone?: string; website?: string; iban?: string; logo?: string; };
  buyer: { name: string; address?: string; email?: string; taxId?: string };
  items: Item[];
  subtotal: number;
  taxTotal: number;
  total: number;
  notes?: string;
  createdAt: string;
  paid050: boolean;
  theme?: string;
};

type State = {
  invoices: Invoice[];
  saveInvoice: (inv: Invoice) => void;
  updateInvoice: (inv: Invoice) => void;
  markPaid: (id: string) => void;
  removeInvoice: (id: string) => void;
};

const key = 'fsd-state-v6';
function load(){ if(typeof window==='undefined') return {invoices:[]}; try{ return JSON.parse(localStorage.getItem(key)||'{}'); }catch{ return {}; }}

export const useApp = create<State>((set,get)=> ({
  invoices: load().invoices || [],
  saveInvoice(inv){ const list=[...get().invoices]; list.unshift(inv); set({invoices:list}); if(typeof window!=='undefined'){ const s={...load(), invoices:list}; localStorage.setItem(key, JSON.stringify(s)); } },
  updateInvoice(inv){ const list=get().invoices.map(i=>i.id===inv.id?inv:i); set({invoices:list}); if(typeof window!=='undefined'){ const s={...load(), invoices:list}; localStorage.setItem(key, JSON.stringify(s)); } },
  markPaid(id){ const list=get().invoices.map(i=>i.id===id?{...i,paid050:true}:i); set({invoices:list}); if(typeof window!=='undefined'){ const s={...load(), invoices:list}; localStorage.setItem(key, JSON.stringify(s)); } },
  removeInvoice(id){ const list=get().invoices.filter(i=>i.id!==id); set({invoices:list}); if(typeof window!=='undefined'){ const s={...load(), invoices:list}; localStorage.setItem(key, JSON.stringify(s)); } }
}));
