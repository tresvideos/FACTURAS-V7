import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'FacturaKit v6 — Plantillas de Factura',
  description: 'Crea facturas con tu logo y descárgalas en PDF — sin login.'
};

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="es">
      <body>
        <Header/>
        <main className="container py-10 hero">{children}</main>
        <Footer/>
      </body>
    </html>
  );
}
