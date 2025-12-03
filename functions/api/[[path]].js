export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (path === '/api/products' && request.method === 'GET') {
    try {
      const products = await env.PRODUCTS_KV.get('products', 'json');
      return new Response(JSON.stringify({ products: products || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ products: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  if (path === '/api/products' && request.method === 'POST') {
    try {
      const { products } = await request.json();
      await env.PRODUCTS_KV.put('products', JSON.stringify(products));
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to save' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  if (path === '/api/check-password' && request.method === 'POST') {
    try {
      const { password } = await request.json();
      let storedPassword = await env.PRODUCTS_KV.get('admin_password');
      
      if (!storedPassword) {
        await env.PRODUCTS_KV.put('admin_password', password);
        return new Response(JSON.stringify({ valid: true, firstTime: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const valid = password === storedPassword;
      return new Response(JSON.stringify({ valid }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ valid: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('Not found', { status: 404 });
}
