/**
 * Curriculum data for Educator role
 * Grades 1-12 and University level
 */

export interface CurriculumItem {
  id: string
  grade: string
  subject: string
  topic: string
  description: string
  status: 'completed' | 'in-progress' | 'upcoming'
  dueDate?: string
  resources: string[]
}

export interface GradeLevel {
  grade: string
  curriculum: CurriculumItem[]
}

export const CURRICULUM_DATA: GradeLevel[] = [
  {
    grade: 'Grade 1',
    curriculum: [
      {
        id: 'g1-math-1',
        grade: 'Grade 1',
        subject: 'Mathematics',
        topic: 'Basic Counting and Number Recognition',
        description: 'Learn numbers 1-100, basic addition and subtraction',
        status: 'in-progress',
        dueDate: '2024-12-15',
        resources: ['Number charts', 'Counting exercises', 'Interactive games']
      },
      {
        id: 'g1-science-1',
        grade: 'Grade 1',
        subject: 'Science',
        topic: 'Introduction to Space',
        description: 'Basic concepts about space, planets, and living in space',
        status: 'upcoming',
        dueDate: '2024-12-20',
        resources: ['Space station tour', 'Planet models', 'Astronaut stories']
      }
    ]
  },
  {
    grade: 'Grade 2',
    curriculum: [
      {
        id: 'g2-math-1',
        grade: 'Grade 2',
        subject: 'Mathematics',
        topic: 'Place Value and Two-Digit Operations',
        description: 'Understanding tens and ones, addition/subtraction with regrouping',
        status: 'in-progress',
        dueDate: '2024-12-18',
        resources: ['Place value blocks', 'Practice worksheets']
      }
    ]
  },
  {
    grade: 'Grade 3',
    curriculum: [
      {
        id: 'g3-science-1',
        grade: 'Grade 3',
        subject: 'Science',
        topic: 'Life Support Systems',
        description: 'How we breathe, get water, and grow food on the station',
        status: 'upcoming',
        dueDate: '2024-12-22',
        resources: ['Life support lab tour', 'Plant growth experiments']
      }
    ]
  },
  {
    grade: 'Grade 4',
    curriculum: [
      {
        id: 'g4-math-1',
        grade: 'Grade 4',
        subject: 'Mathematics',
        topic: 'Multiplication and Division',
        description: 'Master multiplication tables and division facts',
        status: 'completed',
        resources: ['Multiplication games', 'Division practice']
      }
    ]
  },
  {
    grade: 'Grade 5',
    curriculum: [
      {
        id: 'g5-science-1',
        grade: 'Grade 5',
        subject: 'Science',
        topic: 'Gravity and Rotation',
        description: 'Understanding artificial gravity and how the station rotates',
        status: 'in-progress',
        dueDate: '2024-12-25',
        resources: ['Rotation simulator', 'Gravity experiments']
      }
    ]
  },
  {
    grade: 'Grade 6',
    curriculum: [
      {
        id: 'g6-math-1',
        grade: 'Grade 6',
        subject: 'Mathematics',
        topic: 'Fractions and Decimals',
        description: 'Working with fractions, decimals, and percentages',
        status: 'in-progress',
        dueDate: '2024-12-28',
        resources: ['Fraction manipulatives', 'Decimal worksheets']
      }
    ]
  },
  {
    grade: 'Grade 7',
    curriculum: [
      {
        id: 'g7-science-1',
        grade: 'Grade 7',
        subject: 'Science',
        topic: 'Atmospheric Chemistry',
        description: 'Oxygen, CO2, and atmospheric composition on the station',
        status: 'upcoming',
        dueDate: '2025-01-05',
        resources: ['Chemistry lab', 'Atmospheric monitoring tools']
      }
    ]
  },
  {
    grade: 'Grade 8',
    curriculum: [
      {
        id: 'g8-math-1',
        grade: 'Grade 8',
        subject: 'Mathematics',
        topic: 'Algebra Basics',
        description: 'Introduction to variables, equations, and solving for unknowns',
        status: 'upcoming',
        dueDate: '2025-01-10',
        resources: ['Algebra tiles', 'Equation solver']
      }
    ]
  },
  {
    grade: 'Grade 9',
    curriculum: [
      {
        id: 'g9-science-1',
        grade: 'Grade 9',
        subject: 'Science',
        topic: 'Radiation Physics',
        description: 'Understanding radiation, shielding, and safety protocols',
        status: 'upcoming',
        dueDate: '2025-01-15',
        resources: ['Radiation monitoring equipment', 'Shielding materials']
      }
    ]
  },
  {
    grade: 'Grade 10',
    curriculum: [
      {
        id: 'g10-math-1',
        grade: 'Grade 10',
        subject: 'Mathematics',
        topic: 'Geometry and Trigonometry',
        description: 'Shapes, angles, and trigonometric functions',
        status: 'upcoming',
        dueDate: '2025-01-20',
        resources: ['Geometric models', 'Trig calculator']
      }
    ]
  },
  {
    grade: 'Grade 11',
    curriculum: [
      {
        id: 'g11-science-1',
        grade: 'Grade 11',
        subject: 'Science',
        topic: 'Engineering Principles',
        description: 'Structural engineering, materials science, and station design',
        status: 'upcoming',
        dueDate: '2025-01-25',
        resources: ['Engineering software', 'Material testing lab']
      }
    ]
  },
  {
    grade: 'Grade 12',
    curriculum: [
      {
        id: 'g12-math-1',
        grade: 'Grade 12',
        subject: 'Mathematics',
        topic: 'Calculus and Advanced Math',
        description: 'Differential and integral calculus, advanced problem solving',
        status: 'upcoming',
        dueDate: '2025-02-01',
        resources: ['Calculus software', 'Advanced problem sets']
      },
      {
        id: 'g12-science-1',
        grade: 'Grade 12',
        subject: 'Science',
        topic: 'Space Settlement Capstone',
        description: 'Comprehensive project on space settlement design and operations',
        status: 'upcoming',
        dueDate: '2025-02-15',
        resources: ['Full station access', 'Mentorship program']
      }
    ]
  },
  {
    grade: 'University',
    curriculum: [
      {
        id: 'uni-eng-1',
        grade: 'University',
        subject: 'Engineering',
        topic: 'Space Systems Engineering',
        description: 'Advanced course on designing and maintaining space systems',
        status: 'in-progress',
        dueDate: '2025-02-20',
        resources: ['Engineering labs', 'Industry partnerships']
      },
      {
        id: 'uni-bio-1',
        grade: 'University',
        subject: 'Biology',
        topic: 'Closed-Loop Life Support',
        description: 'Biological systems for sustainable space habitation',
        status: 'upcoming',
        dueDate: '2025-03-01',
        resources: ['Biology research lab', 'Agricultural systems']
      },
      {
        id: 'uni-phys-1',
        grade: 'University',
        subject: 'Physics',
        topic: 'Orbital Mechanics and Station Dynamics',
        description: 'Advanced physics of orbital mechanics and rotating habitats',
        status: 'upcoming',
        dueDate: '2025-03-15',
        resources: ['Physics simulation lab', 'Orbital mechanics software']
      },
      {
        id: 'uni-cs-1',
        grade: 'University',
        subject: 'Computer Science',
        topic: 'AI Systems for Space Operations',
        description: 'Developing and maintaining AI systems like HELIOS',
        status: 'in-progress',
        dueDate: '2025-02-25',
        resources: ['AI development lab', 'HELIOS source code access']
      }
    ]
  }
]

export function getCurriculumByGrade(grade: string): CurriculumItem[] {
  const gradeLevel = CURRICULUM_DATA.find(g => g.grade === grade)
  return gradeLevel ? gradeLevel.curriculum : []
}

export function getAllCurriculum(): CurriculumItem[] {
  return CURRICULUM_DATA.flatMap(level => level.curriculum)
}

export function getUpcomingCurriculum(): CurriculumItem[] {
  return getAllCurriculum().filter(item => item.status === 'upcoming' || item.status === 'in-progress')
}
