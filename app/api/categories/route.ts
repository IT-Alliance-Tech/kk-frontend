export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch("http://localhost:5000/api/categories", {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      return Response.json({ error: 'Failed to fetch categories' }, { status: res.status });
    }
    
    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error('Categories API error:', error);
    return Response.json({ error: 'Backend not available' }, { status: 503 });
  }
}
