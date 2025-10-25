import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseClient = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    const { imageBase64, patientId } = await req.json();

    if (!imageBase64 || !patientId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: imageBase64 and patientId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing wound image for patient:', patientId);

    // Call Lovable AI with vision capabilities
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a medical AI assistant specialized in post-surgical wound assessment. 
Analyze wound images for signs of infection including:
- Redness and inflammation
- Swelling
- Discharge or pus
- Dehiscence (wound opening)
- Heat or warmth
- Poor healing progress

Provide:
1. A risk score (0-100, where 0 is healthy and 100 is critical)
2. Status classification: "healthy", "warning", or "critical"
3. Brief clinical analysis
4. Specific recommendations for the patient

Be professional, clear, and actionable.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this post-surgical wound image and assess for any signs of infection or complications.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ]
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0].message.content;

    console.log('AI Analysis received:', analysisText);

    // Parse the AI response to extract structured data
    let riskScore = 50;
    let status = 'warning';
    let recommendations = 'Please consult with your care team.';

    // Extract risk score
    const scoreMatch = analysisText.match(/risk score[:\s]+(\d+)/i);
    if (scoreMatch) {
      riskScore = parseInt(scoreMatch[1]);
    }

    // Extract status
    if (analysisText.toLowerCase().includes('healthy') && !analysisText.toLowerCase().includes('unhealthy')) {
      status = 'healthy';
      riskScore = Math.min(riskScore, 30);
    } else if (analysisText.toLowerCase().includes('critical') || analysisText.toLowerCase().includes('severe')) {
      status = 'critical';
      riskScore = Math.max(riskScore, 70);
    }

    // Extract recommendations
    const recMatch = analysisText.match(/recommendations?[:\s]+(.*?)(?:\n\n|\n\d+\.|$)/is);
    if (recMatch) {
      recommendations = recMatch[1].trim();
    }

    const result = {
      riskScore,
      status,
      analysis: analysisText,
      recommendations
    };

    console.log('Structured result:', result);

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in analyze-wound function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});