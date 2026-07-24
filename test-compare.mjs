import { config } from 'dotenv';
config({ path: '.env.local' });

import { denseSearch, rerankResults } from './lib/search.js';

const query = process.argv.slice(2).join(' ') || 'reducing hallucination in retrieval augmented generation';

const dense = await denseSearch(query, 30);
const reranked = await rerankResults(query, dense, 5);

console.log('\nQUERY:', query);

console.log('\n--- dense top 5 ---');
dense.slice(0, 5).forEach((r, i) => console.log(`${i + 1}. ${r.score.toFixed(3)}  ${r.title}`));

console.log('\n--- reranked top 5 ---');
reranked.forEach((r, i) => {
  const was = dense.findIndex((d) => d.id === r.id) + 1;
  console.log(`${i + 1}. ${r.rerankScore.toFixed(3)}  [was #${was}]  ${r.title}`);
});
