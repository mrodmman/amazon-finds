export async function onRequestGet(context) {
  try {
    const products = await context.env.PRODUCTS_KV.get('products', { type: 'json' });
    return new Response(JSON.stringify({ products: products || [] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ products: [] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  try {
    const { products } = await context.request.json();
    await context.env.PRODUCTS_KV.put('products', JSON.stringify(products));
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
