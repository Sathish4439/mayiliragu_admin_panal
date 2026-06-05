import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ExamCategory {
  id: string;
  name: string;
  description: string;
  iconName: string; // lucide icon name
}

export interface ExamSubject {
  id: string;
  name: string;
  categoryId: string;
}

export interface ExamTopic {
  id: string;
  name: string;
  subjectId: string;
}

export interface CourseConnection {
  id: string;
  courseId: string;
  courseTitle: string;
  moduleId?: string;
  moduleTitle?: string;
  testTitle: string;
  questionCount: string;
  status: string;
}

interface TestsState {
  categories: ExamCategory[];
  subjects: ExamSubject[];
  topics: ExamTopic[];
  connections: CourseConnection[];
  
  // Actions
  addCategory: (name: string, description: string, iconName: string) => void;
  addSubject: (categoryId: string, name: string) => void;
  addTopic: (subjectId: string, name: string) => void;
  addConnection: (connection: Omit<CourseConnection, 'id' | 'status'>) => void;
  deleteConnection: (id: string) => void;
}

export const useTestsStore = create<TestsState>()(
  persist(
    (set) => ({
      categories: [
        {
          id: 'cat_tnpsc',
          name: 'TNPSC Exams',
          description: 'Tamil Nadu Public Service Commission exams including Group 1, 2, 4.',
          iconName: 'GraduationCap',
        },
        {
          id: 'cat_banking',
          name: 'Banking Exams',
          description: 'IBPS, SBI PO/Clerk, and RBI grade assistant recruitment tests.',
          iconName: 'Landmark',
        },
        {
          id: 'cat_trb',
          name: 'TRB Exams',
          description: 'Teachers Recruitment Board examinations for teaching posts.',
          iconName: 'FileText',
        },
      ],
      subjects: [
        {
          id: 'sub_polity',
          name: 'Indian Polity',
          categoryId: 'cat_tnpsc',
        },
        {
          id: 'sub_aptitude',
          name: 'Quantitative Aptitude',
          categoryId: 'cat_banking',
        },
        {
          id: 'sub_english',
          name: 'General English',
          categoryId: 'cat_trb',
        },
      ],
      topics: [
        {
          id: 'top_rights',
          name: 'Fundamental Rights',
          subjectId: 'sub_polity',
        },
        {
          id: 'top_ratios',
          name: 'Ratios & Proportions',
          subjectId: 'sub_aptitude',
        },
        {
          id: 'top_tenses',
          name: 'Tenses & Active Voice',
          subjectId: 'sub_english',
        },
      ],
      connections: [
        {
          id: 'conn_1',
          courseId: 'c1',
          courseTitle: 'TNPSC Group 2 Foundation',
          moduleId: 'm1',
          moduleTitle: 'Indian Polity & Governance',
          testTitle: 'Polity Quiz - Fundamental Rights',
          questionCount: '15 Questions',
          status: 'Active',
        },
        {
          id: 'conn_2',
          courseId: 'c2',
          courseTitle: 'UPSC Civil Services Prelims',
          moduleId: 'm2',
          moduleTitle: 'Ancient Indian History',
          testTitle: 'History Mock Test 1',
          questionCount: '20 Questions',
          status: 'Active',
        },
      ],

      addCategory: (name, description, iconName) =>
        set((state) => ({
          categories: [
            ...state.categories,
            {
              id: `cat_${Date.now()}`,
              name,
              description,
              iconName,
            },
          ],
        })),

      addSubject: (categoryId, name) =>
        set((state) => ({
          subjects: [
            ...state.subjects,
            {
              id: `sub_${Date.now()}`,
              name,
              categoryId,
            },
          ],
        })),

      addTopic: (subjectId, name) =>
        set((state) => ({
          topics: [
            ...state.topics,
            {
              id: `top_${Date.now()}`,
              name,
              subjectId,
            },
          ],
        })),

      addConnection: (connection) =>
        set((state) => ({
          connections: [
            ...state.connections,
            {
              ...connection,
              id: `conn_${Date.now()}`,
              status: 'Active',
            },
          ],
        })),

      deleteConnection: (id) =>
        set((state) => ({
          connections: state.connections.filter((c) => c.id !== id),
        })),
    }),
    {
      name: 'mayiliragu-tests-storage',
    }
  )
);
