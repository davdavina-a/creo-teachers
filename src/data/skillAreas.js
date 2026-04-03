export const SKILL_AREAS = [
  {
    id: 'main_idea',
    name: 'Main Idea and Supporting Statements',
    shortName: 'Main Idea',
    description: 'Ability to construct a clear central argument supported by relevant evidence.',
    exercises: {
      recognition: {
        type: 'multiple_choice',
        prompt: 'Identify the strongest main idea statement for an academic paragraph.',
      },
      production: {
        type: 'writing',
        prompt: 'Write a topic sentence and two supporting statements for the following position:',
      }
    }
  },
  {
    id: 'acknowledging_perspectives',
    name: 'Acknowledging and Integrating Perspectives',
    shortName: 'Perspectives',
    description: 'Ability to recognise and engage with alternative viewpoints.',
    exercises: {
      recognition: {
        type: 'multiple_choice',
        prompt: 'Identify which sentence best acknowledges a counter-perspective.',
      },
      production: {
        type: 'writing',
        prompt: 'Write a sentence that acknowledges an opposing view and responds to it.',
      }
    }
  },
  {
    id: 'academic_expectations',
    name: 'Meeting Academic Expectations',
    shortName: 'Academic Register',
    description: 'Use of appropriate academic tone, register, and conventions.',
    exercises: {
      recognition: {
        type: 'multiple_choice',
        prompt: 'Select the sentence that best meets academic writing expectations.',
      },
      production: {
        type: 'writing',
        prompt: 'Rewrite the following informal sentence in an academic register:',
      }
    }
  },
  {
    id: 'argument_strength',
    name: 'Strength and Development of Argument',
    shortName: 'Argument',
    description: 'Ability to build a logically coherent and well-developed argument.',
    exercises: {
      recognition: {
        type: 'multiple_choice',
        prompt: 'Identify which paragraph demonstrates the strongest argument development.',
      },
      production: {
        type: 'writing',
        prompt: 'Develop the following claim into a full argumentative paragraph:',
      }
    }
  },
  {
    id: 'source_interpretation',
    name: 'Source Interpretation and Use',
    shortName: 'Source Use',
    description: 'Ability to accurately interpret and meaningfully deploy source material.',
    exercises: {
      recognition: {
        type: 'multiple_choice',
        prompt: 'Select the response that most accurately interprets the source extract.',
      },
      production: {
        type: 'writing',
        prompt: 'Using the extract below, write two sentences that interpret and apply it to an argument:',
      }
    }
  },
  {
    id: 'student_voice',
    name: 'Student Voice in Relation to Sources',
    shortName: 'Student Voice',
    description: 'Ability to maintain an authorial stance while engaging with sources.',
    exercises: {
      recognition: {
        type: 'multiple_choice',
        prompt: 'Identify which sentence best demonstrates the writer\'s own voice alongside a source.',
      },
      production: {
        type: 'writing',
        prompt: 'Write a sentence that uses the source below while clearly expressing your own position:',
      }
    }
  },
  {
    id: 'source_integration',
    name: 'Source Integration for Justification',
    shortName: 'Integration',
    description: 'Ability to integrate sources smoothly to justify and support claims.',
    exercises: {
      recognition: {
        type: 'multiple_choice',
        prompt: 'Select the example that best integrates a source to justify a claim.',
      },
      production: {
        type: 'writing',
        prompt: 'Integrate the following source extract into a sentence that justifies this claim:',
      }
    }
  }
];

export function getSkillById(id) {
  return SKILL_AREAS.find(skill => skill.id === id) || null;
}

export const CEFR_LEVELS = [
  { code: 'B1', label: 'Threshold', min: 0, max: 24, color: '#2D5BE3' },
  { code: 'B2', label: 'Vantage', min: 25, max: 49, color: '#4338CA' },
  { code: 'C1', label: 'Effective', min: 50, max: 74, color: '#F59E0B' },
  { code: 'C2', label: 'Mastery', min: 75, max: 100, color: '#D1F0B1' }
];

export function getCEFRLevel(score) {
  return CEFR_LEVELS.find(l => score >= l.min && score <= l.max) || CEFR_LEVELS[0];
}