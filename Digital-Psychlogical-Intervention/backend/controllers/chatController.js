import ChatSession from "../models/ChatSession.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import UserResult from "../models/UserResult.js";
import { getChatResponse, analyzeSession } from "../services/aiService.js";

/**
 * Get the active session for the current user or create a new one.
 */
export const getOrCreateSession = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    let session = await ChatSession.findOne({
      userId,
      status: "active"
    }).populate("messages");

    if (!session) {
      session = await ChatSession.create({
        userId,
        collegeId: req.user.collegeId,
        status: "active",
        riskLevel: "low",
        emotionTags: [],
        messages: []
      });
    }

    res.json({ success: true, session, messages: session.messages || [] });
  } catch (err) {
    console.error("getOrCreateSession error:", err);
    next(err);
  }
};

/**
 * Send a message to the AI and get a response.
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body; // Match existing route body field
    const userId = req.user.userId;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: "Message cannot be empty" });
    }

    // Get or validate session
    let session = await ChatSession.findOne({ userId, status: "active" });

    if (!session) {
      session = await ChatSession.create({
        userId,
        collegeId: req.user.collegeId,
        status: "active",
        riskLevel: "low",
        emotionTags: [],
        messages: []
      });
    }

    // Save user message
    const userMsg = await Message.create({
      sessionId: session._id,
      role: "user",
      content: content.trim()
    });
    session.messages.push(userMsg._id);

    // Build conversation history for context (last 12 messages)
    const history = await Message.find({ sessionId: session._id })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();
    
    // Reverse to get chronological order for AI
    const conversationHistory = history.reverse();

    // Call Groq AI
    const aiResult = await getChatResponse(content.trim(), conversationHistory);

    // Save AI response
    const aiMsg = await Message.create({
      sessionId: session._id,
      role: "assistant",
      content: aiResult.message,
      metadata: {
        emotionTags: aiResult.emotionTags,
        riskLevel: aiResult.riskLevel,
        trend: aiResult.trend,
        escalate: aiResult.escalate
      }
    });
    session.messages.push(aiMsg._id);

    // Update session risk level
    const riskOrder = { low: 0, moderate: 1, high: 2 };
    const currentRisk = riskOrder[session.riskLevel] ?? 0;
    const newRisk = riskOrder[aiResult.riskLevel] ?? 0;

    if (newRisk >= currentRisk) {
      session.riskLevel = aiResult.riskLevel;
    }

    // Merge emotion tags (deduplicated)
    const allTags = new Set([...session.emotionTags, ...(aiResult.emotionTags || [])]);
    session.emotionTags = [...allTags];

    // Flag for admin intervention if high risk or AI explicitly requested escalation
    if (aiResult.escalate || aiResult.riskLevel === 'high') {
      session.flaggedForReview = true;
      session.isFlagged = true;
      session.flagReason = "High risk / distress detected by Aura AI";

      // Also flag user account for counsellor visibility (using existing field or logic)
      await User.findByIdAndUpdate(userId, { needsIntervention: true });
    }

    await session.save();

    res.json({
      success: true,
      message: aiMsg,
      session: {
        _id: session._id,
        riskLevel: session.riskLevel,
        emotionTags: session.emotionTags,
        flaggedForReview: session.flaggedForReview
      }
    });

  } catch (err) {
    console.error("sendMessage error:", err);
    next(err);
  }
};

/**
 * Close the session and perform final analysis.
 */
export const closeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const session = await ChatSession.findOne({ _id: sessionId, userId })
      .populate("messages");

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    // Run session-level analysis
    const analysis = await analyzeSession(session.messages);

    session.status = "closed";
    session.closedAt = new Date();
    session.sessionSummary = analysis;
    
    if (analysis.overallRisk === "high") {
      session.flaggedForReview = true;
      session.isFlagged = true;
    }

    await session.save();

    res.json({ success: true, message: "Session closed", summary: analysis });
  } catch (err) {
    console.error("closeSession error:", err);
    next(err);
  }
};

/**
 * Get session history for the current user.
 */
export const getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const sessions = await ChatSession.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({
        path: "messages",
        options: { sort: { createdAt: 1 } }
      });

    res.json({ success: true, sessions });
  } catch (err) {
    console.error("getChatHistory error:", err);
    next(err);
  }
};

/**
 * Get clinical insights for a specific student (Counselor only)
 */
export const getStudentInsights = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // 1. Get recent chat sessions and aggregate sentiments
    const sessions = await ChatSession.find({ userId: studentId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const emotions = [...new Set(sessions.flatMap(s => s.emotionTags || []))];
    const riskLevel = sessions.length > 0 ? sessions[0].riskLevel : 'unknown';

    // 2. Get recent mood check-ins (UserResults)
    const moodHistory = await UserResult.find({ userId: studentId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // 3. Get student basic info
    const student = await User.findById(studentId).select('name email alias');

    res.json({
      success: true,
      insights: {
        student,
        emotions,
        riskLevel,
        moodHistory,
        recentSessions: sessions.map(s => ({
          date: s.createdAt,
          summary: s.sessionSummary,
          risk: s.riskLevel
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};
