export async function onRequestPost(context) {
  const { password } = await context.request.json();
  const correctPassword = context.env.ADMIN_PASSWORD || 'admin123';
  
  return new Response(JSON.stringify({ valid: password === correctPassword }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
