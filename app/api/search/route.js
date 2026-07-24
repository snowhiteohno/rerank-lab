import { NextResponse } from 'next/server';
import { denseSearch, rerankResults } from '../../../lib/search.js';

export async function POST(request) {
  const { query } = await request.json();

  if (!query || !query.trim()) {
    return NextResponse.json({ error: 'query required' }, { status: 400 });
  }

  const dense = await denseSearch(query, 30);
  const reranked = await rerankResults(query, dense, 8);
  const rankById = new Map(dense.map((d, i) => [d.id, i + 1]));

  return NextResponse.json({
    query,
    dense: dense.slice(0, 8).map((d, i) => ({
      id: d.id,
      title: d.title,
      abstract: d.abstract,
      score: d.score,
      rank: i + 1,
    })),
    reranked: reranked.map((r, i) => ({
      id: r.id,
      title: r.title,
      abstract: r.abstract,
      score: r.rerankScore,
      rank: i + 1,
      previousRank: rankById.get(r.id),
    })),
  });
}
