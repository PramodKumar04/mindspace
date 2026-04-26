// backend/controllers/resourceController.js
import Resource from '../models/Resource.js';
import UserResult from '../models/UserResult.js';
import { generateResourceTip } from '../services/aiService.js';

// ─── Severity → tag priority map ─────────────────────────────────────────────
const SEVERITY_TAG_MAP = {
  phq9: {
    Minimal: ['general', 'self-care'],
    Mild: ['depression', 'mood', 'self-care'],
    Moderate: ['depression', 'mood', 'mindfulness'],
    'Moderately Severe': ['depression', 'mood', 'crisis'],
    Severe: ['depression', 'crisis', 'mood'],
  },
  gad7: {
    Minimal: ['general', 'self-care'],
    Mild: ['anxiety', 'stress', 'mindfulness'],
    Moderate: ['anxiety', 'panic', 'stress'],
    Severe: ['anxiety', 'panic', 'crisis'],
  },
};

function phq9Severity(score) {
  if (score == null) return 'Unknown';
  if (score <= 4) return 'Minimal';
  if (score <= 9) return 'Mild';
  if (score <= 14) return 'Moderate';
  if (score <= 19) return 'Moderately Severe';
  return 'Severe';
}

function gad7Severity(score) {
  if (score == null) return 'Unknown';
  if (score <= 4) return 'Minimal';
  if (score <= 9) return 'Mild';
  if (score <= 14) return 'Moderate';
  return 'Severe';
}

function scoreResource(resource, priorityTags) {
  return resource.tags.reduce((score, tag) => score + (priorityTags.includes(tag) ? 1 : 0), 0);
}

async function getPriorityTags(userId) {
  try {
    const results = await UserResult.find({ userId }).sort({ createdAt: -1 }).limit(10);
    const latest = {};
    for (const r of results) {
      const key = r.questionnaireType?.toLowerCase();
      if (key && !latest[key]) latest[key] = r;
    }
    const tags = new Set();
    for (const [type, result] of Object.entries(latest)) {
      if (type === 'wellbeing-flow') {
        const pSev = phq9Severity(result.phq9Score);
        const gSev = gad7Severity(result.gad7Score);
        if (SEVERITY_TAG_MAP.phq9[pSev]) SEVERITY_TAG_MAP.phq9[pSev].forEach(t => tags.add(t));
        if (SEVERITY_TAG_MAP.gad7[gSev]) SEVERITY_TAG_MAP.gad7[gSev].forEach(t => tags.add(t));
      } else {
        let severity = result.severityTag || result.severity || result.severityLevel;
        if (severity) {
          severity = severity.replace(/ depression| anxiety/i, '').trim();
          severity = severity.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        }
        const map = SEVERITY_TAG_MAP[type];
        if (map && severity && map[severity]) map[severity].forEach(t => tags.add(t));
      }
    }
    return [...tags];
  } catch {
    return [];
  }
}

// GET /api/resources
export const getResources = async (req, res) => {
  try {
    const { category, type, ranked } = req.query;
    const filter = { collegeId: req.user.collegeId, isActive: true };
    if (category && category !== 'all') filter.category = category;
    if (type && type !== 'all') filter.type = type;

    let resources = await Resource.find(filter).lean();

    if (ranked === 'true' && req.user?.userId) {
      const priorityTags = await getPriorityTags(req.user.userId);
      if (priorityTags.length > 0) {
        resources = resources
          .map(r => ({ ...r, _score: scoreResource(r, priorityTags) }))
          .sort((a, b) => b._score - a._score);
      }
    }

    res.json({ success: true, data: resources });
  } catch (err) {
    console.error('getResources error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch resources' });
  }
};

// GET /api/resources/tip
export const getResourceTip = async (req, res) => {
  try {
    const results = await UserResult.find({ userId: req.user.userId }).sort({ createdAt: -1 }).limit(10);
    if (!results.length) return res.json({ success: true, tip: null });

    const latest = {};
    for (const r of results) {
      const key = r.questionnaireType?.toLowerCase();
      if (key && !latest[key]) latest[key] = r;
    }
    const scores = [];
    for (const [type, r] of Object.entries(latest)) {
      if (type === 'wellbeing-flow') {
        scores.push({
          type: 'PHQ9',
          severity: phq9Severity(r.phq9Score),
          score: r.phq9Score ?? null,
        });
        scores.push({
          type: 'GAD7',
          severity: gad7Severity(r.gad7Score),
          score: r.gad7Score ?? null,
        });
      } else {
        let rawSeverity = r.severityTag || r.severity || r.severityLevel || 'Unknown';
        let cleanSeverity = rawSeverity.replace(/ depression| anxiety/i, '').trim();
        cleanSeverity = cleanSeverity.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        scores.push({
          type: type.toUpperCase(),
          severity: cleanSeverity,
          score: r.totalScore ?? r.score ?? null,
        });
      }
    }

    const tip = await generateResourceTip(scores);
    res.json({ success: true, tip });
  } catch (err) {
    console.error('getResourceTip error:', err);
    res.json({ success: true, tip: null });
  }
};

// GET /api/resources/:id
export const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findOne({ _id: req.params.id, collegeId: req.user.collegeId, isActive: true });
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.json({ success: true, data: resource });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch resource' });
  }
};

// POST /api/resources
export const createResource = async (req, res) => {
  try {
    const { title, description, type, category, tags, url, thumbnail } = req.body;
    const resource = await Resource.create({ title, description, type, category, tags: tags || [], url, thumbnail, collegeId: req.user.collegeId });
    res.status(201).json({ success: true, data: resource });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to create resource' });
  }
};

// PUT /api/resources/:id
export const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findOneAndUpdate({ _id: req.params.id, collegeId: req.user.collegeId }, req.body, { new: true });
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.json({ success: true, data: resource });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update resource' });
  }
};

// DELETE /api/resources/:id
export const deleteResource = async (req, res) => {
  try {
    await Resource.findOneAndUpdate({ _id: req.params.id, collegeId: req.user.collegeId }, { isActive: false });
    res.json({ success: true, message: 'Resource deleted' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete resource' });
  }
};