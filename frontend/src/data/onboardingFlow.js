export const onboardingFlow = [
  // --- CATEGORY 1: REST & PHYSICAL (PHQ-9 & PROMIS) ---
  {
    id: "q1_sleep",
    clinicalMap: "PHQ9_3",
    category: "Rest & Routine",
    question: "First things first—how has your sleep been lately?",
    options: [
      { label: "Deep and restful", weight: 0 },
      { label: "A bit restless some nights", weight: 1 },
      { label: "Struggling to sleep often", weight: 2 },
      { label: "Tossing and turning every night", weight: 3 }
    ]
  },
  {
    id: "q2_energy",
    clinicalMap: "PHQ9_4",
    category: "Rest & Routine",
    question: "How are your energy levels during a typical day?",
    options: [
      { label: "Consistent and steady", weight: 0 },
      { label: "Running a bit low sometimes", weight: 1 },
      { label: "Feeling drained most days", weight: 2 },
      { label: "Completely exhausted", weight: 3 }
    ]
  },
  {
    id: "q3_appetite",
    clinicalMap: "PHQ9_5",
    category: "Rest & Routine",
    question: "Have you noticed any major changes in your appetite or eating habits?",
    options: [
      { label: "Nope, eating normally", weight: 0 },
      { label: "A few minor changes", weight: 1 },
      { label: "Eating noticeably more or less", weight: 2 },
      { label: "Struggling to eat, or eating for comfort constantly", weight: 3 }
    ]
  },
  {
    id: "q4_physical",
    clinicalMap: "PROMIS_1",
    category: "Physical Wellbeing",
    question: "Has physical pain or discomfort been getting in the way of your day-to-day life?",
    options: [
      { label: "Not at all", weight: 0 },
      { label: "A little bit", weight: 1 },
      { label: "Somewhat", weight: 2 },
      { label: "Quite a bit or very much", weight: 3 }
    ]
  },

  // --- CATEGORY 2: FOCUS & DAILY LIFE (PHQ-9 & PSS) ---
  {
    id: "q5_focus",
    clinicalMap: "PHQ9_7",
    category: "Focus & Daily Life",
    question: "When it comes to studying or working, how easy is it to stay focused?",
    options: [
      { label: "In the zone", weight: 0 },
      { label: "Doing okay", weight: 1 },
      { label: "Getting easily distracted", weight: 2 },
      { label: "Finding it really tough to concentrate", weight: 3 }
    ]
  },
  {
    id: "q6_control",
    clinicalMap: "PSS_2_10",
    category: "Focus & Daily Life",
    question: "Do you feel like you have a good handle on things right now, or are tasks piling up?",
    options: [
      { label: "I feel in control", weight: 0 },
      { label: "Managing, but it's busy", weight: 1 },
      { label: "Feeling overwhelmed by my to-do list", weight: 2 },
      { label: "Everything is piling up and out of control", weight: 3 }
    ]
  },
  {
    id: "q7_joy",
    clinicalMap: "PHQ9_1",
    category: "Mood & Joy",
    question: "Are you finding time to enjoy your hobbies or things you usually love?",
    options: [
      { label: "Absolutely", weight: 0 },
      { label: "Most days", weight: 1 },
      { label: "Not as much as I'd like", weight: 2 },
      { label: "It's been hard to find joy in things", weight: 3 }
    ]
  },

  // --- CATEGORY 3: MOOD & EMOTIONS (PHQ-9 & GAD-7) ---
  {
    id: "q8_mood",
    clinicalMap: "PHQ9_2",
    category: "Mood & Joy",
    question: "Overall, how has your mood been over the last week or two?",
    options: [
      { label: "Great", weight: 0 },
      { label: "Good, with some bumps", weight: 1 },
      { label: "Feeling a bit down or low", weight: 2 },
      { label: "Really struggling or feeling hopeless", weight: 3 }
    ]
  },
  {
    id: "q9_selfimage",
    clinicalMap: "PHQ9_6",
    category: "Mood & Joy",
    question: "How have you been feeling about yourself lately?",
    options: [
      { label: "Confident and kind to myself", weight: 0 },
      { label: "Mostly okay", weight: 1 },
      { label: "Being pretty hard on myself", weight: 2 },
      { label: "Feeling like I'm failing or letting people down", weight: 3 }
    ]
  },
  {
    id: "q10_patience",
    clinicalMap: "GAD7_6",
    category: "Mood & Joy",
    question: "How has your patience been with yourself and others?",
    options: [
      { label: "Patient and calm", weight: 0 },
      { label: "Mostly fine", weight: 1 },
      { label: "Getting easily annoyed", weight: 2 },
      { label: "Feeling irritable and snapping easily", weight: 3 }
    ]
  },

  // --- CATEGORY 4: STRESS & NERVOUS SYSTEM (GAD-7) ---
  {
    id: "q11_anxiety",
    clinicalMap: "GAD7_1",
    category: "Stress & Nervous System",
    question: "We all carry stress. How often have you felt overwhelmed, anxious, or on edge recently?",
    options: [
      { label: "Rarely", weight: 0 },
      { label: "Sometimes", weight: 1 },
      { label: "Fairly often", weight: 2 },
      { label: "Almost constantly", weight: 3 }
    ]
  },
  {
    id: "q12_racingthoughts",
    clinicalMap: "GAD7_2_3",
    category: "Stress & Nervous System",
    question: "At the end of the day, how easy is it to switch off your thoughts and stop worrying?",
    options: [
      { label: "Very easy", weight: 0 },
      { label: "Takes a little while", weight: 1 },
      { label: "Pretty difficult", weight: 2 },
      { label: "My mind won't stop racing", weight: 3 }
    ]
  },
  {
    id: "q13_tension",
    clinicalMap: "GAD7_4_5_PHQ9_8",
    category: "Stress & Nervous System",
    question: "Does your body feel tense, or do you feel restless and unable to sit still?",
    options: [
      { label: "Relaxed and calm", weight: 0 },
      { label: "A little tense sometimes", weight: 1 },
      { label: "Hard to relax", weight: 2 },
      { label: "So restless I have to keep moving", weight: 3 }
    ]
  },
  {
    id: "q14_dread",
    clinicalMap: "GAD7_7",
    category: "Stress & Nervous System",
    question: "Do you ever catch yourself feeling afraid that something awful might happen?",
    options: [
      { label: "Never", weight: 0 },
      { label: "Occasionally", weight: 1 },
      { label: "Often", weight: 2 },
      { label: "Yes, it's a constant feeling", weight: 3 }
    ]
  },

  // --- CATEGORY 5: THE DEEP CHECK-IN (PHQ-9 Q9 - SAFETY) ---
  {
    id: "q15_safety",
    clinicalMap: "PHQ9_9",
    category: "Deep Check-In",
    question: "Sometimes when things get heavy, people feel like giving up. Have you had thoughts that you'd be better off not being here, or thoughts of hurting yourself?",
    options: [
      { label: "No, never", weight: 0 },
      { label: "A few fleeting thoughts", weight: 1 },
      { label: "Yes, on multiple days", weight: 2 },
      { label: "Yes, almost every day", weight: 3 }
    ]
  }
];
