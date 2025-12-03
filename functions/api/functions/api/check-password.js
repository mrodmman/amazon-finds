export async function onRequestPost(context) {
  const { password } = await context.request.json();
  const correctPassword = context.env.ADMIN_PASSWORD || 'admin123'; // fallback for testing
  
  return new Response(JSON.stringify({ valid: password === correctPassword }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
