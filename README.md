# Rerank Lab

Embedding search versus reranking, side by side, over 300 recent arXiv abstracts.
Built with Cohere Embed v4 and Rerank v4.

Live: https://rerank-lab.vercel.app/

## Why

Reranking is usually described as "it improves results." I wanted to see where,
and where it doesn't.

## How it works

- 300 cs.CL abstracts from the arXiv API
- Embed v4 at 512 dimensions, cosine similarity, top 30 candidates
- Rerank v4 reorders those 30 down to 8
- The UI shows each result's movement, so a paper promoted from rank 20 is visible

## Results

4 queries, relevance judged per paper against the query intent rather than
keyword overlap. Labels were LLM-assisted and human-reviewed.

| Query | Dense P@5 | Rerank P@5 |
|---|---|---|
| reducing hallucination in RAG | 0.40 | 0.80 |
| why do long contexts hurt reasoning | 0.40 | 0.40 |
| evaluating agent tool use | 0.20 | 0.60 |
| chunking strategies for document retrieval | 0.20 | 0.20 |
| **overall** | **0.300** | **0.500** |

5 relevant papers were rescued from beyond the dense top 5.

## What I actually learned

Reranking helps most when the embedding stage retrieves on vocabulary rather than
intent. For the hallucination query, cosine similarity put an in-storage retrieval
accelerator paper at rank 4 purely for sharing RAG terminology, while a knowledge-graph
reasoning paper that genuinely addressed the question sat at rank 20. Reranking
inverted both.

It is not monotonic. On the agent tool use query, reranking dropped a relevant paper
the embeddings had ranked first.

It cannot fix a corpus. The chunking query has no matching papers in 300 abstracts,
so reranking only reshuffled irrelevant results and demoted the one decent hit.

The practical implication: reranking is worth its latency where first-stage recall is
good but ordering is poor. It is not a substitute for retrieving the right candidates.

## Run it

npm install
node fetch-corpus.mjs
node embed-corpus.mjs
npm run dev

Requires COHERE_API_KEY in .env.local
