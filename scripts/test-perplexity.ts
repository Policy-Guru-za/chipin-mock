/**
 * Test Perplexity API response for Takealot product
 */

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/v2/chat/completions';
const TEST_URL = 'https://www.takealot.com/playstation-5-dualsense-controller-starlight-blue-ps5/PLID73817018';

async function testPerplexity() {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    console.error('❌ PERPLEXITY_API_KEY not set');
    process.exit(1);
  }

  console.log('🔍 Testing Perplexity API for Takealot product\n');
  console.log('URL:', TEST_URL);
  console.log('');

  const response = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: `You are a product data extractor. Extract product details from Takealot URLs and return ONLY valid JSON with no additional text or markdown.

Return format (no markdown code blocks):
{"name":"Product Name","priceCents":129900,"imageUrl":"https://...","inStock":true}

Rules:
- priceCents must be an integer in cents (R1299.00 = 129900)
- imageUrl should be the main product image URL from Takealot
- inStock should be true unless explicitly marked as out of stock
- Return ONLY the JSON object, nothing else`,
        },
        {
          role: 'user',
          content: `Extract product details from: ${TEST_URL}`,
        },
      ],
      max_tokens: 500,
      search_domain_filter: ['takealot.com'],
    }),
  });

  console.log('Response status:', response.status);
  console.log('');

  const data = await response.json();

  console.log('📦 Full API Response:');
  console.log('─'.repeat(50));
  console.log(JSON.stringify(data, null, 2));
  console.log('');

  const content = data.choices?.[0]?.message?.content;
  console.log('📝 Raw content from AI:');
  console.log('─'.repeat(50));
  console.log(content);
  console.log('');

  if (content) {
    // Try to parse JSON
    let jsonStr = content.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    try {
      const parsed = JSON.parse(jsonStr);
      console.log('✅ Parsed JSON:');
      console.log('─'.repeat(50));
      console.log(JSON.stringify(parsed, null, 2));
      console.log('');
      console.log('Analysis:');
      console.log('  name:', parsed.name);
      console.log('  priceCents:', parsed.priceCents, `(R ${(parsed.priceCents / 100).toFixed(2)})`);
      console.log('  imageUrl:', parsed.imageUrl);
      console.log('  inStock:', parsed.inStock);
    } catch (e) {
      console.log('❌ Failed to parse JSON:', e);
    }
  }

  // Also show citations if available
  if (data.citations) {
    console.log('\n📚 Citations:');
    data.citations.forEach((c: string, i: number) => console.log(`  ${i + 1}. ${c}`));
  }
}

testPerplexity().catch(console.error);
