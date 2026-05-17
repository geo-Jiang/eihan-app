export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const apiKey = process.env.TTS_API_KEY;
  if (!apiKey) { res.status(500).json({ error: 'TTS API key not configured' }); return; }

  const { text, voiceName } = req.body;
  if (!text) { res.status(400).json({ error: 'No text provided' }); return; }

  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: text },
          voice: {
            languageCode: 'ja-JP',
            name: voiceName || 'ja-JP-Neural2-B'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.85,
            pitch: 0.0
          }
        })
      }
    );
    const data = await response.json();
    if (!response.ok) {
      res.status(response.status).json({ error: data.error?.message || 'TTS error' });
      return;
    }
    res.status(200).json({ audioContent: data.audioContent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
