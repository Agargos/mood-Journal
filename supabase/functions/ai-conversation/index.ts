import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  sentiment?: string;
  timestamp: string;
}

const analyzeSentiment = async (text: string) => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
      {
        headers: {
          Authorization: `Bearer ${Deno.env.get('HUGGINGFACE_API_KEY')}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: text }),
      }
    );

    if (!response.ok) {
      console.error(`Sentiment analysis API error: ${response.status} ${response.statusText}`);
      // Return fallback sentiment analysis
      return { label: "NEUTRAL", score: 0.5 };
    }

    const result = await response.json();
    return result[0] || { label: "NEUTRAL", score: 0.5 };
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    // Return fallback sentiment analysis
    return { label: "NEUTRAL", score: 0.5 };
  }
};

const generateResponse = async (userMessage: string, sentiment: string) => {
  // Create fallback responses first
  const fallbackResponses = {
    POSITIVE: "I'm so glad to hear you're feeling good! It's wonderful when we can appreciate the positive moments in life. Keep nurturing this positive energy - maybe by doing something you enjoy or sharing your good mood with someone special.",
    NEGATIVE: "I hear you, and I want you to know that what you're feeling is valid. Difficult emotions are part of being human, and it's okay to feel this way. Would it help to try some deep breathing, write down your thoughts, or reach out to someone you trust?",
    NEUTRAL: "Thank you for sharing with me. Sometimes our feelings can be complex or hard to name. That's completely normal. Is there anything specific on your mind today, or would you like to talk about what's been happening in your life?"
  };

  try {
    // Create a context-aware prompt for the conversational model
    const empathyPrompts = {
      POSITIVE: "The user is feeling positive. Acknowledge their good mood and encourage them to maintain this positive energy.",
      NEGATIVE: "The user is feeling down or negative. Provide empathetic support, validation, and gentle coping suggestions.",
      NEUTRAL: "The user seems neutral. Gently encourage them to share more about their feelings and offer supportive guidance."
    };

    const contextPrompt = `You are a supportive AI companion for emotional well-being. ${empathyPrompts[sentiment as keyof typeof empathyPrompts]} 

User message: "${userMessage}"

Respond with empathy, understanding, and helpful suggestions. Keep your response supportive, warm, and encouraging. Include emotional acknowledgment and practical coping suggestions when appropriate.`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      {
        headers: {
          Authorization: `Bearer ${Deno.env.get('HUGGINGFACE_API_KEY')}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ 
          inputs: contextPrompt,
          parameters: {
            max_length: 200,
            temperature: 0.7,
            do_sample: true
          }
        }),
      }
    );

    if (!response.ok) {
      console.error(`Conversational API error: ${response.status} ${response.statusText}`);
      return fallbackResponses[sentiment as keyof typeof fallbackResponses] || 
             "I'm here to listen and support you. How are you feeling right now, and is there anything you'd like to talk about?";
    }

    const result = await response.json();
    const generatedText = result.generated_text || result[0]?.generated_text;
    
    if (!generatedText) {
      return fallbackResponses[sentiment as keyof typeof fallbackResponses] || 
             "I'm here to support you. Can you tell me more about how you're feeling?";
    }

    return generatedText;
    
  } catch (error) {
    console.error('Conversational model error:', error);
    return fallbackResponses[sentiment as keyof typeof fallbackResponses] || 
           "I'm here to listen and support you. How are you feeling right now, and is there anything you'd like to talk about?";
  }
};

const mapSentimentToMood = (sentiment: string, score: number) => {
  if (sentiment === 'POSITIVE') {
    return score > 0.8 ? 'very happy' : 'happy';
  } else if (sentiment === 'NEGATIVE') {
    return score > 0.8 ? 'very sad' : 'sad';
  }
  return 'neutral';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, conversationHistory } = await req.json();

    if (!message || !userId) {
      return new Response(
        JSON.stringify({ error: 'Message and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing message:', message, 'for user:', userId);

    // Analyze sentiment
    const sentimentResult = await analyzeSentiment(message);
    const sentiment = sentimentResult.label;
    const sentimentScore = sentimentResult.score;

    console.log('Sentiment analysis result:', sentiment, sentimentScore);

    // Generate AI response
    const aiResponse = await generateResponse(message, sentiment);

    console.log('Generated AI response:', aiResponse);

    // Map sentiment to mood for journal entry
    const mood = mapSentimentToMood(sentiment, sentimentScore);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Save conversation to journal entries
    const conversationText = `User: ${message}\nAI Support: ${aiResponse}`;
    
    const { data: journalEntry, error: journalError } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userId,
        text: conversationText,
        sentiment: sentiment.toLowerCase(),
        score: sentiment === 'POSITIVE' ? sentimentScore : -sentimentScore,
        emotions: [mood],
        coping_strategy: aiResponse.includes('try') || aiResponse.includes('suggest') ? 
          aiResponse.split('.')[0] + '.' : null,
        tags: ['ai-chat', 'mood-support']
      })
      .select()
      .single();

    if (journalError) {
      console.error('Error saving journal entry:', journalError);
    }

    return new Response(
      JSON.stringify({
        aiResponse,
        sentiment,
        sentimentScore,
        mood,
        journalEntryId: journalEntry?.id,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-conversation function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});