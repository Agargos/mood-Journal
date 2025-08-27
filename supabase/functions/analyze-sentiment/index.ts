import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SentimentResult {
  label: string;
  score: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, tags = [], user_id } = await req.json();
    
    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Analyzing sentiment for text:', text.substring(0, 50) + '...');

    // Call Hugging Face API for sentiment analysis
    const huggingFaceResponse = await fetch(
      'https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('HUGGINGFACE_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          options: { wait_for_model: true }
        }),
      }
    );

    if (!huggingFaceResponse.ok) {
      throw new Error(`Hugging Face API error: ${huggingFaceResponse.status}`);
    }

    const sentimentData = await huggingFaceResponse.json();
    console.log('Hugging Face response:', sentimentData);

    // Extract the sentiment with highest score
    let sentiment = 'NEUTRAL';
    let score = 0;

    if (Array.isArray(sentimentData) && sentimentData.length > 0) {
      // Sort by score and get the highest confidence result
      const sortedResults = sentimentData[0].sort((a: SentimentResult, b: SentimentResult) => b.score - a.score);
      sentiment = sortedResults[0].label;
      score = sortedResults[0].score;
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Save the journal entry to database
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id,
        text,
        tags: tags.length > 0 ? tags : null,
        sentiment,
        score
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('Journal entry saved successfully:', data.id);

    return new Response(
      JSON.stringify({
        success: true,
        entry: data,
        sentiment,
        score
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-sentiment function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});