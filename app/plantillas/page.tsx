import { templates, previewSVG } from '@/lib/templates';
import Link from 'next/link';

export default function Page(){
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Elige un diseño</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {templates.map(t => (
          <div key={t.slug} className="card hover:shadow-lg transition">
            <div className="mb-4">
              <div className="thumbnail" dangerouslySetInnerHTML={{__html: previewSVG(t)}} />
            </div>
            <h3 className="font-medium">{t.name}</h3>
            <p className="text-sm text-gray-600 mt-1 mb-4">{t.note || 'Plantilla de factura'}</p>
            <Link href={`/editor?tpl=${t.slug}`} className="btn btn-primary">Usar este diseño</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
