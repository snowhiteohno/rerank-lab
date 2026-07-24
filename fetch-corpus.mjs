import { writeFile, mkdir } from 'node:fs/promises';
import { XMLParser } from 'fast-xml-parser';

const CATEGORY = 'cs.CL';
const TOTAL = 300;
const PAGE = 100;

const parser = new XMLParser();
const papers = [];

for (let start = 0; start < TOTAL; start += PAGE) {
  const url = `http://export.arxiv.org/api/query?search_query=cat:${CATEGORY}&start=${start}&max_results=${PAGE}&sortBy=submittedDate&sortOrder=descending`;
  const res = await fetch(url);
  const xml = await res.text();
  const parsed = parser.parse(xml);

  const raw = parsed.feed?.entry;
  const entries = Array.isArray(raw) ? raw : raw ? [raw] : [];

  for (const e of entries) {
    papers.push({
      id: String(e.id),
      title: String(e.title).replace(/\s+/g, ' ').trim(),
      abstract: String(e.summary).replace(/\s+/g, ' ').trim(),
      published: String(e.published),
    });
  }

  console.log(`fetched ${papers.length}`);
  await new Promise((r) => setTimeout(r, 3000));
}

await mkdir('data', { recursive: true });
await writeFile('data/corpus.json', JSON.stringify(papers, null, 2));
console.log(`saved ${papers.length} papers`);