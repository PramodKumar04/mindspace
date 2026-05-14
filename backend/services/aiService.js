import Groq from 'groq-sdk';

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('CRITICAL: GROQ_API_KEY is missing in environment variables');
    return null;
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
    const groq = getGroqClient();
    if (!groq) {
      throw new Error('Groq client could not be initialized');
    }

    const formattedHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    // Use model from env or fallback to a highly available one
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    const completion = await groq.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...formattedHistory,
        { role: 'user', content }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const responseContent = completion.choices[0]?.message?.content || '{}';
    let result;
    try {
      result = JSON.parse(responseContent);
    } catch (parseError) {
      console.warn('AI JSON parse error, attempting fallback extraction:', parseError.message);
      // Fallback: try to extract JSON if model returned extra text
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }
    
    return {
      message: result.message || "I'm listening. Can you tell me more about how you're feeling?",
      emotionTags: result.emotionTags || [],
      riskLevel: result.riskLevel || 'low',
      trend: result.trend || 'stable',
      escalate: result.escalate || false
    };
  } catch (error) {
    console.error('Groq API Error Details:', error?.message || error);
    
    // If it's a model error or unauthorized, we might want to try a smaller model as a silent fallback
    if (error?.message?.includes('model_not_found') || error?.message?.includes('rate_limit')) {
       console.log('Attempting secondary fallback to llama-3.1-8b-instant...');
       try {
         const groq = getGroqClient();
         const completion = await groq.chat.completions.create({
           model: 'llama-3.1-8b-instant',
           messages: [
             { role: 'system', content: SYSTEM_PROMPT },
             { role: 'user', content }
           ],
           temperature: 0.7,
           max_tokens: 500,
           response_format: { type: 'json_object' }
         });
         const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
         return {
           message: result.message || "I hear you. I'm here to support you.",
           emotionTags: result.emotionTags || [],
           riskLevel: result.riskLevel || 'low',
           trend: result.trend || 'stable',
           escalate: result.escalate || false
         };
       } catch (innerError) {
         console.error('Secondary fallback also failed:', innerError.message);
       }
    }

    // Mock response fallback for when Groq API keys are invalid or missing
    console.log('Using mock AI response as fallback due to API error.');
    
    // Simple logic to make the mock slightly contextual
    const lowerContent = content.toLowerCase();
    let mockMessage = "I'm here for you. It sounds like you're going through a lot. Want to talk more about it?";
    let mockEmotions = ['listening'];
    
    if (lowerContent.includes('stress') || lowerContent.includes('overwhelm')) {
        mockMessage = "Stress can feel really heavy. Remember to take things one step at a time. Have you tried any grounding exercises today?";
        mockEmotions = ['stressed', 'supported'];
    } else if (lowerContent.includes('sad') || lowerContent.includes('down')) {
        mockMessage = "I'm sorry you're feeling down. It's okay to feel this way. I'm here to listen without judgment.";
        mockEmotions = ['sad', 'empathy'];
    }

    return {
      message: mockMessage,
      emotionTags: mockEmotions,
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
    if (!groq) return { summary: "Analysis unavailable.", overallRisk: "low" };

    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    const completion = await groq.chat.completions.create({
      model: model,
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
    if (!groq) return "Take a look at these resources we've curated for you.";

    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    const completion = await groq.chat.completions.create({
      model: model,
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
