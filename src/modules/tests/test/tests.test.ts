import { describe, it, expect, beforeEach } from 'vitest';
import { useTestsStore } from '../store/tests-store';
import { validateTestPayload } from '../../../core/utils';

describe('Test Payload Validation', () => {
  it('should validate test correctly', () => {
    const payload = {
      title: 'Indian Polity Final Quiz',
      duration: 45,
      cutoff_marks: 40,
      questions: [
        { questionId: 'q-1', order: 0 }
      ]
    };
    const res = validateTestPayload(payload);
    expect(res.isValid).toBe(true);
  });

  it('should reject invalid cutoff marks', () => {
    const payload = {
      title: 'Indian Polity Final Quiz',
      duration: 45,
      cutoff_marks: 120,
      questions: [
        { questionId: 'q-1', order: 0 }
      ]
    };
    const res = validateTestPayload(payload);
    expect(res.isValid).toBe(false);
    expect(res.error).toBe('Cutoff passing score must be between 0% and 100%');
  });

  it('should reject empty question list', () => {
    const payload = {
      title: 'Indian Polity Final Quiz',
      duration: 45,
      cutoff_marks: 50,
      questions: []
    };
    const res = validateTestPayload(payload);
    expect(res.isValid).toBe(false);
    expect(res.error).toBe('At least one question must be selected for the test');
  });
});

describe('Tests & Question Bank store actions', () => {
  beforeEach(() => {
    // Reset/Re-initialize store state for clean tests
    useTestsStore.setState({
      categories: [],
      subjects: [],
      topics: [],
      connections: [],
    });
  });

  it('should successfully add a new exam category', () => {
    const { addCategory } = useTestsStore.getState();
    
    addCategory('NEET Mock Exams', 'Syllabus matching CBSE NEET preparation', 'Award');
    
    const categories = useTestsStore.getState().categories;
    expect(categories).toHaveLength(1);
    expect(categories[0].name).toBe('NEET Mock Exams');
    expect(categories[0].iconName).toBe('Award');
  });

  it('should successfully add associated subjects to a category', () => {
    const { addSubject } = useTestsStore.getState();
    
    addSubject('cat_physics', 'Classical Mechanics');
    
    const subjects = useTestsStore.getState().subjects;
    expect(subjects).toHaveLength(1);
    expect(subjects[0].name).toBe('Classical Mechanics');
    expect(subjects[0].categoryId).toBe('cat_physics');
  });

  it('should successfully add associated topics to a subject', () => {
    const { addTopic } = useTestsStore.getState();
    
    addTopic('sub_physics_1', 'Newton Laws of Motion');
    
    const topics = useTestsStore.getState().topics;
    expect(topics).toHaveLength(1);
    expect(topics[0].name).toBe('Newton Laws of Motion');
    expect(topics[0].subjectId).toBe('sub_physics_1');
  });

  it('should successfully create and delete course connections', () => {
    const { addConnection, deleteConnection } = useTestsStore.getState();
    
    addConnection({
      courseId: 'c-test-1',
      courseTitle: 'React Testing Masterclass',
      testTitle: 'Jest & Vitest Assessment',
      questionCount: '25 Questions',
    });

    let connections = useTestsStore.getState().connections;
    expect(connections).toHaveLength(1);
    expect(connections[0].courseTitle).toBe('React Testing Masterclass');
    expect(connections[0].status).toBe('Active');

    const createdId = connections[0].id;
    deleteConnection(createdId);

    connections = useTestsStore.getState().connections;
    expect(connections).toHaveLength(0);
  });
});
