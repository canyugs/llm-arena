export async function GET() {
  return new Response('登出成功！', {
    status: 200,
    headers: {
      'Set-Cookie': 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  });
}
