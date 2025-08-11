export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from '@/components/InvoicePDF';

export async function POST(req: NextRequest) {
  const inv = await req.json();
  const pdfBuffer = await pdf(<InvoicePDF inv={inv} />).toBuffer();
  return new NextResponse(pdfBuffer as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${inv.number}.pdf"`
    }
  });
}
