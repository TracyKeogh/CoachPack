export interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  category: 'business' | 'body' | 'balance';
  milestones: { 
    id: string;
    title: string; 
    targetDate: string; 
    description?: string;
    completed?: boolean;
  }[];
  actions: { 
    id: string;
    title: string; 
    frequency: 'daily' | 'weekly' | '3x-week'; 
    completed?: boolean;
  }[];
  tags: string[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// Sample templates to populate the community
export const sampleTemplates: GoalTemplate[] = [
  {
    id: 'template-1',
    title: 'Launch Online Course',
    description: 'Create and launch an online course to share expertise and generate passive income',
    category: 'business',
    milestones: [
      {
        id: 'm1-1',
        title: 'Complete course outline and structure',
        targetDate: getTwelveWeeksFromNow(-70),
        description: 'Define modules, lessons, and learning outcomes',
        completed: false
      },
      {
        id: 'm1-2',
        title: 'Record all video content',
        targetDate: getTwelveWeeksFromNow(-40),
        description: 'Create high-quality video lessons for each module',
        completed: false
      },
      {
        id: 'm1-3',
        title: 'Set up course platform and payment system',
        targetDate: getTwelveWeeksFromNow(-20),
        description: 'Choose platform, upload content, configure payments',
        completed: false
      },
      {
        id: 'm1-4',
        title: 'Launch marketing campaign',
        targetDate: getTwelveWeeksFromNow(-5),
        description: 'Email list, social media, partnerships',
        completed: false
      }
    ],
    actions: [
      {
        id: 'a1-1',
        title: 'Work on course content for 2 hours',
        frequency: '3x-week',
        completed: false
      },
      {
        id: 'a1-2',
        title: 'Research competitor courses',
        frequency: 'weekly',
        completed: false
      },
      {
        id: 'a1-3',
        title: 'Engage with target audience on social media',
        frequency: 'daily',
        completed: false
      }
    ],
    tags: ['passive income', 'education', 'digital product'],
    usageCount: 342,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'template-2',
    title: 'Run a Half Marathon',
    description: 'Train progressively to complete a half marathon (13.1 miles) with a target time',
    category: 'body',
    milestones: [
      {
        id: 'm2-1',
        title: 'Complete 5K without stopping',
        targetDate: getTwelveWeeksFromNow(-70),
        description: 'Build base endurance with consistent training',
        completed: false
      },
      {
        id: 'm2-2',
        title: 'Run 10K race',
        targetDate: getTwelveWeeksFromNow(-40),
        description: 'Enter local 10K race as training benchmark',
        completed: false
      },
      {
        id: 'm2-3',
        title: 'Complete 15K training run',
        targetDate: getTwelveWeeksFromNow(-15),
        description: 'Long run to build confidence for race day',
        completed: false
      }
    ],
    actions: [
      {
        id: 'a2-1',
        title: 'Short run (3-5 miles)',
        frequency: '3x-week',
        completed: false
      },
      {
        id: 'a2-2',
        title: 'Long run (increasing distance)',
        frequency: 'weekly',
        completed: false
      },
      {
        id: 'a2-3',
        title: 'Strength training session',
        frequency: 'weekly',
        completed: false
      },
      {
        id: 'a2-4',
        title: 'Rest day with stretching',
        frequency: 'weekly',
        completed: false
      }
    ],
    tags: ['fitness', 'running', 'endurance'],
    usageCount: 528,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'template-3',
    title: 'Digital Minimalism Challenge',
    description: 'Reduce digital clutter and reclaim attention through intentional technology use',
    category: 'balance',
    milestones: [
      {
        id: 'm3-1',
        title: 'Complete digital audit',
        targetDate: getTwelveWeeksFromNow(-80),
        description: 'Document all apps, subscriptions, and screen time',
        completed: false
      },
      {
        id: 'm3-2',
        title: 'Implement 30-day digital detox',
        targetDate: getTwelveWeeksFromNow(-50),
        description: 'Remove non-essential apps and limit social media',
        completed: false
      },
      {
        id: 'm3-3',
        title: 'Create sustainable digital habits',
        targetDate: getTwelveWeeksFromNow(-20),
        description: 'Establish new routines for healthy technology use',
        completed: false
      }
    ],
    actions: [
      {
        id: 'a3-1',
        title: 'No screens 1 hour before bed',
        frequency: 'daily',
        completed: false
      },
      {
        id: 'a3-2',
        title: 'Check email only twice daily',
        frequency: 'daily',
        completed: false
      },
      {
        id: 'a3-3',
        title: 'Full day without social media',
        frequency: 'weekly',
        completed: false
      },
      {
        id: 'a3-4',
        title: 'Review and adjust digital boundaries',
        frequency: 'weekly',
        completed: false
      }
    ],
    tags: ['digital wellness', 'mindfulness', 'productivity'],
    usageCount: 476,
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'template-4',
    title: 'Build Emergency Fund',
    description: 'Save 3-6 months of expenses for financial security and peace of mind',
    category: 'business',
    milestones: [
      {
        id: 'm4-1',
        title: 'Calculate target emergency fund amount',
        targetDate: getTwelveWeeksFromNow(-80),
        description: 'Determine 3-6 months of essential expenses',
        completed: false
      },
      {
        id: 'm4-2',
        title: 'Save first $1,000',
        targetDate: getTwelveWeeksFromNow(-60),
        description: 'Initial safety net for small emergencies',
        completed: false
      },
      {
        id: 'm4-3',
        title: 'Reach 50% of target amount',
        targetDate: getTwelveWeeksFromNow(-30),
        description: 'Halfway milestone to full emergency fund',
        completed: false
      },
      {
        id: 'm4-4',
        title: 'Complete full emergency fund',
        targetDate: getTwelveWeeksFromNow(-5),
        description: 'Achieve financial security goal',
        completed: false
      }
    ],
    actions: [
      {
        id: 'a4-1',
        title: 'Automatic transfer to savings',
        frequency: 'weekly',
        completed: false
      },
      {
        id: 'a4-2',
        title: 'Review budget for additional savings opportunities',
        frequency: 'weekly',
        completed: false
      },
      {
        id: 'a4-3',
        title: 'No unnecessary purchases day',
        frequency: '3x-week',
        completed: false
      }
    ],
    tags: ['finance', 'savings', 'security'],
    usageCount: 689,
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'template-5',
    title: 'Morning Routine Mastery',
    description: 'Establish a consistent morning routine for productivity and wellbeing',
    category: 'balance',
    milestones: [
      {
        id: 'm5-1',
        title: 'Design ideal morning routine',
        targetDate: getTwelveWeeksFromNow(-75),
        description: 'Plan activities, timing, and desired outcomes',
        completed: false
      },
      {
        id: 'm5-2',
        title: 'Consistent wake-up time for 21 days',
        targetDate: getTwelveWeeksFromNow(-54),
        description: 'Establish sleep-wake cycle consistency',
        completed: false
      },
      {
        id: 'm5-3',
        title: 'Full routine implementation for 30 days',
        targetDate: getTwelveWeeksFromNow(-24),
        description: 'All elements of routine consistently performed',
        completed: false
      }
    ],
    actions: [
      {
        id: 'a5-1',
        title: 'Wake up at consistent time',
        frequency: 'daily',
        completed: false
      },
      {
        id: 'a5-2',
        title: '10 minutes meditation/mindfulness',
        frequency: 'daily',
        completed: false
      },
      {
        id: 'a5-3',
        title: '15 minutes exercise/movement',
        frequency: 'daily',
        completed: false
      },
      {
        id: 'a5-4',
        title: 'Review daily priorities',
        frequency: 'daily',
        completed: false
      },
      {
        id: 'a5-5',
        title: 'Weekly routine review and adjustment',
        frequency: 'weekly',
        completed: false
      }
    ],
    tags: ['habits', 'productivity', 'wellbeing'],
    usageCount: 712,
    createdAt: new Date(Date.now() - 210 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'template-6',
    title: 'Strength Training Program',
    description: 'Build strength and muscle with progressive resistance training',
    category: 'body',
    milestones: [
      {
        id: 'm6-1',
        title: 'Complete fitness assessment',
        targetDate: getTwelveWeeksFromNow(-80),
        description: 'Establish baseline strength and measurements',
        completed: false
      },
      {
        id: 'm6-2',
        title: 'Master proper form for all exercises',
        targetDate: getTwelveWeeksFromNow(-60),
        description: 'Ensure safe and effective technique',
        completed: false
      },
      {
        id: 'm6-3',
        title: 'Increase all lifts by 20%',
        targetDate: getTwelveWeeksFromNow(-30),
        description: 'Progressive overload milestone',
        completed: false
      },
      {
        id: 'm6-4',
        title: 'Complete 12-week program without missing workouts',
        targetDate: getTwelveWeeksFromNow(-5),
        description: 'Consistency achievement',
        completed: false
      }
    ],
    actions: [
      {
        id: 'a6-1',
        title: 'Upper body strength workout',
        frequency: 'weekly',
        completed: false
      },
      {
        id: 'a6-2',
        title: 'Lower body strength workout',
        frequency: 'weekly',
        completed: false
      },
      {
        id: 'a6-3',
        title: 'Core and mobility session',
        frequency: 'weekly',
        completed: false
      },
      {
        id: 'a6-4',
        title: 'Track measurements and progress',
        frequency: 'weekly',
        completed: false
      },
      {
        id: 'a6-5',
        title: 'Rest and recovery day',
        frequency: 'weekly',
        completed: false
      }
    ],
    tags: ['fitness', 'strength', 'muscle'],
    usageCount: 583,
    createdAt: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 105 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'template-7',
    title: 'Mindfulness Meditation Practice',
    description: 'Develop a consistent meditation practice for mental clarity and emotional balance',
    category: 'balance',
    milestones: [
      {
        id: 'm7-1',
        title: 'Establish 5-minute daily practice',
        targetDate: getTwelveWeeksFromNow(-75),
        description: 'Begin with short, manageable sessions',
        completed: false
      },
      {
        id: 'm7-2',
        title: 'Increase to 15-minute sessions',
        targetDate: getTwelveWeeksFromNow(-45),
        description: 'Gradually extend meditation duration',
        completed: false
      },
      {
        id: 'm7-3',
        title: 'Complete 30-day streak',
        targetDate: getTwelveWeeksFromNow(-15),
        description: 'Build consistent daily habit',
        completed: false
      }
    ],
    actions: [
      {
        id: 'a7-1',
        title: 'Morning meditation session',
        frequency: 'daily',
        completed: false
      },
      {
        id: 'a7-2',
        title: 'Mindful breathing during stressful moments',
        frequency: 'daily',
        completed: false
      },
      {
        id: 'a7-3',
        title: 'Try new meditation technique',
        frequency: 'weekly',
        completed: false
      },
      {
        id: 'a7-4',
        title: 'Journal meditation experiences',
        frequency: 'weekly',
        completed: false
      }
    ],
    tags: ['meditation', 'mindfulness', 'mental health'],
    usageCount: 624,
    createdAt: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'template-8',
    title: 'Networking Challenge',
    description: 'Expand professional network and build meaningful business relationships',
    category: 'business',
    milestones: [
      {
        id: 'm8-1',
        title: 'Update all professional profiles',
        targetDate: getTwelveWeeksFromNow(-80),
        description: 'Refresh LinkedIn, portfolio, and other platforms',
        completed: false
      },
      {
        id: 'm8-2',
        title: 'Attend 3 industry events',
        targetDate: getTwelveWeeksFromNow(-50),
        description: 'Conferences, meetups, or webinars',
        completed: false
      },
      {
        id: 'm8-3',
        title: 'Establish 10 new meaningful connections',
        targetDate: getTwelveWeeksFromNow(-20),
        description: 'Quality relationships with follow-up conversations',
        completed: false
      }
    ],
    actions: [
      {
        id: 'a8-1',
        title: 'Reach out to one new contact',
        frequency: 'weekly',
        completed: false
      },
      {
        id: 'a8-2',
        title: 'Follow up with existing connections',
        frequency: 'weekly',
        completed: false
      },
      {
        id: 'a8-3',
        title: 'Share valuable content on professional platforms',
        frequency: 'weekly',
        completed: false
      },
      {
        id: 'a8-4',
        title: 'Research upcoming industry events',
        frequency: 'weekly',
        completed: false
      }
    ],
    tags: ['networking', 'professional', 'relationships'],
    usageCount: 437,
    createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 135 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'template-9',
    title: 'Intermittent Fasting Implementation',
    description: 'Establish sustainable intermittent fasting routine for health benefits',
    category: 'body',
    milestones: [
      {
        id: 'm9-1',
        title: 'Research and select fasting protocol',
        targetDate: getTwelveWeeksFromNow(-80),
        description: '16/8, 5:2, or other approach based on lifestyle',
        completed: false
      },
      {
        id: 'm9-2',
        title: 'Gradually adjust eating window',
        targetDate: getTwelveWeeksFromNow(-65),
        description: 'Incrementally shift to target fasting schedule',
        completed: false
      },
      {
        id: 'm9-3',
        title: 'Complete 21 days on full protocol',
        targetDate: getTwelveWeeksFromNow(-44),
        description: 'Consistent adherence to establish habit',
        completed: false
      },
      {
        id: 'm9-4',
        title: 'Evaluate results and adjust as needed',
        targetDate: getTwelveWeeksFromNow(-23),
        description: 'Review energy, hunger, and other metrics',
        completed: false
      }
    ],
    actions: [
      {
        id: 'a9-1',
        title: 'Track fasting hours',
        frequency: 'daily',
        completed: false
      },
      {
        id: 'a9-2',
        title: 'Drink adequate water during fasting window',
        frequency: 'daily',
        completed: false
      },
      {
        id: 'a9-3',
        title: 'Plan nutritious meals for eating window',
        frequency: 'weekly',
        completed: false
      },
      {
        id: 'a9-4',
        title: 'Journal energy levels and hunger patterns',
        frequency: '3x-week',
        completed: false
      }
    ],
    tags: ['nutrition', 'fasting', 'health'],
    usageCount: 512,
    createdAt: new Date(Date.now() - 330 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'template-10',
    title: 'Declutter and Organize Home',
    description: 'Systematically declutter and organize living spaces for a more peaceful environment',
    category: 'balance',
    milestones: [
      {
        id: 'm10-1',
        title: 'Complete home inventory assessment',
        targetDate: getTwelveWeeksFromNow(-80),
        description: 'Document all areas needing organization',
        completed: false
      },
      {
        id: 'm10-2',
        title: 'Declutter all clothing and personal items',
        targetDate: getTwelveWeeksFromNow(-60),
        description: 'Apply minimalist principles to wardrobe and belongings',
        completed: false
      },
      {
        id: 'm10-3',
        title: 'Organize kitchen and living spaces',
        targetDate: getTwelveWeeksFromNow(-40),
        description: 'Implement systems for high-traffic areas',
        completed: false
      },
      {
        id: 'm10-4',
        title: 'Complete storage solutions for remaining items',
        targetDate: getTwelveWeeksFromNow(-20),
        description: 'Proper storage for seasonal and occasional items',
        completed: false
      }
    ],
    actions: [
      {
        id: 'a10-1',
        title: 'Declutter one small area (drawer, shelf, etc.)',
        frequency: 'daily',
        completed: false
      },
      {
        id: 'a10-2',
        title: 'Process one box or container of items',
        frequency: '3x-week',
        completed: false
      },
      {
        id: 'a10-3',
        title: 'Donate or discard unwanted items',
        frequency: 'weekly',
        completed: false
      },
      {
        id: 'a10-4',
        title: 'Implement one new organization system',
        frequency: 'weekly',
        completed: false
      }
    ],
    tags: ['organization', 'minimalism', 'home'],
    usageCount: 498,
    createdAt: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 165 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Helper function to get date X days from 12 weeks from now
function getTwelveWeeksFromNow(daysOffset: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + (12 * 7) + daysOffset); // 12 weeks = 84 days + offset
  return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}