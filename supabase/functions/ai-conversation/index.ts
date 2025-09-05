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
    
    // Detect user intent and request types
    const isAdviceRequest = lowerMessage.includes('advice') || lowerMessage.includes('help me') || 
                           lowerMessage.includes('how to') || lowerMessage.includes('what should') ||
                           lowerMessage.includes('tell me how') || lowerMessage.includes('guide me') ||
                           lowerMessage.includes('teach me') || lowerMessage.includes('tips');
    
    const isQuestion = lowerMessage.includes('?') || lowerMessage.startsWith('how') || 
                      lowerMessage.startsWith('what') || lowerMessage.startsWith('why') ||
                      lowerMessage.startsWith('when') || lowerMessage.startsWith('where');
    
    // Extract key topics and emotional words
    const topics = {
      happiness: ['happy', 'happiness', 'joy', 'cheerful', 'positive', 'upbeat'],
      stress: ['stress', 'stressed', 'pressure', 'overwhelmed', 'anxiety', 'anxious'],
      relationships: ['relationship', 'friend', 'family', 'partner', 'boyfriend', 'girlfriend', 'marriage'],
      work: ['work', 'job', 'career', 'boss', 'colleague', 'workplace', 'professional'],
      health: ['health', 'wellness', 'fitness', 'exercise', 'diet', 'sleep'],
      confidence: ['confidence', 'self-esteem', 'self-worth', 'believe in myself'],
      goals: ['goals', 'motivation', 'achievement', 'success', 'progress'],
      sadness: ['sad', 'depression', 'lonely', 'isolated', 'grief', 'loss']
    };
    
    const getTopic = () => {
      for (const [topic, keywords] of Object.entries(topics)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
          return topic;
        }
      }
      return 'general';
    };
    
    const topic = getTopic();
    
    // Provide specific advice when requested
    if (isAdviceRequest || isQuestion) {
      const adviceResponses = {
        happiness: [
          "Here are some evidence-based ways to boost happiness: 1) Practice gratitude daily - write down 3 things you're grateful for. 2) Connect with others - strong relationships are key to wellbeing. 3) Engage in activities that give you a sense of purpose. 4) Exercise regularly - it naturally boosts mood. 5) Practice mindfulness or meditation. 6) Help others - acts of kindness increase our own happiness. What resonates most with you from these suggestions?",
          "Building happiness is a daily practice! Try these: Set small, achievable goals each day. Spend time in nature. Limit social media comparison. Focus on experiences over material things. Practice self-compassion when you make mistakes. Celebrate small wins. Which of these feels most doable for you right now?"
        ],
        stress: [
          "For managing stress, try these techniques: 1) Deep breathing exercises - inhale for 4, hold for 4, exhale for 6. 2) Break big tasks into smaller, manageable steps. 3) Set boundaries and learn to say no. 4) Schedule regular breaks throughout your day. 5) Practice progressive muscle relaxation. 6) Talk to someone you trust. What type of stress are you dealing with most?",
          "Stress management strategies that work: Identify your stress triggers and plan responses. Use the 5-4-3-2-1 grounding technique (5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste). Prioritize sleep and nutrition. Try journaling your thoughts. Consider if this stress will matter in 5 years. Which area of your life feels most stressful right now?"
        ],
        relationships: [
          "Building healthy relationships: 1) Practice active listening - really hear what others are saying. 2) Communicate openly and honestly about your needs. 3) Show appreciation regularly. 4) Respect boundaries (yours and theirs). 5) Make time for quality connection. 6) Address conflicts early and calmly. What specific relationship challenge are you facing?",
          "Relationship advice: Be genuinely curious about others' perspectives. Practice empathy and try to understand before being understood. Share your authentic self - vulnerability builds connection. Learn each other's love languages. Forgive small things quickly. Create shared positive experiences. What kind of relationship support do you need most?"
        ],
        work: [
          "For work satisfaction: 1) Set clear daily priorities and focus on high-impact tasks. 2) Build positive relationships with colleagues. 3) Seek feedback and opportunities to grow. 4) Maintain work-life boundaries. 5) Find meaning in your contributions. 6) Take breaks to prevent burnout. What's your biggest work challenge right now?",
          "Career advice: Continuously learn new skills. Build a professional network. Communicate your achievements to supervisors. Ask for help when needed. Take on projects that align with your strengths. Plan your next career steps. What aspect of your work life would you like to improve?"
        ],
        confidence: [
          "Building confidence: 1) Challenge negative self-talk - ask 'would I say this to a friend?' 2) Celebrate your achievements, even small ones. 3) Set and accomplish small goals regularly. 4) Practice good posture and self-care. 5) Surround yourself with supportive people. 6) Learn from failures instead of dwelling on them. What situations make you feel less confident?",
          "Confidence-building strategies: Keep a success journal of your accomplishments. Practice skills until they become natural. Prepare well for challenges. Use positive affirmations that feel authentic. Step outside your comfort zone gradually. Remember past times you overcame difficulties. What would you like to feel more confident about?"
        ],
        goals: [
          "Achieving goals effectively: 1) Make them SMART (Specific, Measurable, Achievable, Relevant, Time-bound). 2) Break them into daily actions. 3) Track your progress visually. 4) Share them with an accountability partner. 5) Adjust strategies as needed. 6) Celebrate milestones along the way. What goal are you working toward?",
          "Goal-setting advice: Start with your 'why' - understand what truly motivates you. Focus on process goals (what you do) over outcome goals (what happens). Create systems and habits that support your goals. Plan for obstacles and setbacks. Review and adjust regularly. What's your most important goal right now?"
        ],
        general: [
          "Here's some general life advice: Focus on what you can control and let go of what you can't. Invest in relationships and experiences over material things. Learn continuously and stay curious. Practice self-compassion during difficult times. Take care of your physical and mental health. Find activities that bring you joy and meaning. What area of your life would you like to improve most?",
          "Life guidance: Trust the process of growth - progress isn't always linear. Build resilience by viewing challenges as opportunities to learn. Create routines that support your wellbeing. Be patient with yourself as you develop new habits. Seek help when you need it - it's a sign of strength. What's one thing you'd like to work on in your life?"
        ]
      };
      
      const responses = adviceResponses[topic as keyof typeof adviceResponses] || adviceResponses.general;
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Continue with emotion-based responses for non-advice messages
    if (sentiment === 'POSITIVE') {
      const positiveResponses = [
        `I love hearing the positivity in your message! ${messageLength > 50 ? "You've shared quite a bit, and" : ""} it really shows you're in a good headspace. What's been the highlight that's contributing to these good feelings?`,
        `That's fantastic! Your enthusiasm really comes through. ${topic === 'work' ? "It sounds like things are going well professionally." : topic === 'relationships' ? "It's wonderful when our relationships bring us joy." : "These positive moments are so important to cherish."} How can you build on this momentum?`,
        `I'm genuinely happy for you! ${topic === 'confidence' ? "Building confidence is such an empowering journey." : "The strong positive energy in your words is infectious."} What would you like to do to celebrate or maintain this feeling?`
      ];
      return positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
    } 
    
    else if (sentiment === 'NEGATIVE') {
      const negativeResponses = [
        `I can hear the weight in your words, and I want you to know that sharing difficult feelings takes real courage. ${topic === 'work' ? "Work stress can be particularly draining." : topic === 'relationships' ? "Relationship challenges can feel especially heavy on our hearts." : "Whatever you're going through matters."} What feels most overwhelming right now?`,
        `Thank you for trusting me with these difficult feelings. ${messageLength > 50 ? "I can tell you've put thought into sharing this with me." : "Even in few words, I can sense you're struggling."} You're not alone in feeling this way. What kind of support would feel most helpful?`,
        `Your feelings matter, and I'm glad you felt comfortable sharing them here. ${topic === 'sadness' ? "Sadness is a natural response to loss or disappointment." : topic === 'stress' ? "Stress can make everything feel more difficult." : "Difficult emotions are part of being human."} What's one small thing that might bring you a moment of comfort today?`
      ];
      return negativeResponses[Math.floor(Math.random() * negativeResponses.length)];
    } 
    
    else {
      const neutralResponses = [
        `Thanks for sharing with me. ${messageLength > 30 ? "I appreciate you taking the time to express your thoughts." : "Sometimes fewer words say just as much."} ${topic === 'work' ? "How are things going in your professional life?" : topic === 'relationships' ? "How are your relationships feeling lately?" : "How has your day been treating you?"} I'm here to listen to whatever's on your mind.`,
        `I'm here and listening. ${lowerMessage.includes('okay') || lowerMessage.includes('fine') ? "Sometimes 'okay' or 'fine' can mean a lot of different things underneath." : "It sounds like you might have mixed or complex feelings."} What would be most helpful to talk through right now?`
      ];
      return neutralResponses[Math.floor(Math.random() * neutralResponses.length)];
    }
  };

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