export type TeacherSignUpFieldErrors = {
  teacherName?: string;
  schoolName?: string;
  grade?: string;
  classNumber?: string;
};

export type TeacherSignUpFormValues = {
  teacherName: string;
  schoolName: string;
  grade: string;
  classNumber: string;
};

export type TeacherSignUpValidationResult = {
  errors: TeacherSignUpFieldErrors;
  isValid: boolean;
  parsedGrade: number;
  parsedClassNumber: number;
};

const parseNumberText = (value: string) => Number(value.trim());

export const validateTeacherSignUpForm = (
  values: TeacherSignUpFormValues
): TeacherSignUpValidationResult => {
  const errors: TeacherSignUpFieldErrors = {};

  if (values.teacherName.trim().length < 2) {
    errors.teacherName = '이름은 2자 이상 입력해 주세요.';
  }

  if (values.schoolName.trim().length === 0) {
    errors.schoolName = '학교명을 입력해 주세요.';
  }

  if (!/^\d+$/.test(values.grade.trim())) {
    errors.grade = '숫자만 입력해 주세요.';
  }

  if (!/^\d+$/.test(values.classNumber.trim())) {
    errors.classNumber = '숫자만 입력해 주세요.';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    parsedGrade: parseNumberText(values.grade),
    parsedClassNumber: parseNumberText(values.classNumber),
  };
};
