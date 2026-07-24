import { config } from 'dotenv';
config({ path: '.env.local' });

import { CohereClientV2 } from 'cohere-ai';
import { readFile, writeFile } from 'node:fs/promises';

const papers = JSON.parse(await readFile('data/corpus.json', 'utf8'));
const cohere = new CohereClientV2({ token: process.env.COHERE_API_KEY });

const BATCH = 96;
const out = [];

for (let i = 0; i < papers.length; i += BATCH) {
  const batch = papers.slice(i, i + BATCH);

  const res = await cohere.embed({
    model: 'embed-v4.0',
    inputType: 'search_document',
    embeddingTypes: ['float'],
    outputDimension: 512,
    texts: batch.map((p) => `${p.title}\n\n${p.abstract}`),
  });

  res.embeddings.float.forEach((vector, j) => {
    out.push({ id: batch[j].id, vector });
  });

  console.log(`embedded ${out.length}/${papers.length}`);
}

await writeFile('data/index.json', JSON.stringify(out));
console.log('saved data/index.json');