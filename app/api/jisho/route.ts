import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');

  if (!keyword) {
    return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
  }

  // Jisho API may not handle single-character searches well, especially for kana.
  // This prevents unnecessary API calls and potential errors.
  if (keyword.length < 2) {
    return NextResponse.json({ data: [] });
  }

  try {
    const response = await fetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(keyword)}`);
    if (!response.ok) {
      throw new Error(`Jisho API request failed with status ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Jisho API proxy error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch data from Jisho API', details: message }, { status: 500 });
  }
}
