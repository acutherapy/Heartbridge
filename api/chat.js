// /api/chat.js  — runs on Vercel server, key不暴露
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, model = 'gpt-4o-mini', temperature = 0.7 } = req.body || {};
  if (!Array.isArray(messages)) return res.status(400).json({ error: 'messages[] required' });

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model, messages, temperature })
  });

  if (!r.ok) return res.status(r.status).json({ error: await r.text() });
  const data = await r.json();
  res.status(200).json({ text: data?.choices?.[0]?.message?.content ?? '' });
}
