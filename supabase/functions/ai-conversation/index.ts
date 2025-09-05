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
  const createPersonalizedResponse = (userMessage: string, sentiment: string) => {
    const lowerMessage = userMessage.toLowerCase();
    const messageLength = userMessage.length;
    
    // Extract key emotional words and context
    const emotionalWords = {
      positive: ['happy', 'good', 'great', 'amazing', 'wonderful', 'excited', 'joy', 'love', 'fantastic', 'awesome', 'brilliant', 'excellent', 'perfect', 'thrilled'],
      negative: ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'depressed', 'worried', 'anxious', 'upset', 'frustrated', 'overwhelmed', 'stressed', 'lonely', 'hurt', 'disappointed'],
      work: ['work', 'job', 'boss', 'colleague', 'meeting', 'deadline', 'project', 'office'],
      relationship: ['friend', 'family', 'partner', 'relationship', 'breakup', 'argument', 'love', 'boyfriend', 'girlfriend', 'husband', 'wife'],
      health: ['sick', 'tired', 'exhausted', 'sleep', 'energy', 'pain', 'health'],
      personal: ['myself', 'confidence', 'self', 'identity', 'future', 'goals', 'dreams']
    };
    
    const getContext = () => {
      if (emotionalWords.work.some(word => lowerMessage.includes(word))) return 'work';
      if (emotionalWords.relationship.some(word => lowerMessage.includes(word))) return 'relationship';
      if (emotionalWords.health.some(word => lowerMessage.includes(word))) return 'health';
      if (emotionalWords.personal.some(word => lowerMessage.includes(word))) return 'personal';
      return 'general';
    };
    
    const context = getContext();
    const hasStrongEmotion = emotionalWords.positive.some(word => lowerMessage.includes(word)) || 
                            emotionalWords.negative.some(word => lowerMessage.includes(word));
    
    // Generate varied responses based on sentiment, context, and message characteristics
    if (sentiment === 'POSITIVE') {
      const positiveResponses = [
        `I love hearing the positivity in your message! ${messageLength > 50 ? "You've shared quite a bit, and" : ""} it really shows you're in a good headspace. What's been the highlight that's contributing to these good feelings?`,
        `That's fantastic! Your enthusiasm really comes through. ${context === 'work' ? "It sounds like things are going well professionally." : context === 'relationship' ? "It's wonderful when our relationships bring us joy." : "These positive moments are so important to cherish."} How can you build on this momentum?`,
        `I'm genuinely happy for you! ${hasStrongEmotion ? "The strong positive energy in your words is infectious." : "There's something special about recognizing our good moments."} What would you like to do to celebrate or maintain this feeling?`,
        `What a wonderful message to receive! ${lowerMessage.includes('today') ? "It sounds like today has been treating you well." : "Your positive spirit really shines through."} Tell me more about what's bringing you this joy.`
      ];
      return positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
    } 
    
    else if (sentiment === 'NEGATIVE') {
      const negativeResponses = [
        `I can hear the weight in your words, and I want you to know that sharing difficult feelings takes real courage. ${context === 'work' ? "Work stress can be particularly draining." : context === 'relationship' ? "Relationship challenges can feel especially heavy on our hearts." : context === 'health' ? "When we're not feeling well physically, it affects everything else too." : "Whatever you're going through matters."} What feels most overwhelming right now?`,
        `Thank you for trusting me with these difficult feelings. ${messageLength > 50 ? "I can tell you've put thought into sharing this with me." : "Even in few words, I can sense you're struggling."} You're not alone in feeling this way. What kind of support would feel most helpful?`,
        `I hear you, and what you're experiencing is completely valid. ${hasStrongEmotion ? "These intense emotions can feel overwhelming." : "Sometimes the hardest part is just acknowledging these feelings."} ${context === 'personal' ? "Being hard on ourselves often makes things worse." : "Remember that difficult emotions are temporary, even when they don't feel that way."} How are you taking care of yourself through this?`,
        `Your feelings matter, and I'm glad you felt comfortable sharing them here. ${lowerMessage.includes('lonely') || lowerMessage.includes('alone') ? "Feeling isolated can make everything seem harder." : lowerMessage.includes('tired') || lowerMessage.includes('exhausted') ? "Emotional exhaustion is real and valid." : "Difficult days are part of being human."} What's one small thing that might bring you a moment of comfort today?`
      ];
      return negativeResponses[Math.floor(Math.random() * negativeResponses.length)];
    } 
    
    else {
      const neutralResponses = [
        `Thanks for sharing with me. ${messageLength > 30 ? "I appreciate you taking the time to express your thoughts." : "Sometimes fewer words say just as much."} ${context === 'work' ? "How are things going in your professional life?" : context === 'relationship' ? "How are your relationships feeling lately?" : "How has your day been treating you?"} I'm here to listen to whatever's on your mind.`,
        `I'm here and listening. ${lowerMessage.includes('okay') || lowerMessage.includes('fine') ? "Sometimes 'okay' or 'fine' can mean a lot of different things underneath." : "It sounds like you might have mixed or complex feelings."} ${context === 'health' ? "How are you feeling physically and emotionally?" : "What's been occupying your thoughts lately?"} Feel free to share as much or as little as you'd like.`,
        `Thank you for reaching out. ${messageLength < 20 ? "Sometimes it's hard to find the right words for how we're feeling." : "Your message gives me a sense of where you might be emotionally."} ${context === 'personal' ? "Self-reflection can be both enlightening and challenging." : "Whatever you're processing, you don't have to do it alone."} What would be most helpful to talk through right now?`,
        `I'm glad you're here. ${lowerMessage.includes('confused') || lowerMessage.includes('mixed') ? "Confused or mixed feelings are completely normal." : "Sometimes our emotions exist in that in-between space."} ${context === 'general' ? "Is there anything specific on your mind, or are you just checking in with yourself?" : "What's been on your heart lately?"} I'm here to support you through whatever you're experiencing.`
      ];
      return neutralResponses[Math.floor(Math.random() * neutralResponses.length)];
    }
  };

  // Always use personalized responses for now since API is not working reliably
  console.log("Generating personalized response for:", userMessage, "with sentiment:", sentiment);
  return createPersonalizedResponse(userMessage, sentiment);
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