import { AxiosError } from 'axios';
import { useMemo, useState, type ComponentProps } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLogout } from '@/hooks/useLogout';
import {
  getAuthErrorMessage,
  type AuthErrorMessage,
} from '@/features/auth/lib/getAuthErrorMessage';
import {
  clearStoredTeacherSignUpState,
  getStoredTeacherSignUpState,
  setStoredTeacherSignUpState,
  type StoredTeacherSignUpState,
} from '@/features/auth/lib/teacherSignUpSessionStorage';
import {
  getClassNumberErrorMessage,
  getGradeErrorMessage,
  getNumberDigits,
  getSchoolNameErrorMessage,
  getTeacherNameErrorMessage,
  validateGradeText,
  validateNumberText,
  validateSchoolName,
  validateTeacherName,
} from '@/utils/teacherClassInfoValidation';
import { authApi, authSession, teacherAuthApi } from '@/services/auth';
import { ROUTES } from '@/constants/routes';

type FieldErrors = {
  teacherName?: string;
  schoolName?: string;
  grade?: string;
  classNumber?: string;
};

export type SignUpStep = 'FORM' | 'SIGN_UP_SUCCESS' | 'CLASS_CODE_READY';

type GlobalError = AuthErrorMessage | null;

type ApiErrorResponse = {
  message?: string;
};

const SIGN_UP_ERROR_FALLBACK: AuthErrorMessage = {
  title: '회원가입 중 문제가 발생했어요.',
  description: '잠시 후 다시 시도해 주세요.',
};

const CLASS_CODE_ERROR_FALLBACK: AuthErrorMessage = {
  title: '학급코드 생성에 실패했어요.',
  description: '잠시 후 다시 시도해 주세요.',
};

const ALREADY_SIGNED_UP_ERROR: AuthErrorMessage = {
  title: '이미 교사 회원가입이 완료된 사용자입니다.',
  description: '로그아웃한 뒤 다시 로그인해 주세요.',
};

const parseNumberText = (value: string) => Number(value.trim());

const getApiErrorMessage = (error: AxiosError) => {
  const responseData = error.response?.data as ApiErrorResponse | undefined;

  return responseData?.message;
};

const getTeacherSignUpErrorMessage = (message?: string): AuthErrorMessage => {
  if (message === ALREADY_SIGNED_UP_ERROR.title) {
    return ALREADY_SIGNED_UP_ERROR;
  }

  return {
    title: message || SIGN_UP_ERROR_FALLBACK.title,
    description: SIGN_UP_ERROR_FALLBACK.description,
  };
};

type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>;

export const useTeacherSignUpForm = () => {
  const navigate = useNavigate();
  const { authStatus, setSignedIn, setSignedOut } = useAuth();
  const { logout } = useLogout();

  const storedTeacherSignUpState = getStoredTeacherSignUpState();

  const [teacherName, setTeacherName] = useState(storedTeacherSignUpState?.teacherName ?? '');
  const [schoolName, setSchoolName] = useState(storedTeacherSignUpState?.schoolName ?? '');
  const [grade, setGrade] = useState(storedTeacherSignUpState?.grade ?? '');
  const [classNumber, setClassNumber] = useState(storedTeacherSignUpState?.classNumber ?? '');
  const [globalError, setGlobalError] = useState<GlobalError>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingClassCode, setIsCreatingClassCode] = useState(false);
  const [step, setStep] = useState<SignUpStep>(storedTeacherSignUpState?.step ?? 'FORM');
  const [generatedClassCode, setGeneratedClassCode] = useState(
    storedTeacherSignUpState?.generatedClassCode ?? ''
  );

  const validationResult = useMemo(() => {
    const fieldErrors: FieldErrors = {
      teacherName: getTeacherNameErrorMessage(teacherName),
      schoolName: getSchoolNameErrorMessage(schoolName),
      grade: getGradeErrorMessage(grade),
      classNumber: getClassNumberErrorMessage(classNumber),
    };

    const visibleErrors = Object.fromEntries(
      Object.entries(fieldErrors).filter(([, message]) => Boolean(message))
    ) as FieldErrors;

    const isValid =
      validateTeacherName(teacherName) &&
      validateSchoolName(schoolName) &&
      validateGradeText(grade) &&
      validateNumberText(classNumber);

    return {
      errors: visibleErrors,
      isValid,
      parsedGrade: parseNumberText(grade),
      parsedClassNumber: parseNumberText(classNumber),
    };
  }, [teacherName, schoolName, grade, classNumber]);

  const isSignUpEnabled =
    validationResult.isValid &&
    !isSubmitting &&
    authStatus === 'SIGNUP_REQUIRED' &&
    step === 'FORM';

  const isSignUpActionDisabled = useMemo(() => {
    if (step === 'FORM') {
      return !isSignUpEnabled;
    }

    if (step === 'SIGN_UP_SUCCESS') {
      return isCreatingClassCode;
    }

    return false;
  }, [isCreatingClassCode, isSignUpEnabled, step]);

  const getCurrentStoredTeacherSignUpState = (
    overrides?: Partial<StoredTeacherSignUpState>
  ): StoredTeacherSignUpState => {
    return {
      step,
      teacherName,
      schoolName,
      grade,
      classNumber,
      generatedClassCode,
      ...overrides,
    };
  };

  const saveTeacherSignUpState = (overrides?: Partial<StoredTeacherSignUpState>) => {
    setStoredTeacherSignUpState(getCurrentStoredTeacherSignUpState(overrides));
  };

  const handleChangeTeacherName = (value: string) => {
    setTeacherName(value);

    saveTeacherSignUpState({
      step: 'FORM',
      teacherName: value,
    });
  };

  const handleChangeSchoolName = (value: string) => {
    setSchoolName(value);

    saveTeacherSignUpState({
      step: 'FORM',
      schoolName: value,
    });
  };

  const handleChangeGrade = (value: string) => {
    const nextGrade = getNumberDigits(value);

    setGrade(nextGrade);

    saveTeacherSignUpState({
      step: 'FORM',
      grade: nextGrade,
    });
  };

  const handleChangeClassNumber = (value: string) => {
    const nextClassNumber = getNumberDigits(value);

    setClassNumber(nextClassNumber);

    saveTeacherSignUpState({
      step: 'FORM',
      classNumber: nextClassNumber,
    });
  };

  const handleLogout = () => {
    if (step !== 'FORM') {
      return;
    }

    clearStoredTeacherSignUpState();
    logout();
  };

  const applySignedInState = async () => {
    authSession.setAuthStatus('SIGNED_IN');

    try {
      const me = await authApi.getMe();

      setSignedIn({
        activeRole: me.activeRole,
        user: me.user,
      });

      return;
    } catch {
      setSignedIn({
        activeRole: 'teacher',
        user: {
          name: teacherName.trim() || '선생님',
          grade: validationResult.parsedGrade,
          classNumber: validationResult.parsedClassNumber,
        },
      });
    }
  };

  const resetInvalidAuthSession = () => {
    clearStoredTeacherSignUpState();
    authSession.clearSession();
    setSignedOut();
    navigate(ROUTES.root, { replace: true });
  };

  const submitTeacherSignUp = async () => {
    setGlobalError(null);

    if (authStatus !== 'SIGNUP_REQUIRED') {
      setGlobalError({
        title: '인증 정보가 만료되었어요.',
        description: '카카오 로그인을 다시 진행해 주세요.',
      });
      return;
    }

    if (!validationResult.isValid) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await teacherAuthApi.signUp({
        teacherName: teacherName.trim(),
        schoolName: schoolName.trim(),
        grade: validationResult.parsedGrade,
        classNumber: validationResult.parsedClassNumber,
      });

      if (!response.success) {
        setGlobalError(getTeacherSignUpErrorMessage(response.message));
        return;
      }

      setStep('SIGN_UP_SUCCESS');
      saveTeacherSignUpState({
        step: 'SIGN_UP_SUCCESS',
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
          resetInvalidAuthSession();
          return;
        }

        if (status === 409) {
          setGlobalError(getTeacherSignUpErrorMessage(getApiErrorMessage(error)));
          return;
        }
      }

      setGlobalError(getAuthErrorMessage(error, SIGN_UP_ERROR_FALLBACK));
    } finally {
      setIsSubmitting(false);
    }
  };

  const createClassCode = async () => {
    setGlobalError(null);

    try {
      setIsCreatingClassCode(true);

      const classCodeResponse = await teacherAuthApi.createClassCode();

      if (!classCodeResponse.success || !classCodeResponse.data?.classCode?.trim()) {
        setGlobalError({
          title: classCodeResponse.message || CLASS_CODE_ERROR_FALLBACK.title,
          description: CLASS_CODE_ERROR_FALLBACK.description,
        });
        return;
      }

      const nextClassCode = classCodeResponse.data.classCode.trim();

      setGeneratedClassCode(nextClassCode);
      setStep('CLASS_CODE_READY');
      saveTeacherSignUpState({
        step: 'CLASS_CODE_READY',
        generatedClassCode: nextClassCode,
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
          resetInvalidAuthSession();
          return;
        }
      }

      setGlobalError(getAuthErrorMessage(error, CLASS_CODE_ERROR_FALLBACK));
    } finally {
      setIsCreatingClassCode(false);
    }
  };

  const goToInbox = async () => {
    await applySignedInState();
    clearStoredTeacherSignUpState();
    navigate(ROUTES.teacherThreadList, { replace: true });
  };

  const handleSignUpAction = async () => {
    if (isSignUpActionDisabled) {
      return;
    }

    if (step === 'FORM') {
      await submitTeacherSignUp();
      return;
    }

    if (step === 'SIGN_UP_SUCCESS') {
      await createClassCode();
      return;
    }

    await goToInbox();
  };

  const handleSubmit: FormSubmitHandler = event => {
    event.preventDefault();
    void handleSignUpAction();
  };

  return {
    teacherName,
    schoolName,
    grade,
    classNumber,
    fieldErrors: validationResult.errors,
    globalError,
    step,
    generatedClassCode,
    isSignUpActionDisabled,
    setTeacherName: handleChangeTeacherName,
    setSchoolName: handleChangeSchoolName,
    setGrade: handleChangeGrade,
    setClassNumber: handleChangeClassNumber,
    handleLogout,
    handleSubmit,
    handleSignUpAction,
  };
};
