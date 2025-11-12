// pages/api/orders/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { user_id, items, shipping_address, billing_address } = req.body;
  // items: [{ product_id, quantity }]
  try {
    // compute totals server-side
    const productIds = items.map((i: { product_id: any; }) => i.product_id);
    const { data: products } = await supabaseAdmin.from('products').select('id, price').in('id', productIds);

    let subtotal = 0;
    for (const it of items) {
      const p = products?.find((x) => x.id === it.product_id);
      subtotal += Number(p?.price) * it.quantity;
    }
    // basic tax & shipping
    const tax = subtotal * 0.05;
    const shipping = 50;
    const total = subtotal + tax + shipping;

    // create order
    const { data: order } = await supabaseAdmin
      .from('orders')
      .insert([{
        user_id,
        order_number: 'ORD' + Date.now(),
        subtotal, tax_amount: tax, shipping_amount: shipping, total,
        shipping_address, billing_address, status: 'pending'
      }])
      .select()
      .single();

    // insert order_items
    const orderItems = items.map((it: { product_id: any; quantity: any; }) => ({
      order_id: order.id,
      product_id: it.product_id,
      price:products !== undefined? products?.find((p) => p?.id === it?.product_id)?.price ?? "":"",
      quantity: it.quantity
    }));

    await supabaseAdmin.from('order_items').insert(orderItems);

    res.status(201).json({ orderId: order.id, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'order failed' });
  }
}
