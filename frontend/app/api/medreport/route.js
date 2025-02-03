import ollama from 'ollama';

export async function POST(req) {
  try {
    const { journalDescription } = await req.json();

    if (!journalDescription) {
      return new Response(JSON.stringify({ error: 'Missing journalDescription' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await ollama.chat({
      model: 'medreport',
      messages: [{ role: 'user', content: journalDescription }],
    });

    return new Response(JSON.stringify({ report: response.message.content }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating medical report:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate report' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
