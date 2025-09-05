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
    const apiKey = Deno.env.get('HUGGINGFACE_API_KEY');
    if (!apiKey) {
      console.error('HUGGINGFACE_API_KEY not found in environment variables');
      return { label: "NEUTRAL", score: 0.5 };
    }

    console.log('Analyzing sentiment for text:', text);
    
    const response = await fetch(
      "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: text }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Sentiment analysis API error: ${response.status} ${response.statusText}`, errorText);
      
      // Simple keyword-based sentiment analysis as fallback
      const lowerText = text.toLowerCase();
      const positiveWords = ['happy', 'good', 'great', 'wonderful', 'excited', 'joy', 'love', 'amazing', 'fantastic', 'excellent'];
      const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'depressed', 'worried', 'anxious', 'upset'];
      
      const hasPositive = positiveWords.some(word => lowerText.includes(word));
      const hasNegative = negativeWords.some(word => lowerText.includes(word));
      
      if (hasPositive && !hasNegative) {
        return { label: "POSITIVE", score: 0.7 };
      } else if (hasNegative && !hasPositive) {
        return { label: "NEGATIVE", score: 0.7 };
      }
      
      return { label: "NEUTRAL", score: 0.5 };
    }

    const result = await response.json();
    console.log('Sentiment API result:', result);
    return result[0] || { label: "NEUTRAL", score: 0.5 };
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return { label: "NEUTRAL", score: 0.5 };
  }
};

const generateResponse = async (userMessage: string, sentiment: string) => {
  // Create more varied responses based on sentiment and message content
  const createPersonalizedResponse = (userMessage: string, sentiment: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (sentiment === 'POSITIVE') {
      if (lowerMessage.includes('happy') || lowerMessage.includes('good') || lowerMessage.includes('great')) {
        return "That's wonderful to hear! It sounds like you're in a really good place right now. What's been contributing to these positive feelings? Sometimes it helps to reflect on the good moments so we can appreciate them fully.";
      }
      return "I'm so glad you're feeling positive! Your energy comes through in your message. It's beautiful when we can recognize and embrace these uplifting moments. What would you like to do to celebrate or maintain this good feeling?";
    } else if (sentiment === 'NEGATIVE') {
      if (lowerMessage.includes('sad') || lowerMessage.includes('upset')) {
        return "I hear that you're going through a difficult time, and I want you to know that your feelings are completely valid. It's okay to feel sad - it shows how deeply you care. Would it help to talk about what's weighing on your heart, or would you prefer some gentle coping strategies?";
      }
      if (lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
        return "It sounds like anxiety is weighing heavily on you right now. That can feel really overwhelming. Remember that you've gotten through difficult days before, and you have the strength to get through this too. Have you tried any breathing exercises or grounding techniques that help you feel more centered?";
      }
      return "I can sense that you're struggling with some difficult emotions. That takes courage to acknowledge and share. You're not alone in feeling this way - it's part of being human. What kind of support feels most helpful to you right now?";
    } else {
      if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted')) {
        return "It sounds like you might be feeling drained or overwhelmed. Sometimes when we're tired, it can be hard to connect with our emotions. That's completely normal. Are you getting enough rest, or is there something specific that's been draining your energy?";
      }
      return "Thank you for sharing with me. Sometimes our feelings can be complex or in between - not clearly positive or negative, and that's perfectly okay. How has your day been treating you? Is there anything specific you'd like to explore or talk through?";
    }
  };

  const apiKey = Deno.env.get('HUGGINGFACE_API_KEY');
  
  // If no API key, use personalized responses
  if (!apiKey) {
    console.log('No API key found, using personalized fallback response');
    return createPersonalizedResponse(userMessage, sentiment);
  }

  try {
    console.log('Attempting to generate AI response for:', userMessage, 'with sentiment:', sentiment);
    
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ 
          inputs: userMessage,
          parameters: {
            max_length: 100,
            temperature: 0.8,
            do_sample: true,
            pad_token_id: 50256
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Conversational API error: ${response.status} ${response.statusText}`, errorText);
      return createPersonalizedResponse(userMessage, sentiment);
    }

    const result = await response.json();
    console.log('Conversational API result:', result);
    
    const generatedText = result.generated_text || result[0]?.generated_text;
    
    if (!generatedText || generatedText.trim() === userMessage.trim()) {
      console.log('No valid AI response, using personalized fallback');
      return createPersonalizedResponse(userMessage, sentiment);
    }

    // Clean up the generated text to remove the input prompt
    const cleanResponse = generatedText.replace(userMessage, '').trim();
    return cleanResponse || createPersonalizedResponse(userMessage, sentiment);
    
  } catch (error) {
    console.error('Conversational model error:', error);
    return createPersonalizedResponse(userMessage, sentiment);
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