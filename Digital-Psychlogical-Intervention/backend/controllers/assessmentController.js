import UserResult from '../models/UserResult.js';
import User from '../models/User.js';

// ── Severity helpers ──────────────────────────────────────────────────────────
function phq9Severity(score) {
  if (score <= 4) return 'Minimal';
  if (score <= 9) return 'Mild';
  if (score <= 14) return 'Moderate';
  if (score <= 19) return 'Moderately Severe';
  return 'Severe';
}

function gad7Severity(score) {
  if (score <= 4) return 'Minimal';
  if (score <= 9) return 'Mild';
  if (score <= 14) return 'Moderate';
  return 'Severe';
}

// ── GET /api/assessments/results ──────────────────────────────────────────────
export const getResults = async (req, res) => {
  try {
    const results = await UserResult.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── POST /api/assessments/results (legacy — single questionnaire) ────────────
export const saveResult = async (req, res) => {
  try {
    const { questionnaireType, totalScore, severityTag } = req.body;
    const result = await UserResult.create({
      userId:            req.user.userId,
      collegeId:         req.user.collegeId,
      questionnaireType,
      totalScore,
      severityTag,
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── POST /api/assessments/submit-flow ─────────────────────────────────────────
// Accepts: { answers: [{ clinicalMap, weight }], isOnboarding: bool }
export const submitFlow = async (req, res) => {
  try {
    const { answers, isOnboarding } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'answers array is required' });
    }

    // Calculate sub-scores
    let phq9Score = 0, gad7Score = 0, pssScore = 0, promisScore = 0;

    for (const a of answers) {
      const map = a.clinicalMap || '';
      const w = a.weight || 0;

      if (map.includes('PHQ9')) phq9Score += w;
      if (map.includes('GAD7')) gad7Score += w;
      if (map.includes('PSS'))  pssScore  += w;
      if (map.includes('PROMIS')) promisScore += w;
    }

    const totalScore = phq9Score + gad7Score + pssScore + promisScore;

    // Build composite severity tag
    const phq9Sev = phq9Severity(phq9Score);
    const gad7Sev = gad7Severity(gad7Score);
    const severityTag = `PHQ-9: ${phq9Sev}, GAD-7: ${gad7Sev}`;

    // Safety flag: PHQ9_9 (suicidal ideation)
    const safetyAnswer = answers.find(a => a.clinicalMap === 'PHQ9_9');
    const needsIntervention = safetyAnswer && safetyAnswer.weight > 0;

    // Save result
    const result = await UserResult.create({
      userId: req.user.userId,
      collegeId: req.user.collegeId,
      questionnaireType: 'wellbeing-flow',
      totalScore,
      severityTag,
      phq9Score,
      gad7Score,
      pssScore,
      promisScore,
    });

    // Update user flags
    const updateFields = {};
    if (needsIntervention) updateFields.needsIntervention = true;
    if (isOnboarding) updateFields.hasCompletedOnboarding = true;

    let updatedUser = null;
    if (Object.keys(updateFields).length > 0) {
      updatedUser = await User.findByIdAndUpdate(
        req.user.userId,
        updateFields,
        { new: true }
      ).select('-password');
    }

    res.status(201).json({
      success: true,
      result,
      phq9Score,
      gad7Score,
      pssScore,
      promisScore,
      severityTag,
      needsIntervention: !!needsIntervention,
      user: updatedUser ? {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        collegeId: updatedUser.collegeId,
        alias: updatedUser.alias,
        hasCompletedOnboarding: updatedUser.hasCompletedOnboarding,
      } : undefined,
    });
  } catch (err) {
    console.error('submitFlow error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── DELETE /api/assessments/results/:id ───────────────────────────────────────
export const deleteResult = async (req, res) => {
  try {
    const result = await UserResult.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    res.json({ message: 'Result deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};