import { describe, it, expect } from 'vitest';
import { validateQuestionPayload } from '../../../core/utils';

describe('Question Payload Validation', () => {
  it('should validate single choice question correctly', () => {
    const validPayload = {
      type: 'single_choice',
      question_text_en: 'What is the capital of Tamil Nadu?',
      exam_category: 'TNPSC Group 1',
      options: [
        { label: 'A', text_en: 'Chennai', is_correct: true },
        { label: 'B', text_en: 'Madurai', is_correct: false }
      ]
    };
    
    const result = validateQuestionPayload(validPayload);
    expect(result.isValid).toBe(true);
  });

  it('should fail choice questions if options are less than 2', () => {
    const invalidPayload = {
      type: 'single_choice',
      question_text_en: 'What is the capital of Tamil Nadu?',
      exam_category: 'TNPSC Group 1',
      options: [
        { label: 'A', text_en: 'Chennai', is_correct: true }
      ]
    };
    
    const result = validateQuestionPayload(invalidPayload);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Choice questions must have at least 2 options');
  });

  it('should fail if no option is marked as correct', () => {
    const invalidPayload = {
      type: 'single_choice',
      question_text_en: 'What is the capital of Tamil Nadu?',
      exam_category: 'TNPSC Group 1',
      options: [
        { label: 'A', text_en: 'Chennai', is_correct: false },
        { label: 'B', text_en: 'Madurai', is_correct: false }
      ]
    };
    
    const result = validateQuestionPayload(invalidPayload);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('At least one option must be marked as correct');
  });

  it('should validate fill in the blank question correctly', () => {
    const validPayload = {
      type: 'fill_in_blank',
      question_text_en: 'The sky is _____',
      exam_category: 'General Science',
      accepted_answers: [
        { value: 'blue', case_sensitive: false },
        { value: 'Blue', case_sensitive: true }
      ]
    };
    
    const result = validateQuestionPayload(validPayload);
    expect(result.isValid).toBe(true);
  });

  it('should fail fill in the blank if accepted answers are empty', () => {
    const invalidPayload = {
      type: 'fill_in_blank',
      question_text_en: 'The sky is _____',
      exam_category: 'General Science',
      accepted_answers: []
    };
    
    const result = validateQuestionPayload(invalidPayload);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Fill in the blank questions must have at least one accepted answer');
  });
});
