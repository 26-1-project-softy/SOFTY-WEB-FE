import { useEffect, useMemo, useState, type ComponentProps } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getAuthErrorMessage } from '@/features/auth/lib/getAuthErrorMessage';
import { authApi, authSession, teacherAuthApi } from '@/services/auth';
import { ROUTES } from '@/constants/routes';
import { useToastStore } from '@/stores/toastStore';

type FieldErrors = {
  teacherName?: string;
  schoolName?: string;
  grade?: string;
  classNumber?: string;
};

type GlobalError = {
  title: string;
  description: string;
} | null;

export type SignUpStep = 'FORM' | 'SIGN_UP_SUCCESS' | 'CLASS_CODE_READY';

const FORM_ERROR_FALLBACK: GlobalError = {
  title: '회원가입 중 문제가 발생했어요',
  description: '잠시 후 다시 시도해 주세요.',
};

const EXPIRED_AUTH_ERROR: GlobalError = {
  title: '인증 정보가 만료되었어요',
  description: '카카오 로그인을 다시 진행해 주세요.',
};

const parseNumberText = (value: string) => Number(value.trim());
const DEFAULT_CLASS_CODE = 'X7K-9P2';

type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>;

export const useTeacherSignUpForm = () => {
  const navigate = useNavigate();
  const { authStatus, setSignedIn, setSignedOut } = useAuth();
  const showToast = useToastStore(state => state.showToast);

  const [teacherName, setTeacherName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [grade, setGrade] = useState('');
  const [classNumber, setClassNumber] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [globalError, setGlobalError] = useState<GlobalError>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<SignUpStep>('FORM');
  const [generatedClassCode, setGeneratedClassCode] = useState(DEFAULT_CLASS_CODE);

  useEffect(() => {
    if (step === 'FORM') {
      return;
    }

    // Prevent navigating back to the teacher info form after completion.
    window.history.pushState({ signUpFlowCompleted: true }, '', window.location.href);

    const handlePopState = () => {
      navigate(ROUTES.teacherThreadList, { replace: true });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [step, navigate]);

  const validationResult = useMemo(() => {
    const errors: FieldErrors = {};

    if (teacherName.trim().length < 2) {
      errors.teacherName = '이름은 2자 이상 입력해 주세요.';
    }

    if (schoolName.trim().length === 0) {
      errors.schoolName = '학교명을 입력해 주세요.';
    }

    if (!/^\d+$/.test(grade.trim())) {
      errors.grade = '숫자만 입력해 주세요.';
    }

    if (!/^\d+$/.test(classNumber.trim())) {
      errors.classNumber = '숫자만 입력해 주세요.';
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0,
      parsedGrade: parseNumberText(grade),
      parsedClassNumber: parseNumberText(classNumber),
    };
  }, [teacherName, schoolName, grade, classNumber]);

  const isSignUpEnabled =
    validationResult.isValid &&
    !isSubmitting &&
    authStatus === 'SIGNUP_REQUIRED' &&
    step === 'FORM';

  const handleSubmit: FormSubmitHandler = async event => {
    event.preventDefault();

    setIsSubmitAttempted(true);
    setFieldErrors(validationResult.errors);
    setGlobalError(null);

    if (authStatus !== 'SIGNUP_REQUIRED') {
      setGlobalError(EXPIRED_AUTH_ERROR);
      return;
    }

    if (!validationResult.isValid) {
      return;
    }

    try {
      setIsSubmitting(true);
      const kakaoAccessToken = authSession.getAccessToken();

      if (!kakaoAccessToken) {
        setGlobalError(EXPIRED_AUTH_ERROR);
        return;
      }

      const response = await teacherAuthApi.signUp({
        teacherName: teacherName.trim(),
        schoolName: schoolName.trim(),
        grade: validationResult.parsedGrade,
        classNumber: validationResult.parsedClassNumber,
        kakaoAccessToken,
      });

      if (!response.success || !response.data?.userId || !response.data?.role) {
        setGlobalError(FORM_ERROR_FALLBACK);
        return;
      }

      const me = await authApi.getMe();

      authSession.setAuthStatus('SIGNED_IN');
      setSignedIn({
        role: me.role,
        user: me.user,
      });

      setStep('SIGN_UP_SUCCESS');
    } catch (error) {
      const message = getAuthErrorMessage(error, FORM_ERROR_FALLBACK.title);

      if (
        message === '인증 정보가 유효하지 않아 다시 시도해 주세요.' ||
        message === '접근 권한이 없어요'
      ) {
        authSession.clearSession();
        setSignedOut();
        navigate(ROUTES.root, { replace: true });
        return;
      }

      setGlobalError({
        title: message || FORM_ERROR_FALLBACK.title,
        description: FORM_ERROR_FALLBACK.description,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenClassCodeModal = () => {
    setGeneratedClassCode(DEFAULT_CLASS_CODE);
    setStep('CLASS_CODE_READY');
  };

  const handleCopyClassCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedClassCode);
      showToast('학급 코드가 복사되었어요.', 'success');
    } catch {
      showToast('복사에 실패했어요. 다시 시도해 주세요.', 'error');
    }
  };

  const handleGoToInbox = () => {
    navigate(ROUTES.teacherThreadList, { replace: true });
  };

  return {
    teacherName,
    schoolName,
    grade,
    classNumber,
    fieldErrors,
    globalError,
    isSubmitting,
    isSubmitAttempted,
    isSignUpEnabled,
    step,
    generatedClassCode,
    setTeacherName,
    setSchoolName,
    setGrade,
    setClassNumber,
    handleSubmit,
    handleOpenClassCodeModal,
    handleCopyClassCode,
    handleGoToInbox,
  };
};
