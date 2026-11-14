// Returns the latest arXiv preprints about black holes as JSON at /api/feed.
// Runs server-side on Netlify, so the browser makes only a same-origin request.
const dec = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&');

export default async () => {
  const q = 'search_query=' + encodeURIComponent('ti:"black hole" AND (cat:astro-ph.HE OR cat:astro-ph.GA OR cat:gr-qc)') +
    '&sortBy=submittedDate&sortOrder=descending&max_results=12';
  try {
    const r = await fetch('https://export.arxiv.org/api/query?' + q, { headers: { 'User-Agent': 'black-hole-observatory/1.0' } });
    if (!r.ok) throw new Error('arXiv ' + r.status);
    const xml = await r.text();
    const items = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(m => {
      const e = m[1], g = t => (e.match(new RegExp('<' + t + '[^>]*>([\\s\\S]*?)</' + t + '>')) || [])[1] || '';
      const names = [...e.matchAll(/<name>([\s\S]*?)<\/name>/g)].map(a => dec(a[1].trim()));
      return {
        id: g('id').trim(),
        title: dec(g('title').replace(/\s+/g, ' ').trim()),
        published: g('published').trim(),
        authors: names.slice(0, 3),
        more: names.length > 3,
        cat: (e.match(/<arxiv:primary_category[^>]*term="([^"]+)"/) || [])[1] || ''
      };
    });
    return new Response(JSON.stringify({ updated: new Date().toISOString(), items }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300, s-maxage=3600' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err.message || err) }), { status: 502, headers: { 'content-type': 'application/json' } });
  }
};
export const config = { path: '/api/feed' };
