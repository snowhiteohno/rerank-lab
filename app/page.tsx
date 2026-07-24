"use client";

import { useState } from "react";

type Result = {
  id: string;
  title: string;
  abstract: string;
  score: number;
  rank: number;
  previousRank?: number;
};

function Movement({ from, to }: { from?: number; to: number }) {
  if (!from) return null;
  const delta = from - to;
  if (delta === 0) return <span className="text-neutral-400">held</span>;
  const up = delta > 0;
  return (
    <span className={up ? "text-emerald-600" : "text-neutral-400"}>
      {up ? "up" : "down"} {Math.abs(delta)} from #{from}
    </span>
  );
}

function Column({ title, note, items }: { title: string; note: string; items: Result[] }) {
  return (
    <div className="flex-1 min-w-0">
      <h2 className="text-sm font-medium tracking-tight">{title}</h2>
      <p className="text-xs text-neutral-500 mb-4">{note}</p>
      <ol className="space-y-3">
        {items.map((r) => (
          <li key={r.id} className="border border-neutral-200 rounded-lg p-3">
            <div className="flex gap-2 text-xs text-neutral-500 mb-1">
              <span className="font-mono">#{r.rank}</span>
              <span className="font-mono">{r.score.toFixed(3)}</span>
              <Movement from={r.previousRank} to={r.rank} />
            </div>
            <p className="text-sm leading-snug">{r.title}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("reducing hallucination in retrieval augmented generation");
  const [dense, setDense] = useState<Result[]>([]);
  const [reranked, setReranked] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setDense(data.dense ?? []);
      setReranked(data.reranked ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-xl font-medium tracking-tight">Rerank Lab</h1>
      <p className="text-sm text-neutral-500 mt-1 mb-6">
        300 recent arXiv abstracts. Embedding search on the left, the same candidates
        after reranking on the right.
      </p>

      <div className="flex gap-2 mb-10">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm"
          placeholder="Ask something"
        />
        <button
          onClick={run}
          disabled={loading}
          className="bg-neutral-900 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-40"
        >
          {loading ? "Searching" : "Search"}
        </button>
      </div>

      <div className="flex gap-8">
        <Column title="Embedding search" note="Cosine similarity over Embed v4 vectors" items={dense} />
        <Column title="After rerank" note="Same 30 candidates, reordered by Rerank" items={reranked} />
      </div>
    </main>
  );
}
