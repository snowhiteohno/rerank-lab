import { config } from 'dotenv';
config({ path: '.env.local' });

import { denseSearch } from './lib/search.js';

const query = process.argv.slice(2).join(' ') || 'reducing hallucination in retrieval augmented generation';
const results = await denseSearch(query, 5);

results.forEach((r, i) => console.log(`${i + 1}. ${r.score.toFixed(3)}  ${r.title}`));
