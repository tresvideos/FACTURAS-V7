export default function Footer(){
  return (
    <footer className="border-t mt-16">
      <div className="container py-10 footer flex items-center justify-between">
        <p>© {new Date().getFullYear()} FacturaKit. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          <a className="hover:text-brand-600" href="#">Términos</a>
          <a className="hover:text-brand-600" href="#">Privacidad</a>
        </div>
      </div>
    </footer>
  );
}
