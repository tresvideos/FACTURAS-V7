export type Theme = { slug: string; name: string; accent: string; headerBg?: string; dark?: boolean; note?: string; };
export const templates: Theme[] = [
  { slug: 'minimal', name: 'Minimal', accent: '#111827', note: 'Limpia y legible' },
  { slug: 'professional', name: 'Profesional Azul', accent: '#2563eb', headerBg: '#eff6ff' },
  { slug: 'modern', name: 'Moderna Morada', accent: '#7c3aed', headerBg: '#f5f3ff' },
  { slug: 'stripe', name: 'Banda Lateral', accent: '#0ea5e9' },
  { slug: 'classic', name: 'Clásica Gris', accent: '#374151', headerBg: '#f3f4f6' },
  { slug: 'dark', name: 'Oscura', accent: '#111827', headerBg: '#111827', dark: true }
];
export function previewSVG(theme: Theme){
  const bar = theme.slug==='stripe' ? `<rect x="0" y="0" width="28" height="200" fill="${theme.accent}"/>` : '';
  const headerFill = theme.headerBg || '#ffffff';
  return `
<svg width="320" height="200" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="320" height="200" rx="16" fill="#ffffff" stroke="#e5e7eb"/>
  ${bar}
  <rect x="16" y="16" width="288" height="36" rx="8" fill="${headerFill}" stroke="#e5e7eb"/>
  <rect x="24" y="24" width="160" height="8" rx="4" fill="${theme.accent}"/>
  <rect x="24" y="70" width="272" height="12" rx="4" fill="#e5e7eb"/>
  <rect x="24" y="90" width="272" height="12" rx="4" fill="#e5e7eb"/>
  <rect x="24" y="110" width="272" height="12" rx="4" fill="#e5e7eb"/>
  <rect x="24" y="160" width="120" height="10" rx="4" fill="#e5e7eb"/>
  <rect x="176" y="160" width="120" height="10" rx="4" fill="${theme.accent}"/>
</svg>`;
}
