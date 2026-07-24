import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { CohereClientV2 } from 'cohere-ai';

let cache = null;

export async function loadCorpus() {
  if (cache) return cache;
  const dir = path.join(process.cwd(), 'data');
  const [papers, vectors] = await Promise.all([
    readFile(path.join(dir, 'corpus.json'), 'utf8').then(JSON.parse),
    readFile(path.join(dir, 'index.json'), 'utf8').then(JSON.parse),
  ]);
  const byId = new Map(papers.map((p) => [p.id, p]));
  cache = vectors.map((v) => ({ ...byId.get(v.id), vector: v.vector }));
  return cache;
}

export function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function denseSearch(query, k = 20) {
  const cohere = new CohereClientV2({ token: process.env.COHERE_API_KEY });

  const res = await cohere.embed({
    model: 'embed-v4.0',
    inputType: 'search_query',
    embeddingTypes: ['float'],
    outputDimension: 512,
    texts: [query],
  });

  const q = res.embeddings.float[0];
  const docs = await loadCorpus();

  return docs
    .map((d) => ({
      id: d.id,
      title: d.title,
      abstract: d.abstract,
      score: cosine(q, d.vector),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

export async function rerankResults(query, docs, topN = 5) {
  const cohere = new CohereClientV2({ token: process.env.COHERE_API_KEY });

  const res = await cohere.rerank({
    model: 'rerank-v4.0-fast',
    query,
    documents: docs.map((d) => `${d.title}\n\n${d.abstract}`),
    topN,
  });

  return res.results.map((r) => ({
    ...docs[r.index],
    rerankScore: r.relevanceScore,
  }));
}
