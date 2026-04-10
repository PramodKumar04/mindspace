/**
 * Risk Detection Service
 * Scans messages for high-risk keywords and calculates risk scores
 */

// High-risk keywords that indicate immediate danger
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'not want to live',
  'harm myself', 'hurt myself', 'self harm', 'cutting',
  'overdose', 'take pills', 'jump off', 'hang myself'
];

// Moderate-risk keywords
const MODERATE_RISK_KEYWORDS = [
  'hopeless', 'no point', 'worthless', 'useless',
  'give up', 'can\'t go on', 'too much', 'overwhelmed',
  'can\'t cope', 'breaking down', 'losing control'
];

/**
 * Scan message for risk keywords
 * @param {string} message - User message
 * @returns {Object} { hasRisk: boolean, keywords: string[], level: 'crisis'|'moderate'|'low' }
 */
export const scanForRisk = (message) => {
  const lowerMessage = message.toLowerCase();
  const foundKeywords = [];

  // Check for crisis keywords
  for (const keyword of CRISIS_KEYWORDS) {
    if (lowerMessage.includes(keyword)) {
      foundKeywords.push(keyword);
      return {
        hasRisk: true,
        keywords: foundKeywords,
        level: 'crisis'
      };
    }
  }

  // Check for moderate risk keywords
  for (const keyword of MODERATE_RISK_KEYWORDS) {
    if (lowerMessage.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  }

  if (foundKeywords.length > 0) {
    return {
      hasRisk: true,
      keywords: foundKeywords,
      level: 'moderate'
    };
  }

  return {
    hasRisk: false,
    keywords: [],
    level: 'low'
  };
};

/**
 * Calculate risk score based on message content
 * @param {string} message - User message
 * @param {number} currentRiskScore - Current session risk score
 * @returns {number} Updated risk score (0-100)
 */
export const calculateRiskScore = (message, currentRiskScore = 0) => {
  const scanResult = scanForRisk(message);
  
  if (scanResult.level === 'crisis') {
    return Math.min(100, currentRiskScore + 50);
  }
  
  if (scanResult.level === 'moderate') {
    return Math.min(100, currentRiskScore + 15);
  }
  
  // Low risk - slight increase or maintain
  return Math.min(100, currentRiskScore + 2);
};

/**
 * Get crisis response message
 * @returns {string} Crisis support message
 */
export const getCrisisResponse = () => {
  return `I'm really concerned about what you've shared. Your safety is the most important thing right now.

Please reach out for immediate help:
- National Suicide Prevention Lifeline: 988 (available 24/7)
- Crisis Text Line: Text HOME to 741741
- Emergency Services: 911

I strongly encourage you to speak with a professional counselor as soon as possible. Would you like me to help you book an immediate counseling session? You're not alone, and there are people who want to help you.`;
};

/**
 * Check if risk score exceeds threshold
 * @param {number} riskScore - Current risk score
 * @param {number} threshold - Risk threshold (default: 30)
 * @returns {boolean}
 */
export const exceedsRiskThreshold = (riskScore, threshold = 30) => {
  return riskScore >= threshold;
};
