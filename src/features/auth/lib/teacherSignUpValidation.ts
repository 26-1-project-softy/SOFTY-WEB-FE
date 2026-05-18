const nameInvalidCharPattern = /[^A-Zㄱ-ㅎㅏ-ㅣ가-힣\s]/i;
const incompleteKoreanCharPattern = /[ㄱ-ㅎㅏ-ㅣ]/;
const schoolNameInvalidCharPattern = /[^A-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣\s·.'’()-]/i;

const MIN_NAME_LENGTH = 2;
const MIN_SCHOOL_NAME_LENGTH = 2;

export const getTextWithoutSpaces = (value: string) => {
  return value.replace(/\s/g, '');
};

export const getNumberDigits = (value: string) => {
  return value.replace(/[^0-9]/g, '');
};

export const hasInvalidNameChar = (value: string) => {
  return nameInvalidCharPattern.test(value);
};

export const hasIncompleteKoreanChar = (value: string) => {
  const normalizedValue = getTextWithoutSpaces(value);

  if (!normalizedValue) {
    return false;
  }

  return incompleteKoreanCharPattern.test(value);
};

export const validateTeacherName = (value: string) => {
  const normalizedValue = getTextWithoutSpaces(value);

  return (
    !hasInvalidNameChar(value) &&
    !hasIncompleteKoreanChar(value) &&
    normalizedValue.length >= MIN_NAME_LENGTH
  );
};

export const getTeacherNameErrorMessage = (value: string) => {
  const normalizedValue = getTextWithoutSpaces(value);

  if (value.length === 0) {
    return undefined;
  }

  if (hasInvalidNameChar(value)) {
    return '한글과 영문만 입력할 수 있어요.';
  }

  if (hasIncompleteKoreanChar(value)) {
    return '완성된 한글 또는 영문 이름을 입력해 주세요.';
  }

  if (normalizedValue.length < MIN_NAME_LENGTH) {
    return '이름은 두 글자 이상 입력해 주세요.';
  }

  return undefined;
};

export const validateSchoolName = (value: string) => {
  const normalizedValue = getTextWithoutSpaces(value);

  return (
    normalizedValue.length >= MIN_SCHOOL_NAME_LENGTH &&
    !schoolNameInvalidCharPattern.test(value) &&
    !hasIncompleteKoreanChar(value)
  );
};

export const getSchoolNameErrorMessage = (value: string) => {
  const normalizedValue = getTextWithoutSpaces(value);

  if (value.length === 0) {
    return undefined;
  }

  if (schoolNameInvalidCharPattern.test(value)) {
    return '학교명에 사용할 수 없는 문자가 포함되어 있어요.';
  }

  if (hasIncompleteKoreanChar(value)) {
    return '완성된 학교명을 입력해 주세요.';
  }

  if (normalizedValue.length < MIN_SCHOOL_NAME_LENGTH) {
    return '학교명은 두 글자 이상 입력해 주세요.';
  }

  return undefined;
};

export const validateNumberText = (value: string) => {
  return /^\d+$/.test(value.trim());
};

export const getGradeErrorMessage = (value: string) => {
  if (value.length === 0) {
    return undefined;
  }

  if (!validateNumberText(value)) {
    return '숫자만 입력해 주세요.';
  }

  return undefined;
};

export const getClassNumberErrorMessage = (value: string) => {
  if (value.length === 0) {
    return undefined;
  }

  if (!validateNumberText(value)) {
    return '숫자만 입력해 주세요.';
  }

  return undefined;
};
