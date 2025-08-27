import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { category, recentSentiment } = await req.json()

    // Generate contextual motivational quote based on sentiment trends
    let prompt = ""
    if (category === 'positive') {
      prompt = "Generate a short, uplifting motivational quote to celebrate someone's positive mood and encourage them to keep going. Keep it under 20 words and include an emoji."
    } else if (category === 'encouraging') {
      prompt = "Generate a short, gentle motivational quote to encourage someone who might be going through difficult times. Focus on resilience and hope. Keep it under 20 words and include an emoji."
    } else {
      prompt = "Generate a short, neutral motivational quote about self-reflection and personal growth through journaling. Keep it under 20 words and include an emoji."
    }

    const huggingFaceToken = Deno.env.get('HUGGINGFACE_API_KEY')
    
    if (!huggingFaceToken) {
      console.log('No Hugging Face token, using fallback quotes')
      throw new Error('No AI API available')
    }

    // Try to generate with Hugging Face
    const response = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${huggingFaceToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 50,
            temperature: 0.7,
            do_sample: true
          }
        })
      }
    )

    if (response.ok) {
      const result = await response.json()
      if (result && result[0] && result[0].generated_text) {
        return new Response(
          JSON.stringify({ 
            quote: result[0].generated_text.replace(prompt, '').trim(),
            category 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Fallback to predefined quotes if AI fails
    throw new Error('AI generation failed')

  } catch (error) {
    console.error('Error generating quote:', error)
    
    // Return error so the frontend can handle with static quotes
    return new Response(
      JSON.stringify({ error: 'Quote generation failed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})