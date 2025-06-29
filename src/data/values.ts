// Comprehensive values list organized by meaningful categories
export interface Value {
  id: string;
  name: string;
  description: string;
  category: string;
}

export const allValues: Value[] = [
  // Achievement - Drive to accomplish, succeed, and grow personally or professionally
  { id: '1', name: 'Ambition', description: 'Strong desire for achievement and success', category: 'Achievement' },
  { id: '2', name: 'Excellence', description: 'Striving for the highest quality in everything', category: 'Achievement' },
  { id: '3', name: 'Mastery', description: 'Achieving expert-level skill and knowledge', category: 'Achievement' },
  { id: '4', name: 'Discipline', description: 'Self-control and structured approach to goals', category: 'Achievement' },
  { id: '5', name: 'Focus', description: 'Directed attention and concentration on priorities', category: 'Achievement' },
  { id: '6', name: 'Success', description: 'Achieving desired outcomes and goals', category: 'Achievement' },
  { id: '7', name: 'Achievement', description: 'Accomplishing goals and reaching milestones', category: 'Achievement' },
  { id: '8', name: 'Performance', description: 'Executing tasks with skill and efficiency', category: 'Achievement' },
  { id: '9', name: 'Productivity', description: 'Efficiently creating value and results', category: 'Achievement' },
  { id: '10', name: 'Leadership', description: 'Guiding and inspiring others toward goals', category: 'Achievement' },
  { id: '11', name: 'Determination', description: 'Persistence in pursuing goals despite obstacles', category: 'Achievement' },
  { id: '12', name: 'Growth', description: 'Continuous development and improvement', category: 'Achievement' },
  { id: '13', name: 'Competence', description: 'Having the necessary skills and knowledge', category: 'Achievement' },
  { id: '14', name: 'Recognition', description: 'Acknowledgment for achievements and contributions', category: 'Achievement' },
  { id: '15', name: 'Influence', description: 'Having positive impact and effect on others', category: 'Achievement' },

  // Connection - Values that prioritize relationships, love, and belonging
  { id: '16', name: 'Compassion', description: 'Empathy and concern for others\' suffering', category: 'Connection' },
  { id: '17', name: 'Loyalty', description: 'Faithful allegiance and support to others', category: 'Connection' },
  { id: '18', name: 'Kindness', description: 'Gentle and caring treatment of others', category: 'Connection' },
  { id: '19', name: 'Friendship', description: 'Meaningful personal relationships and bonds', category: 'Connection' },
  { id: '20', name: 'Family', description: 'Close relationships and kinship bonds', category: 'Connection' },
  { id: '21', name: 'Love', description: 'Deep affection and care for others', category: 'Connection' },
  { id: '22', name: 'Community', description: 'Belonging and connection with groups', category: 'Connection' },
  { id: '23', name: 'Connection', description: 'Meaningful relationships and emotional bonds', category: 'Connection' },
  { id: '24', name: 'Empathy', description: 'Understanding and sharing others\' feelings', category: 'Connection' },
  { id: '25', name: 'Support', description: 'Providing help and encouragement to others', category: 'Connection' },
  { id: '26', name: 'Teamwork', description: 'Collaborative effort toward shared goals', category: 'Connection' },
  { id: '27', name: 'Generosity', description: 'Giving freely and abundantly to others', category: 'Connection' },
  { id: '28', name: 'Cooperation', description: 'Working together toward common goals', category: 'Connection' },
  { id: '29', name: 'Trust', description: 'Building and maintaining confidence with others', category: 'Connection' },
  { id: '30', name: 'Respect', description: 'Regard and consideration for others', category: 'Connection' },

  // Inner Compass - Self-directed principles and personal integrity
  { id: '31', name: 'Authenticity', description: 'Being true to your genuine self', category: 'Inner Compass' },
  { id: '32', name: 'Honesty', description: 'Truthfulness and sincerity in words and actions', category: 'Inner Compass' },
  { id: '33', name: 'Integrity', description: 'Acting with moral principles and consistency', category: 'Inner Compass' },
  { id: '34', name: 'Courage', description: 'Bravery in facing fear and adversity', category: 'Inner Compass' },
  { id: '35', name: 'Clarity', description: 'Clear understanding and transparent thinking', category: 'Inner Compass' },
  { id: '36', name: 'Wisdom', description: 'Deep understanding combined with experience', category: 'Inner Compass' },
  { id: '37', name: 'Truth', description: 'Commitment to honesty and factual accuracy', category: 'Inner Compass' },
  { id: '38', name: 'Responsibility', description: 'Being accountable for your duties and actions', category: 'Inner Compass' },
  { id: '39', name: 'Accountability', description: 'Taking ownership of your decisions and outcomes', category: 'Inner Compass' },
  { id: '40', name: 'Conviction', description: 'Strong belief and determination in principles', category: 'Inner Compass' },
  { id: '41', name: 'Honor', description: 'Acting with high moral standards and dignity', category: 'Inner Compass' },
  { id: '42', name: 'Dignity', description: 'Maintaining self-respect and treating others with respect', category: 'Inner Compass' },
  { id: '43', name: 'Sincerity', description: 'Genuine and authentic in your interactions', category: 'Inner Compass' },
  { id: '44', name: 'Transparency', description: 'Openness and clarity in communication', category: 'Inner Compass' },
  { id: '45', name: 'Ethical', description: 'Acting according to moral principles', category: 'Inner Compass' },

  // Freedom & Autonomy - Independence, flexibility, and freedom of thought or action
  { id: '46', name: 'Freedom', description: 'Liberty and independence from constraints', category: 'Freedom & Autonomy' },
  { id: '47', name: 'Choice', description: 'Having options and the power to decide', category: 'Freedom & Autonomy' },
  { id: '48', name: 'Spontaneity', description: 'Acting on natural impulse and flexibility', category: 'Freedom & Autonomy' },
  { id: '49', name: 'Adventure', description: 'Seeking new and exciting experiences', category: 'Freedom & Autonomy' },
  { id: '50', name: 'Self-Reliance', description: 'Independence and self-sufficiency', category: 'Freedom & Autonomy' },
  { id: '51', name: 'Independence', description: 'Autonomy and freedom from dependence', category: 'Freedom & Autonomy' },
  { id: '52', name: 'Individuality', description: 'Unique personal identity and expression', category: 'Freedom & Autonomy' },
  { id: '53', name: 'Liberty', description: 'Freedom from oppression and constraints', category: 'Freedom & Autonomy' },
  { id: '54', name: 'Flexibility', description: 'Adaptability and openness to change', category: 'Freedom & Autonomy' },
  { id: '55', name: 'Exploration', description: 'Investigating and venturing into unknown areas', category: 'Freedom & Autonomy' },
  { id: '56', name: 'Risk', description: 'Willingness to take chances for growth', category: 'Freedom & Autonomy' },
  { id: '57', name: 'Boldness', description: 'Courage to take risks and face challenges', category: 'Freedom & Autonomy' },
  { id: '58', name: 'Fearless', description: 'Acting without fear or intimidation', category: 'Freedom & Autonomy' },
  { id: '59', name: 'Openness', description: 'Receptivity to new ideas and experiences', category: 'Freedom & Autonomy' },
  { id: '60', name: 'Variety', description: 'Diversity and change in experiences', category: 'Freedom & Autonomy' },

  // Purpose & Impact - Contribution to something bigger than oneself
  { id: '61', name: 'Service', description: 'Helping and serving others and community', category: 'Purpose & Impact' },
  { id: '62', name: 'Altruism', description: 'Selfless concern for others\' well-being', category: 'Purpose & Impact' },
  { id: '63', name: 'Justice', description: 'Fairness and moral rightness in society', category: 'Purpose & Impact' },
  { id: '64', name: 'Responsibility', description: 'Duty to contribute positively to the world', category: 'Purpose & Impact' },
  { id: '65', name: 'Legacy', description: 'Creating lasting positive impact for future generations', category: 'Purpose & Impact' },
  { id: '66', name: 'Contribution', description: 'Adding value and making a meaningful difference', category: 'Purpose & Impact' },
  { id: '67', name: 'Meaning', description: 'Purpose and significance in life and work', category: 'Purpose & Impact' },
  { id: '68', name: 'Significance', description: 'Making meaningful impact and difference', category: 'Purpose & Impact' },
  { id: '69', name: 'Stewardship', description: 'Responsible care for resources and environment', category: 'Purpose & Impact' },
  { id: '70', name: 'Sustainability', description: 'Long-term environmental and social responsibility', category: 'Purpose & Impact' },
  { id: '71', name: 'Charity', description: 'Generous giving and helping those in need', category: 'Purpose & Impact' },
  { id: '72', name: 'Giving', description: 'Sharing resources and kindness with others', category: 'Purpose & Impact' },
  { id: '73', name: 'Equality', description: 'Fair treatment and equal opportunities for all', category: 'Purpose & Impact' },
  { id: '74', name: 'Fairness', description: 'Just and impartial treatment of others', category: 'Purpose & Impact' },
  { id: '75', name: 'Advocacy', description: 'Speaking up for important causes and people', category: 'Purpose & Impact' },

  // Vitality & Health - Physical, emotional, or energetic wellbeing
  { id: '76', name: 'Health', description: 'Physical and mental well-being', category: 'Vitality & Health' },
  { id: '77', name: 'Energy', description: 'Vitality and physical vigor', category: 'Vitality & Health' },
  { id: '78', name: 'Vitality', description: 'Life force and energetic well-being', category: 'Vitality & Health' },
  { id: '79', name: 'Balance', description: 'Harmony and equilibrium in all life areas', category: 'Vitality & Health' },
  { id: '80', name: 'Movement', description: 'Physical activity and bodily expression', category: 'Vitality & Health' },
  { id: '81', name: 'Strength', description: 'Physical and mental power and resilience', category: 'Vitality & Health' },
  { id: '82', name: 'Wellness', description: 'Overall state of health and well-being', category: 'Vitality & Health' },
  { id: '83', name: 'Fitness', description: 'Physical conditioning and health', category: 'Vitality & Health' },
  { id: '84', name: 'Endurance', description: 'Persistence through physical and mental challenges', category: 'Vitality & Health' },
  { id: '85', name: 'Recovery', description: 'Rest and restoration for optimal performance', category: 'Vitality & Health' },
  { id: '86', name: 'Nourishment', description: 'Feeding body and mind with what they need', category: 'Vitality & Health' },
  { id: '87', name: 'Self-Care', description: 'Taking care of your physical and emotional needs', category: 'Vitality & Health' },
  { id: '88', name: 'Resilience', description: 'Ability to bounce back from challenges', category: 'Vitality & Health' },
  { id: '89', name: 'Vigor', description: 'Physical and mental energy and enthusiasm', category: 'Vitality & Health' },
  { id: '90', name: 'Longevity', description: 'Long-term health and sustainable living', category: 'Vitality & Health' },

  // Spiritual & Emotional - Values tied to meaning, inner peace, or existential purpose
  { id: '91', name: 'Peace', description: 'Tranquility and harmony within and around', category: 'Spiritual & Emotional' },
  { id: '92', name: 'Gratitude', description: 'Appreciation and thankfulness for life', category: 'Spiritual & Emotional' },
  { id: '93', name: 'Faith', description: 'Trust and belief in something greater', category: 'Spiritual & Emotional' },
  { id: '94', name: 'Presence', description: 'Being fully aware and engaged in the moment', category: 'Spiritual & Emotional' },
  { id: '95', name: 'Serenity', description: 'Calm and peaceful state of mind', category: 'Spiritual & Emotional' },
  { id: '96', name: 'Spirituality', description: 'Connection to something greater than oneself', category: 'Spiritual & Emotional' },
  { id: '97', name: 'Mindfulness', description: 'Conscious awareness and present-moment attention', category: 'Spiritual & Emotional' },
  { id: '98', name: 'Meditation', description: 'Practice of focused awareness and inner calm', category: 'Spiritual & Emotional' },
  { id: '99', name: 'Contemplation', description: 'Deep reflection and thoughtful consideration', category: 'Spiritual & Emotional' },
  { id: '100', name: 'Transcendence', description: 'Rising above ordinary limitations', category: 'Spiritual & Emotional' },
  { id: '101', name: 'Harmony', description: 'Agreement and peaceful coexistence', category: 'Spiritual & Emotional' },
  { id: '102', name: 'Unity', description: 'Oneness and connection with all', category: 'Spiritual & Emotional' },
  { id: '103', name: 'Reverence', description: 'Deep respect and admiration for life', category: 'Spiritual & Emotional' },
  { id: '104', name: 'Humility', description: 'Modest and unpretentious attitude', category: 'Spiritual & Emotional' },
  { id: '105', name: 'Grace', description: 'Elegance and divine favor in actions', category: 'Spiritual & Emotional' },

  // Creativity & Expression - Personal style, originality, or artistic self-expression
  { id: '106', name: 'Creativity', description: 'Imagination and innovative thinking', category: 'Creativity & Expression' },
  { id: '107', name: 'Imagination', description: 'Creative and inventive thinking', category: 'Creativity & Expression' },
  { id: '108', name: 'Expression', description: 'Communicating thoughts and feelings authentically', category: 'Creativity & Expression' },
  { id: '109', name: 'Innovation', description: 'Creating new methods and ideas', category: 'Creativity & Expression' },
  { id: '110', name: 'Originality', description: 'Uniqueness and novelty in ideas and actions', category: 'Creativity & Expression' },
  { id: '111', name: 'Artistry', description: 'Skill and creativity in artistic endeavors', category: 'Creativity & Expression' },
  { id: '112', name: 'Beauty', description: 'Appreciation and creation of aesthetic value', category: 'Creativity & Expression' },
  { id: '113', name: 'Style', description: 'Personal flair and distinctive approach', category: 'Creativity & Expression' },
  { id: '114', name: 'Uniqueness', description: 'Being one of a kind and distinctive', category: 'Creativity & Expression' },
  { id: '115', name: 'Inspiration', description: 'Sparking creativity and motivation in self and others', category: 'Creativity & Expression' },
  { id: '116', name: 'Vision', description: 'Ability to see and create future possibilities', category: 'Creativity & Expression' },
  { id: '117', name: 'Intuition', description: 'Understanding through instinct and inner knowing', category: 'Creativity & Expression' },
  { id: '118', name: 'Wonder', description: 'Awe and curiosity about the world', category: 'Creativity & Expression' },
  { id: '119', name: 'Playfulness', description: 'Light-hearted and creative approach to life', category: 'Creativity & Expression' },
  { id: '120', name: 'Experimentation', description: 'Trying new approaches and methods', category: 'Creativity & Expression' },

  // Learning & Growth - Curiosity, exploration, and improvement
  { id: '121', name: 'Curiosity', description: 'Desire to learn and explore new things', category: 'Learning & Growth' },
  { id: '122', name: 'Growth', description: 'Continuous development and personal evolution', category: 'Learning & Growth' },
  { id: '123', name: 'Wisdom', description: 'Deep understanding gained through experience', category: 'Learning & Growth' },
  { id: '124', name: 'Openness', description: 'Receptivity to new ideas and perspectives', category: 'Learning & Growth' },
  { id: '125', name: 'Learning', description: 'Acquiring new knowledge and skills', category: 'Learning & Growth' },
  { id: '126', name: 'Knowledge', description: 'Information and understanding gained through study', category: 'Learning & Growth' },
  { id: '127', name: 'Discovery', description: 'Finding and uncovering new insights', category: 'Learning & Growth' },
  { id: '128', name: 'Understanding', description: 'Comprehension and deep insight', category: 'Learning & Growth' },
  { id: '129', name: 'Insight', description: 'Deep understanding and perception', category: 'Learning & Growth' },
  { id: '130', name: 'Reflection', description: 'Thoughtful consideration of experiences', category: 'Learning & Growth' },
  { id: '131', name: 'Development', description: 'Progressive growth and improvement', category: 'Learning & Growth' },
  { id: '132', name: 'Evolution', description: 'Gradual development and positive change', category: 'Learning & Growth' },
  { id: '133', name: 'Improvement', description: 'Making things better through effort', category: 'Learning & Growth' },
  { id: '134', name: 'Progress', description: 'Forward movement toward goals', category: 'Learning & Growth' },
  { id: '135', name: 'Expansion', description: 'Broadening horizons and capabilities', category: 'Learning & Growth' },

  // Structure & Stability - Safety, order, predictability, and control
  { id: '136', name: 'Stability', description: 'Consistency and resistance to unwanted change', category: 'Structure & Stability' },
  { id: '137', name: 'Order', description: 'Organization and systematic arrangement', category: 'Structure & Stability' },
  { id: '138', name: 'Security', description: 'Safety and protection from harm', category: 'Structure & Stability' },
  { id: '139', name: 'Safety', description: 'Protection from danger and risk', category: 'Structure & Stability' },
  { id: '140', name: 'Tradition', description: 'Respect for established customs and practices', category: 'Structure & Stability' },
  { id: '141', name: 'Consistency', description: 'Reliability and uniformity in actions', category: 'Structure & Stability' },
  { id: '142', name: 'Reliability', description: 'Dependability and trustworthiness', category: 'Structure & Stability' },
  { id: '143', name: 'Predictability', description: 'Consistency and foreseeable outcomes', category: 'Structure & Stability' },
  { id: '144', name: 'Control', description: 'Management and regulation of situations', category: 'Structure & Stability' },
  { id: '145', name: 'Organization', description: 'Systematic arrangement and structure', category: 'Structure & Stability' },
  { id: '146', name: 'Planning', description: 'Thoughtful preparation for the future', category: 'Structure & Stability' },
  { id: '147', name: 'Structure', description: 'Organized framework and clear systems', category: 'Structure & Stability' },
  { id: '148', name: 'Routine', description: 'Regular patterns and established habits', category: 'Structure & Stability' },
  { id: '149', name: 'Precision', description: 'Accuracy and attention to detail', category: 'Structure & Stability' },
  { id: '150', name: 'Efficiency', description: 'Achieving maximum productivity with minimum waste', category: 'Structure & Stability' }
];

// Helper function to get random values for initial selection
export const getRandomValues = (count: number): Value[] => {
  const shuffled = [...allValues].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to get values by category
export const getValuesByCategory = (category: string): Value[] => {
  return allValues.filter(value => value.category === category);
};

// Get all unique categories
export const getCategories = (): string[] => {
  return Array.from(new Set(allValues.map(value => value.category)));
};

// Category metadata for better organization
export const categoryMetadata = {
  'Achievement': {
    description: 'Drive to accomplish, succeed, and grow personally or professionally',
    examples: ['Ambition', 'Excellence', 'Mastery', 'Discipline', 'Focus'],
    icon: 'Target'
  },
  'Connection': {
    description: 'Values that prioritize relationships, love, and belonging',
    examples: ['Compassion', 'Loyalty', 'Kindness', 'Friendship', 'Family'],
    icon: 'Users'
  },
  'Inner Compass': {
    description: 'Self-directed principles and personal integrity',
    examples: ['Authenticity', 'Honesty', 'Integrity', 'Courage', 'Clarity'],
    icon: 'Compass'
  },
  'Freedom & Autonomy': {
    description: 'Independence, flexibility, and freedom of thought or action',
    examples: ['Freedom', 'Choice', 'Spontaneity', 'Adventure', 'Self-Reliance'],
    icon: 'Wind'
  },
  'Purpose & Impact': {
    description: 'Contribution to something bigger than oneself',
    examples: ['Service', 'Altruism', 'Justice', 'Responsibility', 'Legacy'],
    icon: 'Globe'
  },
  'Vitality & Health': {
    description: 'Physical, emotional, or energetic wellbeing',
    examples: ['Health', 'Energy', 'Vitality', 'Balance', 'Movement'],
    icon: 'Heart'
  },
  'Spiritual & Emotional': {
    description: 'Values tied to meaning, inner peace, or existential purpose',
    examples: ['Peace', 'Gratitude', 'Faith', 'Presence', 'Serenity'],
    icon: 'Sparkles'
  },
  'Creativity & Expression': {
    description: 'Personal style, originality, or artistic self-expression',
    examples: ['Creativity', 'Imagination', 'Expression', 'Innovation'],
    icon: 'Lightbulb'
  },
  'Learning & Growth': {
    description: 'Curiosity, exploration, and improvement',
    examples: ['Curiosity', 'Growth', 'Wisdom', 'Openness', 'Learning'],
    icon: 'BookOpen'
  },
  'Structure & Stability': {
    description: 'Safety, order, predictability, and control',
    examples: ['Stability', 'Order', 'Security', 'Safety', 'Tradition'],
    icon: 'Shield'
  }
};