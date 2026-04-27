import { useEffect, useMemo, useState, type ComponentProps } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getAuthErrorMessage } from '@/features/auth/lib/getAuthErrorMessage';
import {
  type TeacherSignUpFieldErrors,
  validateTeacherSignUpForm,
} from '@/features/auth/lib/teacherSignUpValidation';
import { authApi, authSession, teacherAuthApi } from '@/services/auth';
import { ROUTES } from '@/constants/routes';
import { useToastStore } from '@/stores/toastStore';

type TouchedFields = Record<keyof TeacherSignUpFieldErrors, boolean>;

export type GlobalError = {
  title: string;
  description: string;
} | null;

export type SignUpStep = 'FORM' | 'SIGN_UP_SUCCESS' | 'CLASS_CODE_READY';

const FORM_ERROR_FALLBACK: NonNullable<GlobalError> = {
  title: '회원가입 중 문제가 발생했어요',
  description: '잠시 후 다시 시도해 주세요.',
};

const EXPIRED_AUTH_ERROR: NonNullable<GlobalError> = {
  title: '인증 정보가 만료되었어요',
  description: '카카오 로그인을 다시 진행해 주세요.',
};

const CLASS_CODE_ERROR_FALLBACK: NonNullable<GlobalError> = {
  title: '학급 코드 생성에 실패했어요',
  description: '잠시 후 다시 시도해 주세요.',
};

type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>;

const normalizeRole = (role: string): 'teacher' | 'admin' | null => {
  const normalized = role
    .trim()
    .replace(/^ROLE_/i, '')
    .toLowerCase();

  if (normalized === 'teacher' || normalized === 'admin') {
    return normalized;
  }

  return null;
};

const toGlobalError = (errorMessage: {
  title: string;
  description?: string;
}): NonNullable<GlobalError> => {
  return {
    title: errorMessage.title,
    description: errorMessage.description ?? '잠시 후 다시 시도해 주세요.',
  };
};

export const useTeacherSignUpForm = () => {
  const navigate = useNavigate();
  const { authStatus, setSignupRequired, setSignedIn, setSignedOut } = useAuth();
  const showToast = useToastStore(state => state.showToast);

  const [teacherName, setTeacherName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [grade, setGrade] = useState('');
  const [classNumber, setClassNumber] = useState('');
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [globalError, setGlobalError] = useState<GlobalError>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingClassCode, setIsCreatingClassCode] = useState(false);
  const [step, setStep] = useState<SignUpStep>('FORM');
  const [generatedClassCode, setGeneratedClassCode] = useState('');
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({
    teacherName: false,
    schoolName: false,
    grade: false,
    classNumber: false,
  });

  useEffect(() => {
    if (step === 'FORM') {
      return;
    }

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
    return validateTeacherSignUpForm({
      teacherName,
      schoolName,
      grade,
      classNumber,
    });
  }, [teacherName, schoolName, grade, classNumber]);

  const isSignUpEnabled =
    validationResult.isValid &&
    !isSubmitting &&
    authStatus === 'SIGNUP_REQUIRED' &&
    step === 'FORM';

  const shouldShowError = (field: keyof TeacherSignUpFieldErrors) => {
    return isSubmitAttempted || touchedFields[field];
  };

  const fieldErrors: TeacherSignUpFieldErrors = {
    teacherName: shouldShowError('teacherName') ? validationResult.errors.teacherName : undefined,
    schoolName: shouldShowError('schoolName') ? validationResult.errors.schoolName : undefined,
    grade: shouldShowError('grade') ? validationResult.errors.grade : undefined,
    classNumber: shouldShowError('classNumber') ? validationResult.errors.classNumber : undefined,
  };

  const touchField = (field: keyof TeacherSignUpFieldErrors) => {
    setTouchedFields(prev => (prev[field] ? prev : { ...prev, [field]: true }));
  };

  const handleChangeTeacherName = (value: string) => {
    touchField('teacherName');
    setTeacherName(value);
  };

  const handleChangeSchoolName = (value: string) => {
    touchField('schoolName');
    setSchoolName(value);
  };

  const handleChangeGrade = (value: string) => {
    touchField('grade');
    setGrade(value);
  };

  const handleChangeClassNumber = (value: string) => {
    touchField('classNumber');
    setClassNumber(value);
  };

  const handleSubmit: FormSubmitHandler = async event => {
    event.preventDefault();

    setIsSubmitAttempted(true);
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

      const normalizedRole = normalizeRole(response.data.role);

      if (normalizedRole !== 'teacher') {
        authSession.clearSession();
        setSignedOut();
        navigate(ROUTES.root, { replace: true });
        showToast('교사 권한 확인에 실패했어요. 다시 로그인해 주세요.', 'error');
        return;
      }

      setStep('SIGN_UP_SUCCESS');
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error, FORM_ERROR_FALLBACK);

      if (
        errorMessage.title === '인증 정보가 유효하지 않아 다시 시도해 주세요.' ||
        errorMessage.title === '접근 권한이 없어요'
      ) {
        authSession.clearSession();
        setSignedOut();
        navigate(ROUTES.root, { replace: true });
        return;
      }

      setGlobalError(toGlobalError(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenClassCodeModal = async () => {
    setGlobalError(null);

    try {
      setIsCreatingClassCode(true);

      const response = await teacherAuthApi.createClassCode();

      if (!response.success || !response.data?.classCode?.trim()) {
        showToast(response.message || CLASS_CODE_ERROR_FALLBACK.title, 'error');
        return;
      }

      setGeneratedClassCode(response.data.classCode.trim());
      setStep('CLASS_CODE_READY');
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error, CLASS_CODE_ERROR_FALLBACK);

      if (errorMessage.title === '접근 권한이 없어요') {
        authSession.setAuthStatus('SIGNUP_REQUIRED');
        setSignupRequired();
        setStep('FORM');
        setGlobalError({
          title: '교사 권한 확인에 실패했어요',
          description: '회원가입 정보를 다시 입력해 주세요.',
        });
        showToast('교사 권한이 확인되지 않았어요. 회원가입을 다시 진행해 주세요.', 'error');
        return;
      }

      showToast(errorMessage.title, 'error');
    } finally {
      setIsCreatingClassCode(false);
    }
  };

  const handleCopyClassCode = async () => {
    if (!generatedClassCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedClassCode);
      showToast('학급 코드가 복사되었어요.', 'success');
    } catch {
      showToast('복사에 실패했어요. 다시 시도해 주세요.', 'error');
    }
  };

  const handleGoToInbox = () => {
    const moveToInbox = async () => {
      try {
        const me = await authApi.getMe();

        authSession.setAuthStatus('SIGNED_IN');
        setSignedIn({
          role: me.role,
          user: me.user,
        });
      } catch {
        authSession.setAuthStatus('SIGNED_IN');
        setSignedIn({
          role: 'teacher',
          user: {
            name: teacherName.trim() || '선생님',
            grade: validationResult.parsedGrade,
            classNumber: validationResult.parsedClassNumber,
          },
        });
      }

      navigate(ROUTES.teacherThreadList, { replace: true });
    };

    void moveToInbox();
  };

  return {
    teacherName,
    schoolName,
    grade,
    classNumber,
    fieldErrors,
    globalError,
    isSubmitting,
    isCreatingClassCode,
    isSubmitAttempted,
    isSignUpEnabled,
    step,
    generatedClassCode,
    setTeacherName: handleChangeTeacherName,
    setSchoolName: handleChangeSchoolName,
    setGrade: handleChangeGrade,
    setClassNumber: handleChangeClassNumber,
    handleSubmit,
    handleOpenClassCodeModal,
    handleCopyClassCode,
    handleGoToInbox,
  };
};
