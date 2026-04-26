import Groq from 'groq-sdk';

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is missing in environment variables');
  }
  return new Groq({ apiKey });
};

const SYSTEM_PROMPT = `You are Aura, a warm and empathetic mental health support companion for college students. You are NOT a therapist, but you are a compassionate first line of support.

Personality: Warm, non-judgmental, validate feelings, speak naturally.

Capabilities: Empathetic listening, gentle coping strategies (breathing, grounding), identifying crisis.

JSON Response Format:
{
  "message": "Your empathetic response string",
  "emotionTags": ["tag1", "tag2"],
  "riskLevel": "low" | "moderate" | "high",
  "trend": "improving" | "stable" | "declining",
  "escalate": boolean (true if risk is high or self-harm mentioned)
}

CRITICAL RULES:
1. NEVER diagnose.
2. If self-harm/crisis mentioned, set escalate: true and riskLevel: high.
3. Keep response text (message) warm and conversational.
4. Respond ONLY with valid JSON.`;

/**
 * Get AI response for a message within a conversation history
 */
export async function getChatResponse(content, history = []) {
  try {
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...formattedHistory,
        { role: 'user', content }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    
    // Fallback if AI fails to provide a good message
    if (!result.message) {
      result.message = "I hear you, and I'm here to support you. Can you tell me more about what's on your mind?";
    }
    
    return {
      message: result.message,
      emotionTags: result.emotionTags || [],
      riskLevel: result.riskLevel || 'low',
      trend: result.trend || 'stable',
      escalate: result.escalate || false
    };
  } catch (error) {
    console.error('Groq API error:', error?.message || error);
    return {
      message: "I'm having a little trouble connecting right now, but I'm still here. If you're in crisis, please call iCall: 9152987821. Otherwise, please try again in a moment.",
      emotionTags: ['connection-error'],
      riskLevel: 'low',
      trend: 'stable',
      escalate: false
    };
  }
}

/**
 * Analyze a full session history to provide a summary and final risk check
 */
export async function analyzeSession(messages = []) {
  try {
    if (messages.length === 0) return { summary: "No conversation history.", overallRisk: "low" };

    const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { 
          role: 'system', 
          content: 'Analyze the following mental health support session. Provide a concise summary of the student\'s concerns and an overall risk assessment. Respond in JSON format: {"summary": "string", "overallRisk": "low"|"moderate"|"high", "keyConcerns": ["string"]}' 
        },
        { role: 'user', content: conversationText }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0]?.message?.content || '{}');
  } catch (error) {
    console.error('Session analysis error:', error);
    return { summary: "Analysis failed.", overallRisk: "low" };
  }
}

/**
 * Placeholder for backward compatibility
 */
export const getAIResponseJSON = getChatResponse;

/**
 * @param {Array<{type: string, severity: string, score: number|null}>} scores
 * @returns {Promise<string>}
 */
export const generateResourceTip = async (scores) => {
  const summary = scores.map((s) => `${s.type}: ${s.severity}`).join(', ');

  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You write one warm, supportive sentence for a student mental health platform. ' +
            "You are given the student's current severity levels from recent screenings. " +
            'Acknowledge how they might be feeling and gently encourage them to explore the resources. ' +
            'Never mention specific scores, numbers, or clinical terms. Keep it under 35 words.'
        },
        { role: 'user', content: `Student screening results: ${summary}. Write the tip.` }
      ],
      temperature: 0.7,
      max_tokens: 100
    });

    return completion.choices[0]?.message?.content?.trim() || "Take a look at these resources we've curated for you.";
  } catch (err) {
    console.error('generateResourceTip error:', err.message);
    return "Here are some resources that might be helpful today.";
  }
};
