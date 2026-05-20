import type { SignUpStep } from '@/features/auth/hooks/useTeacherSignUpForm';

export type StoredTeacherSignUpState = {
  step: SignUpStep;
  teacherName: string;
  schoolName: string;
  grade: string;
  classNumber: string;
  generatedClassCode: string;
};

const TEACHER_SIGN_UP_STORAGE_KEY = 'softy-teacher-sign-up-state';

const isSignUpStep = (value: unknown): value is SignUpStep => {
  return value === 'FORM' || value === 'SIGN_UP_SUCCESS' || value === 'CLASS_CODE_READY';
};

export const getStoredTeacherSignUpState = (): StoredTeacherSignUpState | null => {
  const storedValue = sessionStorage.getItem(TEACHER_SIGN_UP_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as Partial<StoredTeacherSignUpState>;

    if (!isSignUpStep(parsedValue.step)) {
      return null;
    }

    return {
      step: parsedValue.step,
      teacherName: parsedValue.teacherName ?? '',
      schoolName: parsedValue.schoolName ?? '',
      grade: parsedValue.grade ?? '',
      classNumber: parsedValue.classNumber ?? '',
      generatedClassCode: parsedValue.generatedClassCode ?? '',
    };
  } catch {
    return null;
  }
};

export const setStoredTeacherSignUpState = (state: StoredTeacherSignUpState) => {
  sessionStorage.setItem(TEACHER_SIGN_UP_STORAGE_KEY, JSON.stringify(state));
};

export const clearStoredTeacherSignUpState = () => {
  sessionStorage.removeItem(TEACHER_SIGN_UP_STORAGE_KEY);
};
