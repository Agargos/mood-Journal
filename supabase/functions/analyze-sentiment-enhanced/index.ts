import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmotionResult {
  label: string;
  score: number;
}

// Coping strategies database
const copingStrategies = {
  stress: [
    "Try the 4-7-8 breathing technique: Inhale for 4, hold for 7, exhale for 8",
    "Take a 5-minute walk outside to clear your mind",
    "Practice progressive muscle relaxation",
    "Write down 3 things you're grateful for today"
  ],
  anxiety: [
    "Ground yourself using the 5-4-3-2-1 technique: 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste",
    "Practice deep belly breathing for 2 minutes",
    "Try mindful meditation for 10 minutes",
    "Challenge negative thoughts with positive affirmations"
  ],
  sadness: [
    "Reach out to a trusted friend or family member",
    "Engage in a hobby you enjoy",
    "Listen to uplifting music or watch a funny video",
    "Practice self-compassion and gentle self-talk"
  ],
  anger: [
    "Count to 10 slowly before responding",
    "Physical exercise like jogging or yoga can help release tension",
    "Practice the STOP technique: Stop, Take a breath, Observe, Proceed mindfully",
    "Express your feelings through journaling or art"
  ],
  joy: [
    "Share your happiness with someone you care about",
    "Take a moment to savor this positive feeling",
    "Consider what led to this joy and how to recreate it",
    "Practice gratitude by writing down what you're thankful for"
  ],
  fear: [
    "Break down your fear into smaller, manageable parts",
    "Practice visualization of positive outcomes",
    "Use grounding techniques to stay present",
    "Remind yourself of past challenges you've overcome"
  ]
};

function mapSentimentToEmotion(text: string, sentiment: string): string[] {
  const lowerText = text.toLowerCase();
  const detectedEmotions: string[] = [];
  
  // Keyword-based emotion detection
  const emotionKeywords = {
    stress: ['stressed', 'overwhelmed', 'pressure', 'deadline', 'busy', 'exhausted'],
    anxiety: ['anxious', 'worried', 'nervous', 'panic', 'afraid', 'scared'],
    sadness: ['sad', 'depressed', 'lonely', 'hurt', 'disappointed', 'upset'],
    anger: ['angry', 'frustrated', 'mad', 'irritated', 'annoyed', 'furious'],
    joy: ['happy', 'excited', 'joyful', 'thrilled', 'delighted', 'amazing'],
    fear: ['fear', 'terrified', 'frightened', 'phobia', 'dread', 'horror']
  };
  
  // Check for emotion keywords
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      detectedEmotions.push(emotion);
    }
  }
  
  // Fallback based on basic sentiment
  if (detectedEmotions.length === 0) {
    if (sentiment === 'POSITIVE') {
      detectedEmotions.push('joy');
    } else if (sentiment === 'NEGATIVE') {
      detectedEmotions.push('sadness');
    }
  }
  
  return detectedEmotions.length > 0 ? detectedEmotions : ['neutral'];
}

function generateCopingStrategy(emotions: string[]): string {
  // Pick the first detected emotion or default to stress
  const primaryEmotion = emotions[0] || 'stress';
  const strategies = copingStrategies[primaryEmotion as keyof typeof copingStrategies] || copingStrategies.stress;
  
  // Return a random strategy
  return strategies[Math.floor(Math.random() * strategies.length)];
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

    console.log('Analyzing enhanced sentiment for text:', text.substring(0, 50) + '...');

    // Call Hugging Face API for basic sentiment analysis
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

    let sentiment = 'NEUTRAL';
    let score = 0.5;
    
    if (huggingFaceResponse.ok) {
      const sentimentData = await huggingFaceResponse.json();
      console.log('Hugging Face response:', sentimentData);

      if (Array.isArray(sentimentData) && sentimentData.length > 0) {
        const sortedResults = sentimentData[0].sort((a: EmotionResult, b: EmotionResult) => b.score - a.score);
        sentiment = sortedResults[0].label;
        score = sortedResults[0].score;
      }
    } else {
      console.error('Hugging Face API error:', huggingFaceResponse.status, await huggingFaceResponse.text());
    }

    // Enhanced emotion detection
    const detectedEmotions = mapSentimentToEmotion(text, sentiment);
    console.log('Detected emotions:', detectedEmotions);
    
    // Generate personalized coping strategy
    const copingStrategy = generateCopingStrategy(detectedEmotions);
    console.log('Generated coping strategy:', copingStrategy);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Save the journal entry to database with enhanced data
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id,
        text,
        tags: tags.length > 0 ? tags : null,
        sentiment,
        score,
        emotions: detectedEmotions,
        coping_strategy: copingStrategy
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('Enhanced journal entry saved successfully:', data.id);

    return new Response(
      JSON.stringify({
        success: true,
        entry: data,
        sentiment,
        score,
        emotions: detectedEmotions,
        copingStrategy,
        message: `I detected ${detectedEmotions.join(', ')} in your entry. Here's a suggestion that might help: ${copingStrategy}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-sentiment-enhanced function:', error);
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