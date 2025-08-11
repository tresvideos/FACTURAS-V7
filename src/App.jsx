import React, { useEffect, useMemo, useRef, useState } from "react";

// --- Lightweight UI helpers (Tailwind-based) ---------------------------------
const Container = ({ className = "", children }) => (
  <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);
const Card = ({ className = "", children }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
);
const CardHeader = ({ title, subtitle, right, className = "" }) => (
  <div className={`flex items-start justify-between gap-4 p-5 ${className}`}>
    <div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {right}
  </div>
);
const CardBody = ({ className = "", children }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);
const Button = ({ children, className = "", variant = "primary", ...props }) => {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";
  const variants = {
    primary:
      "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900/20",
    secondary:
      "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-300",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-300",
    danger:
      "bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-600/20",
    outline:
      "border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 focus:ring-slate-300",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${className}`}
    {...props}
  />
);
const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${className}`}
    {...props}
  />
);
const Badge = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 ${className}`}>{children}</span>
);
const Divider = () => <div className="h-px w-full bg-slate-200" />;
const Modal = ({ open, onClose, title, children, wide = false }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className={`relative z-10 max-h-[85vh] overflow-auto rounded-2xl bg-white shadow-2xl ${wide ? "w-[960px]" : "w-[640px]"}`}>
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100">
            <span className="sr-only">Cerrar</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-600"><path fill="currentColor" d="M6.4 4.98 4.98 6.4 10.59 12l-5.6 5.6L6.4 19.98 12 14.41l5.6 5.57 1.41-1.41L13.41 12l5.6-5.6L17.6 4.98 12 10.59z"/></svg>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

// --- Utilities ----------------------------------------------------------------
const uid = () => Math.random().toString(36).slice(2);
const currency = (n) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(Number(n || 0));

// Fake avatars (initials)
const Avatar = ({ name }) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0].toUpperCase())
    .slice(0, 2)
    .join("");
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-semibold text-slate-700 shadow-inner">
      {initials || "?"}
    </div>
  );
};

// --- Auth (localStorage demo-only) --------------------------------------------
const LS_KEY = "invoice_saas_v7";
const getStore = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
};
const setStore = (obj) => localStorage.setItem(LS_KEY, JSON.stringify(obj));

function useAuth() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const s = getStore();
    if (s.currentUser) setUser(s.currentUser);
  }, []);
  const signup = (email, password) => {
    const s = getStore();
    if (!s.users) s.users = {};
    if (s.users[email]) throw new Error("Este correo ya está registrado.");
    s.users[email] = { email, password, invoices: [] };
    s.currentUser = { email };
    setStore(s);
    setUser({ email });
  };
  const login = (email, password) => {
    const s = getStore();
    if (!s.users || !s.users[email]) throw new Error("Usuario no encontrado.");
    if (s.users[email].password !== password) throw new Error("Contraseña incorrecta.");
    s.currentUser = { email };
    setStore(s);
    setUser({ email });
  };
  const logout = () => {
    const s = getStore();
    delete s.currentUser;
    setStore(s);
    setUser(null);
  };
  const getUserData = () => {
    const s = getStore();
    return s.users?.[user?.email] || null;
  };
  const setUserData = (updater) => {
    const s = getStore();
    if (!user) return;
    const data = s.users?.[user.email];
    s.users[user.email] = typeof updater === "function" ? updater(data) : updater;
    setStore(s);
  };
  return { user, signup, login, logout, getUserData, setUserData };
}

// --- Invoice primitives --------------------------------------------------------
const DEFAULT_ITEMS = [
  { id: uid(), description: "Servicio de diseño web", qty: 1, price: 950 },
  { id: uid(), description: "Mantenimiento mensual", qty: 1, price: 49.9 },
];
const TEMPLATES = [
  {
    id: "minimal",
    name: "Minimal",
    previewColor: "bg-slate-900",
    sample: {
      issuer: { name: "ClickLabs Digital Ventures S.L.", nif: "B12345678", address: "Av. Can Fontanals s/n, 08190 Sant Cugat del Vallès" },
      client: { name: "ACME Corp.", nif: "X1234567Y", address: "Calle Falsa 123, Madrid" },
      items: DEFAULT_ITEMS,
      notes: "Gracias por su confianza.",
    },
  },
  {
    id: "classic",
    name: "Clásica",
    previewColor: "bg-indigo-600",
    sample: {
      issuer: { name: "SaaS Facturas", nif: "B76543210", address: "C. Mayor 45, Barcelona" },
      client: { name: "Cliente de Ejemplo", nif: "00000000A", address: "Passeig de Gràcia 1, Barcelona" },
      items: [
        { id: uid(), description: "Consultoría SEM", qty: 5, price: 60 },
        { id: uid(), description: "Diseño banners", qty: 10, price: 15 },
      ],
      notes: "Pago por transferencia a ES12 3456 7890 1234 5678 9012.",
    },
  },
  {
    id: "modern",
    name: "Moderna",
    previewColor: "bg-emerald-600",
    sample: {
      issuer: { name: "Geosignal.mobi", nif: "B99887766", address: "Valencia Tech Park" },
      client: { name: "StartUp XYZ", nif: "Y7654321Z", address: "Remote" },
      items: [
        { id: uid(), description: "Suscripción anual", qty: 1, price: 399 },
        { id: uid(), description: "Onboarding", qty: 1, price: 99 },
      ],
      notes: "Incluye soporte prioritario 24/7.",
    },
  },
];

const calcTotals = (items) => {
  const subtotal = items.reduce((s, it) => s + Number(it.qty || 0) * Number(it.price || 0), 0);
  const taxes = subtotal * 0.21; // IVA 21% demo
  return { subtotal, taxes, total: subtotal + taxes };
};

// --- Header -------------------------------------------------------------------
function Header({ onGoto, user, onOpenContact }) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-900 text-white grid place-items-center font-bold">F</div>
            <span className="hidden text-sm font-semibold text-slate-900 sm:block">Facturas V7</span>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onGoto("home")} className="hidden sm:inline-flex">Inicio</Button>
            <Button variant="ghost" onClick={() => onGoto("templates")} className="hidden sm:inline-flex">Plantillas</Button>
            <Button variant="ghost" onClick={onOpenContact} className="hidden sm:inline-flex">Contacto</Button>
            {user ? (
              <Button onClick={() => onGoto("dashboard")}>Panel</Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => onGoto("login")}>Entrar</Button>
                <Button onClick={() => onGoto("signup")}>Crear cuenta</Button>
              </>
            )}
          </nav>
        </div>
      </Container>
    </header>
  );
}

// --- Home ---------------------------------------------------------------------
function Home({ onGoto }) {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white">
        <Container className="py-16 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Badge>Nuevo · V7</Badge>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Crea facturas bonitas en <span className="underline decoration-slate-300">segundos</span>
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                Límite de <span className="font-semibold">3 facturas gratis</span>. Luego, elige un plan. Sin tarjetas hasta que decidas.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => onGoto("signup")}>Empieza gratis</Button>
                <Button variant="secondary" onClick={() => onGoto("templates")}>Ver plantillas</Button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-slate-600">
                <div className="flex -space-x-3">
                  {["Ana Gómez", "Luis Pérez", "María Dev", "Sergio Sánchez"].map((n) => (
                    <div key={n} className="ring-2 ring-white rounded-full"><Avatar name={n} /></div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Stars value={5} />
                  <span>4.9/5 · 1.2k+ reseñas</span>
                </div>
              </div>
            </div>
            <div>
              <DashboardMockup />
            </div>
          </div>
        </Container>
      </section>

      {/* Reviews */}
      <section>
        <Container className="py-12">
          <h2 className="text-2xl font-bold text-slate-900">Qué dice la gente</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {[
              { name: "Marta Lozano", text: "En 2 minutos tenía mi factura con un diseño impecable.", rating: 5 },
              { name: "Carlos Ortega", text: "El límite gratis me permitió probar todo. Súper intuitivo.", rating: 5 },
              { name: "Lucía Fernández", text: "Las plantillas son modernas y profesionales.", rating: 4 },
            ].map((r) => (
              <Card key={r.name}>
                <CardBody>
                  <div className="flex items-center gap-3">
                    <Avatar name={r.name} />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{r.name}</p>
                      <Stars value={r.rating} />
                    </div>
                  </div>
                  <p className="mt-3 text-slate-700">“{r.text}”</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <Container>
          <Card className="overflow-hidden">
            <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-10">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Empieza hoy</h3>
                <p className="mt-2 text-slate-600">Crea tus primeras 3 facturas sin pagar nada. Cambia de plantilla cuando quieras.</p>
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button onClick={() => onGoto("signup")}>Crear cuenta</Button>
                <Button variant="outline" onClick={() => onGoto("login")}>Ya tengo cuenta</Button>
              </div>
            </div>
          </Card>
        </Container>
      </section>
    </>
  );
}

const Stars = ({ value = 5 }) => (
  <div className="flex">
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} viewBox="0 0 24 24" className={`h-4 w-4 ${i <= value ? "text-amber-400" : "text-slate-300"}`}>
        <path fill="currentColor" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ))}
  </div>
);

const DashboardMockup = () => (
  <div className="relative mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
    <div className="mb-3 flex items-center justify-between">
      <div className="text-sm font-semibold text-slate-900">Tus facturas</div>
      <Badge>Demo</Badge>
    </div>
    <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className="h-full w-1/2 rounded-full bg-slate-900" />
    </div>
    <div className="grid gap-3">
      {["#0001", "#0002"].map((n) => (
        <div key={n} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
          <div className="text-sm text-slate-600">Factura {n}</div>
          <div className="flex gap-2">
            <Button variant="ghost">Previsualizar</Button>
            <Button variant="secondary">Descargar</Button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- Templates Gallery ---------------------------------------------------------
function Templates({ onUseTemplate }) {
  return (
    <Container className="py-12">
      <h2 className="text-2xl font-bold text-slate-900">Previews de plantillas</h2>
      <p className="mt-2 text-slate-600">Datos falsos para que veas cómo quedarían tus facturas.</p>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {TEMPLATES.map((t) => (
          <Card key={t.id}>
            <CardHeader title={t.name} subtitle="Click para ampliar" right={<Badge>Demo</Badge>} />
            <CardBody>
              <div className={`mb-4 h-40 w-full rounded-xl ${t.previewColor} grid place-items-center text-white font-semibold`}>{t.name}</div>
              <InvoicePreview invoice={{ ...t.sample, number: "0001", date: new Date().toISOString().slice(0, 10) }} compact />
              <div className="mt-4 flex justify-end">
                <Button onClick={() => onUseTemplate(t.id)}>Usar esta plantilla</Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </Container>
  );
}

// --- Dashboard ----------------------------------------------------------------
function Dashboard({ auth, onOpenContact }) {
  const data = auth.getUserData();
  const invoices = data?.invoices || [];
  const limit = 3;
  const used = invoices.length;
  const percent = Math.min(100, Math.round((used / limit) * 100));
  const [tab, setTab] = useState("invoices");
  const [editing, setEditing] = useState(null); // id
  const [previewing, setPreviewing] = useState(null); // invoice object

  const createFromTemplate = (templateId) => {
    if (used >= limit) return alert("Has alcanzado el límite de 3 facturas gratis. Sube de plan para continuar.");
    const t = TEMPLATES.find((x) => x.id === templateId) || TEMPLATES[0];
    const invoice = {
      id: uid(),
      number: String(invoices.length + 1).padStart(4, "0"),
      date: new Date().toISOString().slice(0, 10),
      ...JSON.parse(JSON.stringify(t.sample)),
      templateId,
    };
    auth.setUserData((d) => ({ ...d, invoices: [invoice, ...invoices] }));
    setEditing(invoice.id);
  };

  const removeInvoice = (id) => {
    if (!confirm("¿Eliminar esta factura?")) return;
    const next = invoices.filter((i) => i.id !== id);
    auth.setUserData((d) => ({ ...d, invoices: next }));
  };

  return (
    <Container className="py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Panel</h2>
          <p className="text-slate-600">Bienvenido, <span className="font-medium">{auth.user.email}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onOpenContact}>Soporte</Button>
          <Button variant="secondary" onClick={auth.logout}>Salir</Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div className="flex gap-2">
            <TabBtn active={tab === "invoices"} onClick={() => setTab("invoices")}>Facturas</TabBtn>
            <TabBtn active={tab === "help"} onClick={() => setTab("help")}>Ayuda</TabBtn>
            <TabBtn active={tab === "account"} onClick={() => setTab("account")}>Cuenta</TabBtn>
          </div>
          {tab === "invoices" && (
            <div className="flex items-center gap-3">
              <Progress value={percent} label={`${Math.min(used, limit)}/${limit} (${percent}%)`} />
              <Button onClick={() => createFromTemplate("minimal")}>Nueva factura</Button>
            </div>
          )}
        </div>

        {/* Tabs content */}
        {tab === "invoices" && (
          <CardBody>
            {used === 0 ? (
              <EmptyInvoices onCreate={() => createFromTemplate("minimal")} />
            ) : (
              <div className="grid gap-4">
                {invoices.map((inv) => (
                  <InvoiceRow
                    key={inv.id}
                    invoice={inv}
                    onEdit={() => setEditing(inv.id)}
                    onPreview={() => setPreviewing(inv)}
                    onDelete={() => removeInvoice(inv.id)}
                  />
                ))}
              </div>
            )}
            {used >= limit && (
              <Card className="mt-6 border-amber-300 bg-amber-50">
                <CardBody>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-amber-900">Has alcanzado el límite gratuito de 3 facturas.</p>
                      <p className="text-sm text-amber-800">Actualiza tu cuenta para crear ilimitadas y quitar límites.</p>
                    </div>
                    <Button>Ver planes</Button>
                  </div>
                </CardBody>
              </Card>
            )}
          </CardBody>
        )}

        {tab === "help" && (
          <CardBody>
            <h3 className="text-lg font-semibold text-slate-900">Centro de ayuda</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <FaqItem q="¿Cómo descargo mi factura?" a="Haz clic en Previsualizar y usa el botón Imprimir/PDF o Descargar HTML." />
              <FaqItem q="¿Puedo cambiar de plantilla?" a="Sí, edita la factura y cambia de plantilla antes de descargar." />
              <FaqItem q="¿Cuál es el límite del plan gratis?" a="Puedes crear hasta 3 facturas. Luego podrás actualizar a un plan de pago." />
              <FaqItem q="¿Cómo contacto con soporte?" a="Usa el enlace 'Contacto' del encabezado o el botón Soporte de arriba." />
            </div>
          </CardBody>
        )}

        {tab === "account" && (
          <CardBody>
            <p className="text-slate-600">Gestión de cuenta próximamente.</p>
          </CardBody>
        )}
      </Card>

      {/* Editors / Modals */}
      <InvoiceEditorModal
        open={Boolean(editing)}
        invoiceId={editing}
        onClose={() => setEditing(null)}
        auth={auth}
      />
      <InvoicePreviewModal open={Boolean(previewing)} invoice={previewing} onClose={() => setPreviewing(null)} />
    </Container>
  );
}

const TabBtn = ({ active, children, ...props }) => (
  <button
    className={`rounded-xl px-3 py-2 text-sm font-medium ${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`}
    {...props}
  >
    {children}
  </button>
);

const Progress = ({ value, label }) => (
  <div className="flex items-center gap-3">
    <div className="h-2 w-48 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-slate-900" style={{ width: `${value}%` }} />
    </div>
    <span className="text-xs text-slate-600 whitespace-nowrap">{label}</span>
  </div>
);

const EmptyInvoices = ({ onCreate }) => (
  <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 p-12 text-center">
    <div className="mx-auto max-w-md">
      <h4 className="text-lg font-semibold text-slate-900">Aún no tienes facturas</h4>
      <p className="mt-2 text-slate-600">Crea tu primera factura con una plantilla profesional.</p>
      <Button className="mt-4" onClick={onCreate}>Crear factura</Button>
    </div>
  </div>
);

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200">
      <button className="flex w-full items-center justify-between p-4 text-left" onClick={() => setOpen(!open)}>
        <span className="font-medium text-slate-900">{q}</span>
        <svg className={`h-5 w-5 text-slate-600 transition ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
      </button>
      {open && <div className="border-t border-slate-200 p-4 text-slate-700">{a}</div>}
    </div>
  );
}

function InvoiceRow({ invoice, onEdit, onPreview, onDelete }) {
  const totals = calcTotals(invoice.items || []);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-900">Factura #{invoice.number}</div>
        <div className="text-xs text-slate-600">{invoice.date} · {invoice.client?.name}</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-700 font-medium">{currency(totals.total)}</div>
        <Button variant="ghost" onClick={onPreview}>Previsualizar</Button>
        <Button variant="secondary" onClick={onEdit}>Editar</Button>
        <Button variant="danger" onClick={onDelete}>Eliminar</Button>
      </div>
    </div>
  );
}

// --- Invoice Editor ------------------------------------------------------------
function InvoiceEditorModal({ open, onClose, invoiceId, auth }) {
  if (!open) return null;
  const data = auth.getUserData();
  const idx = data.invoices.findIndex((i) => i.id === invoiceId);
  const [inv, setInv] = useState(data.invoices[idx]);

  const setField = (path, value) => {
    setInv((prev) => {
      const next = { ...prev };
      const [a, b, c] = path.split(".");
      if (c) next[a][b] = value; else next[a][b ?? ""] = value; // simple
      return next;
    });
  };

  const updateItem = (id, patch) => setInv((prev) => ({ ...prev, items: prev.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) }));
  const addItem = () => setInv((prev) => ({ ...prev, items: [...prev.items, { id: uid(), description: "Nuevo concepto", qty: 1, price: 0 }] }));
  const removeItem = (id) => setInv((prev) => ({ ...prev, items: prev.items.filter((it) => it.id !== id) }));

  const save = () => {
    const s = getStore();
    s.users[auth.user.email].invoices[idx] = inv;
    setStore(s);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={`Editar factura #${inv.number}`} wide>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Nº factura</label>
              <Input value={inv.number} onChange={(e) => setInv({ ...inv, number: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Fecha</label>
              <Input type="date" value={inv.date} onChange={(e) => setInv({ ...inv, date: e.target.value })} />
            </div>
          </div>

          <Card>
            <CardHeader title="Emisor" />
            <CardBody className="space-y-2">
              <Input placeholder="Nombre" value={inv.issuer?.name || ""} onChange={(e) => setInv({ ...inv, issuer: { ...inv.issuer, name: e.target.value } })} />
              <Input placeholder="NIF/CIF" value={inv.issuer?.nif || ""} onChange={(e) => setInv({ ...inv, issuer: { ...inv.issuer, nif: e.target.value } })} />
              <Input placeholder="Dirección" value={inv.issuer?.address || ""} onChange={(e) => setInv({ ...inv, issuer: { ...inv.issuer, address: e.target.value } })} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Cliente" />
            <CardBody className="space-y-2">
              <Input placeholder="Nombre" value={inv.client?.name || ""} onChange={(e) => setInv({ ...inv, client: { ...inv.client, name: e.target.value } })} />
              <Input placeholder="NIF" value={inv.client?.nif || ""} onChange={(e) => setInv({ ...inv, client: { ...inv.client, nif: e.target.value } })} />
              <Input placeholder="Dirección" value={inv.client?.address || ""} onChange={(e) => setInv({ ...inv, client: { ...inv.client, address: e.target.value } })} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Notas" />
            <CardBody>
              <Textarea rows={3} value={inv.notes || ""} onChange={(e) => setInv({ ...inv, notes: e.target.value })} />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Conceptos" right={<Button variant="secondary" onClick={addItem}>Añadir</Button>} />
            <CardBody className="space-y-3">
              {inv.items.map((it) => (
                <div key={it.id} className="grid grid-cols-12 items-center gap-2">
                  <Input className="col-span-6" value={it.description} onChange={(e) => updateItem(it.id, { description: e.target.value })} />
                  <Input className="col-span-2" type="number" step="1" min="0" value={it.qty} onChange={(e) => updateItem(it.id, { qty: Number(e.target.value) })} />
                  <Input className="col-span-3" type="number" step="0.01" min="0" value={it.price} onChange={(e) => updateItem(it.id, { price: Number(e.target.value) })} />
                  <button className="col-span-1 rounded-lg p-2 text-rose-600 hover:bg-rose-50" onClick={() => removeItem(it.id)} title="Eliminar">
                    <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/></svg>
                  </button>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Totales" />
            <CardBody>
              <TotalsView items={inv.items} />
            </CardBody>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button onClick={save}>Guardar cambios</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

const TotalsView = ({ items }) => {
  const { subtotal, taxes, total } = calcTotals(items);
  return (
    <div className="space-y-1 text-sm">
      <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-medium">{currency(subtotal)}</span></div>
      <div className="flex justify-between"><span className="text-slate-600">IVA (21%)</span><span className="font-medium">{currency(taxes)}</span></div>
      <Divider />
      <div className="flex justify-between text-base font-semibold"><span>Total</span><span>{currency(total)}</span></div>
    </div>
  );
};

// --- Preview & Download --------------------------------------------------------
function InvoicePreviewModal({ open, onClose, invoice }) {
  const areaRef = useRef(null);
  const htmlBlob = () => {
    const html = areaRef.current?.innerHTML || "";
    const doc = `<!doctype html><html><head><meta charset='utf-8'><title>Factura ${invoice?.number}</title><style>${PRINT_STYLES}</style></head><body>${html}</body></html>`;
    return new Blob([doc], { type: "text/html;charset=utf-8" });
  };
  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(htmlBlob());
    a.download = `factura-${invoice.number}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const print = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const html = areaRef.current?.innerHTML || "";
    w.document.write(`<!doctype html><html><head><meta charset='utf-8'><title>Factura ${invoice?.number}</title><style>${PRINT_STYLES}</style></head><body>${html}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };
  if (!open || !invoice) return null;
  return (
    <Modal open={open} onClose={onClose} title={`Factura #${invoice.number}`} wide>
      <div className="flex items-center justify-end gap-2 pb-3">
        <Button variant="secondary" onClick={download}>Descargar HTML</Button>
        <Button onClick={print}>Imprimir / PDF</Button>
      </div>
      <div ref={areaRef} className="print:p-0">
        <InvoiceDoc invoice={invoice} />
      </div>
    </Modal>
  );
}

const PRINT_STYLES = `
  @page { size: A4; margin: 24mm; }
  body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: #0f172a; }
  h1,h2,h3 { margin: 0; }
  .row { display:flex; justify-content:space-between; align-items:flex-start; }
  .muted { color:#64748b; }
  table { width:100%; border-collapse: collapse; margin-top:16px; }
  th,td { text-align:left; padding:8px; border-bottom:1px solid #e2e8f0; }
  .totals { margin-top:16px; max-width:320px; margin-left:auto; }
  .badge { display:inline-block; padding:2px 8px; border-radius:9999px; background:#0f172a; color:white; font-size:12px; }
`;

function InvoiceDoc({ invoice, compact = false }) {
  const items = invoice.items || [];
  const { subtotal, taxes, total } = calcTotals(items);
  return (
    <div className={`${compact ? "text-xs" : ""} rounded-2xl border border-slate-200 p-6`}> 
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="badge">Factura</div>
          <h2 className="mt-3 text-xl font-bold text-slate-900">#{invoice.number}</h2>
          <p className="text-sm text-slate-600">Fecha: {invoice.date}</p>
        </div>
        <div className="text-right">
          <h3 className="text-sm font-semibold text-slate-900">{invoice.issuer?.name}</h3>
          <p className="text-xs text-slate-600">{invoice.issuer?.nif}</p>
          <p className="text-xs text-slate-600">{invoice.issuer?.address}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-2 text-sm md:grid-cols-2">
        <div>
          <p className="font-semibold text-slate-900">Facturar a</p>
          <p className="text-slate-700">{invoice.client?.name}</p>
          <p className="text-slate-500">{invoice.client?.nif}</p>
          <p className="text-slate-500">{invoice.client?.address}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Notas</p>
          <p className="text-slate-700 whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-slate-600">
              <th className="w-2/3">Descripción</th>
              <th>Cant.</th>
              <th>Precio</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.description}</td>
                <td>{it.qty}</td>
                <td>{currency(it.price)}</td>
                <td>{currency(Number(it.qty) * Number(it.price))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 ml-auto w-full max-w-xs text-sm">
        <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-medium">{currency(subtotal)}</span></div>
        <div className="flex justify-between"><span className="text-slate-600">IVA (21%)</span><span className="font-medium">{currency(taxes)}</span></div>
        <Divider />
        <div className="flex justify-between text-base font-semibold"><span>Total</span><span>{currency(total)}</span></div>
      </div>
    </div>
  );
}

const InvoicePreview = ({ invoice, compact }) => <InvoiceDoc invoice={invoice} compact={compact} />;

// --- Auth screens --------------------------------------------------------------
function AuthScreen({ mode = "login", onSubmit, switchTo }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = (e) => {
    e.preventDefault();
    setError("");
    try {
      onSubmit(email, password);
    } catch (err) {
      setError(err.message || "Error");
    }
  };
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader title={mode === "login" ? "Entrar" : "Crear cuenta"} subtitle="Accede con tu correo y contraseña" />
          <CardBody>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Correo electrónico</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Contraseña</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <Button className="w-full" type="submit">{mode === "login" ? "Entrar" : "Crear cuenta"}</Button>
            </form>
            <p className="mt-4 text-center text-sm text-slate-600">
              {mode === "login" ? (
                <>¿No tienes cuenta? <button className="font-medium text-slate-900 underline" onClick={switchTo}>Crear cuenta</button></>
              ) : (
                <>¿Ya tienes cuenta? <button className="font-medium text-slate-900 underline" onClick={switchTo}>Entrar</button></>
              )}
            </p>
          </CardBody>
        </Card>
      </div>
    </Container>
  );
}

// --- Elegant Contact form ------------------------------------------------------
function ContactModal({ open, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => onClose(), 900);
  };
  return (
    <Modal open={open} onClose={onClose} title="Contacto">
      {sent ? (
        <div className="grid place-items-center p-10 text-center">
          <div className="mb-2 h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center">
            <svg viewBox="0 0 24 24" className="h-6 w-6"><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>
          </div>
          <p className="text-slate-800">¡Mensaje enviado! Te responderemos pronto.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Nombre</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Correo</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Mensaje</label>
            <Textarea rows={5} value={msg} onChange={(e) => setMsg(e.target.value)} required placeholder="Cuéntanos en qué podemos ayudarte" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={onClose}>Cerrar</Button>
            <Button type="submit">Enviar</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

// --- App -----------------------------------------------------------------------
export default function App() {
  const auth = useAuth();
  const [route, setRoute] = useState("home");
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    // If logged-in, default to dashboard
    if (auth.user) setRoute((r) => (r === "home" ? "dashboard" : r));
  }, [auth.user]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header onGoto={setRoute} user={auth.user} onOpenContact={() => setContactOpen(true)} />

      {route === "home" && <Home onGoto={setRoute} />}
      {route === "templates" && (
        <Templates onUseTemplate={(id) => {
          if (!auth.user) return setRoute("signup");
          // Create in dashboard from template
          const s = getStore();
          const userData = s.users?.[auth.user.email];
          const limit = 3;
          if (userData?.invoices?.length >= limit) {
            alert("Has alcanzado el límite de 3 facturas gratis.");
            return setRoute("dashboard");
          }
          // Create invoice quickly then go dashboard
          const t = TEMPLATES.find((x) => x.id === id) || TEMPLATES[0];
          const invoice = {
            id: uid(),
            number: String((userData?.invoices?.length || 0) + 1).padStart(4, "0"),
            date: new Date().toISOString().slice(0, 10),
            ...JSON.parse(JSON.stringify(t.sample)),
            templateId: t.id,
          };
          s.users[auth.user.email].invoices = [invoice, ...(userData?.invoices || [])];
          setStore(s);
          setRoute("dashboard");
        }} />
      )}

      {route === "login" && (
        <AuthScreen
          mode="login"
          onSubmit={(email, pass) => auth.login(email, pass)}
          switchTo={() => setRoute("signup")}
        />
      )}

      {route === "signup" && (
        <AuthScreen
          mode="signup"
          onSubmit={(email, pass) => auth.signup(email, pass)}
          switchTo={() => setRoute("login")}
        />
      )}

      {route === "dashboard" && auth.user && (
        <Dashboard auth={auth} onOpenContact={() => setContactOpen(true)} />
      )}

      <Footer />

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 py-10">
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-slate-600">© {new Date().getFullYear()} Facturas V7. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-sm">
            <a className="text-slate-600 hover:text-slate-900" href="#">Términos</a>
            <a className="text-slate-600 hover:text-slate-900" href="#">Privacidad</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
