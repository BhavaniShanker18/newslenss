import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!text || text.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: 'Text must be at least 50 characters long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert fake news detection AI. Analyze the given news article and determine if it's fake or real news.

Evaluate these FAKE NEWS indicators (weight = 10 each):
1. Sensational language (BREAKING, SHOCKING, all caps)
2. Conspiracy keywords (cover-up, Big Pharma, secret)
3. Anonymous sources (insider reveals, sources say)
4. Urgency manipulation (share before deleted, act now)
5. Extreme claims (100% cure, miracle, mind control)
6. Lack of credibility (no names, vague references)
7. Emotional manipulation (fear-mongering, anger)
8. Medical misinformation (dangerous health advice)
9. Unverifiable statistics (99% without sources)
10. Anti-expert rhetoric (don't trust authorities)

Evaluate these REAL NEWS indicators (weight = 8 each):
1. Specific names with credentials
2. Credible institutions (universities, government agencies)
3. Specific dates and locations
4. Verifiable facts and statistics
5. Balanced professional tone
6. Named sources with affiliations
7. Reasonable scientific claims
8. Standard journalism (who, what, when, where, why)

Scoring:
- Fake Score = (fake indicators found × 10)
- Real Score = (real indicators found × 8)
- If Fake Score > Real Score: verdict = FAKE
- If Real Score >= Fake Score: verdict = REAL
- Confidence = (winning score / total score) × 100
- Minimum confidence: 65%

Respond in JSON format:
{
  "verdict": "fake" or "real",
  "confidence": number (65-100),
  "credibility": number (0-100),
  "riskLevel": "high" | "medium" | "low",
  "indicators": ["indicator1", "indicator2", ...],
  "explanation": "Brief explanation of why this is classified as fake/real (2-3 sentences)",
  "warnings": ["warning1", "warning2", ...]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this news article:\n\n${text}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('Failed to analyze news article');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const result = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-news:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
