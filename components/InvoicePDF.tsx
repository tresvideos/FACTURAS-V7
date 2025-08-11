import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

function themeStyles(theme: string | undefined){
  const accent = theme==='professional' ? '#2563eb'
    : theme==='modern' ? '#7c3aed'
    : theme==='stripe' ? '#0ea5e9'
    : theme==='classic' ? '#374151'
    : theme==='dark' ? '#111827'
    : '#111827';
  const headerBg = theme==='professional' ? '#eff6ff'
    : theme==='modern' ? '#f5f3ff'
    : theme==='classic' ? '#f3f4f6'
    : theme==='dark' ? '#111827'
    : '#ffffff';
  const textColor = theme==='dark' ? '#e5e7eb' : '#111827';

  return StyleSheet.create({
    page: { padding: 32, backgroundColor: theme==='dark' ? '#0f172a' : '#ffffff' },
    h1: { fontSize: 18, marginBottom: 8, color: textColor },
    label: { fontSize: 10, color: theme==='dark' ? '#cbd5e1' : '#6b7280' },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: 24 },
    column: { width: '48%' },
    header: { backgroundColor: headerBg, padding: 10, borderRadius: 6, marginBottom: 8, flexDirection: 'row', justifyContent:'space-between', alignItems:'center' },
    band: theme==='stripe' ? { position: 'absolute', left: 0, top: 0, bottom: 0, width: 16, backgroundColor: accent } : {},
    tableHeader: { flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 4, marginTop: 12, borderColor: '#e5e7eb' },
    th: { width: '25%', fontSize: 10, fontWeight: 700, color: textColor },
    tr: { flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#e5e7eb', paddingVertical: 4 },
    td: { width: '25%', fontSize: 10, color: textColor, wordBreak: 'break-word' },
    text: { fontSize: 10, color: textColor, wordBreak: 'break-word' },
    totals: { alignSelf: 'flex-end', marginTop: 12, width: '50%' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', fontSize: 12, color: textColor },
    accent: { color: accent }
  });
}

export default function InvoicePDF({ inv }: any) {
  const styles = themeStyles(inv.theme);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.band as any} />
        <View style={styles.header}>
          <Text style={[styles.h1, styles.accent]}>{inv.title} — {inv.number}</Text>
          {inv.seller?.logo ? <Image src={inv.seller.logo} style={{ width: 80, height: 32, objectFit: 'contain' }} /> : null}
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Emisor</Text>
            <Text style={styles.text}>{inv.seller.name}</Text>
            <Text style={styles.text}>{inv.seller.taxId}</Text>
            <Text style={styles.text}>{inv.seller.address || ''}</Text>
            {inv.seller.email ? <Text style={styles.text}>{inv.seller.email}</Text> : null}
            {inv.seller.phone ? <Text style={styles.text}>{inv.seller.phone}</Text> : null}
            {inv.seller.website ? <Text style={styles.text}>{inv.seller.website}</Text> : null}
            {inv.seller.iban ? <Text style={styles.text}>IBAN: {inv.seller.iban}</Text> : null}
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.text}>{inv.buyer.name}</Text>
            <Text style={styles.text}>{inv.buyer.address || ''}</Text>
            {inv.buyer.email ? <Text style={styles.text}>{inv.buyer.email}</Text> : null}
            {inv.buyer.taxId ? <Text style={styles.text}>{inv.buyer.taxId}</Text> : null}
          </View>
        </View>
        <View style={styles.tableHeader}>
          <Text style={styles.th}>Concepto</Text>
          <Text style={styles.th}>Cant.</Text>
          <Text style={styles.th}>Precio</Text>
          <Text style={styles.th}>IVA</Text>
        </View>
        {inv.items.map((it: any, idx: number) => (
          <View key={idx} style={styles.tr}>
            <Text style={styles.td}>{it.description}</Text>
            <Text style={styles.td}>{it.qty}</Text>
            <Text style={styles.td}>{it.price.toFixed(2)} €</Text>
            <Text style={styles.td}>{it.tax}%</Text>
          </View>
        ))}
        <View style={styles.totals}>
          <View style={styles.totalRow}><Text>Subtotal</Text><Text>{inv.subtotal.toFixed(2)} €</Text></View>
          <View style={styles.totalRow}><Text>IVA</Text><Text>{inv.taxTotal.toFixed(2)} €</Text></View>
          <View style={styles.totalRow}><Text>Total</Text><Text>{inv.total.toFixed(2)} €</Text></View>
        </View>
        {inv.notes ? (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.label}>Notas</Text>
            <Text style={styles.text}>{inv.notes}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
