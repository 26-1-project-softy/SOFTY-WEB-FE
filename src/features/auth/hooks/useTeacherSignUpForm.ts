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
  getClassNumberErrorMessage,
  getGradeErrorMessage,
  getNumberDigits,
  getSchoolNameErrorMessage,
  getTeacherNameErrorMessage,
  validateNumberText,
  validateSchoolName,
  validateTeacherName,
} from '@/utils/teacherClassInfoValidation';
import { authApi, authSession, teacherAuthApi } from '@/services/auth';
import { ROUTES } from '@/constants/routes';
import { useToast } from '@/hooks/useToast';

type FieldErrors = {
  teacherName?: string;
  schoolName?: string;
  grade?: string;
  classNumber?: string;
};

export type SignUpStep = 'FORM' | 'SIGN_UP_SUCCESS' | 'CLASS_CODE_READY';

type GlobalError = AuthErrorMessage | null;

const FORM_ERROR_FALLBACK: AuthErrorMessage = {
  title: '회원가입 중 문제가 발생했어요.',
  description: '잠시 후 다시 시도해 주세요.',
};

const CLASS_CODE_ERROR_FALLBACK: AuthErrorMessage = {
  title: '학급코드 생성에 실패했어요.',
  description: '잠시 후 다시 시도해 주세요.',
};

const parseNumberText = (value: string) => Number(value.trim());

type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>;

export const useTeacherSignUpForm = () => {
  const navigate = useNavigate();
  const { authStatus, setSignedIn, setSignedOut } = useAuth();
  const { logout } = useLogout();
  const { showToast } = useToast();

  const [teacherName, setTeacherName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [grade, setGrade] = useState('');
  const [classNumber, setClassNumber] = useState('');
  const [globalError, setGlobalError] = useState<GlobalError>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingClassCode, setIsCreatingClassCode] = useState(false);
  const [step, setStep] = useState<SignUpStep>('FORM');
  const [generatedClassCode, setGeneratedClassCode] = useState('');

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
      validateNumberText(grade) &&
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

  const handleChangeTeacherName = (value: string) => {
    setTeacherName(value);
  };

  const handleChangeSchoolName = (value: string) => {
    setSchoolName(value);
  };

  const handleChangeGrade = (value: string) => {
    setGrade(getNumberDigits(value));
  };

  const handleChangeClassNumber = (value: string) => {
    setClassNumber(getNumberDigits(value));
  };

  const handleLogout = () => {
    if (step !== 'FORM') {
      return;
    }

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
        setGlobalError({
          title: response.message || FORM_ERROR_FALLBACK.title,
          description: FORM_ERROR_FALLBACK.description,
        });
        return;
      }

      setStep('SIGN_UP_SUCCESS');
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
          resetInvalidAuthSession();
          return;
        }
      }

      setGlobalError(getAuthErrorMessage(error, FORM_ERROR_FALLBACK));
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

      setGeneratedClassCode(classCodeResponse.data.classCode.trim());
      setStep('CLASS_CODE_READY');
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

  const handleCopyClassCode = async () => {
    const classCode = generatedClassCode.trim();

    if (!classCode) {
      showToast('복사할 학급코드가 없어요.', 'error');
      return;
    }

    if (!navigator.clipboard) {
      showToast('현재 브라우저에서는 복사를 지원하지 않아요.', 'error');
      return;
    }

    try {
      await navigator.clipboard.writeText(classCode);
      showToast('학급코드를 복사했어요.', 'success');
    } catch {
      showToast('학급코드 복사에 실패했어요.', 'error');
    }
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
    handleCopyClassCode,
  };
};
