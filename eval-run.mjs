import { config } from 'dotenv';
config({ path: '.env.local' });

import { readFile, writeFile } from 'node:fs/promises';
import { denseSearch, rerankResults } from './lib/search.js';

const queries = JSON.parse(await readFile('eval/queries.json', 'utf8'));
const out = [];

for (const query of queries) {
  const dense = await denseSearch(query, 30);
  const reranked = await rerankResults(query, dense, 5);

  const pool = new Map();
  for (const d of [...dense.slice(0, 5), ...reranked]) {
    if (pool.has(d.id)) continue;
    pool.set(d.id, {
      id: d.id,
      title: d.title,
      abstract: d.abstract.slice(0, 300),
      denseRank: dense.findIndex((x) => x.id === d.id) + 1,
      rerankRank: reranked.findIndex((x) => x.id === d.id) + 1 || null,
      relevant: null,
    });
  }

  out.push({ query, candidates: [...pool.values()] });
  console.log('prepared:', query);
}

await writeFile('eval/judgments.json', JSON.stringify(out, null, 2));
