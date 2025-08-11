export function calcTotals(items: {qty:number; price:number; tax:number}[]) {
  const subtotal = items.reduce((a,i)=>a + i.qty*i.price, 0);
  const taxTotal = items.reduce((a,i)=>a + i.qty*i.price*i.tax/100, 0);
  const total = +(subtotal + taxTotal).toFixed(2);
  return { subtotal, taxTotal, total };
}
