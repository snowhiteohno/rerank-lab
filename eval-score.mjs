import { readFile } from 'node:fs/promises';

const data = JSON.parse(await readFile('eval/judgments.json', 'utf8'));
let denseHits = 0, rerankHits = 0, total = 0, rescued = 0;

for (const { query, candidates } of data) {
  const relevant = new Set(candidates.filter((c) => c.relevant === true).map((c) => c.id));
  const denseTop = candidates.filter((c) => c.denseRank <= 5);
  const rerankTop = candidates.filter((c) => c.rerankRank !== null);

  const d = denseTop.filter((c) => relevant.has(c.id)).length;
  const r = rerankTop.filter((c) => relevant.has(c.id)).length;

  denseHits += d;
  rerankHits += r;
  total += 5;
  rescued += rerankTop.filter((c) => relevant.has(c.id) && c.denseRank > 5).length;

  console.log(`${query}\n  dense ${(d / 5).toFixed(2)}   rerank ${(r / 5).toFixed(2)}`);
}

console.log(`\noverall dense P@5   ${(denseHits / total).toFixed(3)}`);
console.log(`overall rerank P@5  ${(rerankHits / total).toFixed(3)}`);
console.log(`relevant papers rescued from beyond dense top 5: ${rescued}`);
