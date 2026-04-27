import { AxiosError } from 'axios';
import { useMemo, useState, type ComponentProps } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  getAuthErrorMessage,
  type AuthErrorMessage,
} from '@/features/auth/lib/getAuthErrorMessage';
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

const parseNumberText = (value: string) => Number(value.trim());

type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>;

export const useTeacherSignUpForm = () => {
  const navigate = useNavigate();
  const { authStatus, setSignedIn, setSignedOut } = useAuth();
  const { showToast } = useToast();

  const [teacherName, setTeacherName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [grade, setGrade] = useState('');
  const [classNumber, setClassNumber] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [globalError, setGlobalError] = useState<GlobalError>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingClassCode, setIsCreatingClassCode] = useState(false);
  const [step, setStep] = useState<SignUpStep>('FORM');
  const [generatedClassCode, setGeneratedClassCode] = useState('');

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

      if (!response.success || !response.data?.userId || !response.data?.role) {
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
          authSession.clearSession();
          setSignedOut();
          navigate(ROUTES.root, { replace: true });
          return;
        }
      }

      const nextErrorState = getAuthErrorMessage(error, FORM_ERROR_FALLBACK);

      setGlobalError(nextErrorState);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenClassCodeModal = async () => {
    setGlobalError(null);

    try {
      setIsCreatingClassCode(true);

      const classCodeResponse = await teacherAuthApi.createClassCode();

      if (!classCodeResponse.success || !classCodeResponse.data?.classCode?.trim()) {
        setGlobalError({
          title: classCodeResponse.message || '학급코드 생성에 실패했어요.',
          description: '잠시 후 다시 시도해 주세요.',
        });
        return;
      }

      setGeneratedClassCode(classCodeResponse.data.classCode.trim());
      setStep('CLASS_CODE_READY');
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
          authSession.clearSession();
          setSignedOut();
          navigate(ROUTES.root, { replace: true });
          return;
        }
      }

      const nextErrorState = getAuthErrorMessage(error, {
        title: '학급코드 생성에 실패했어요.',
        description: '잠시 후 다시 시도해 주세요.',
      });

      setGlobalError(nextErrorState);
    } finally {
      setIsCreatingClassCode(false);
    }
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

  const handleGoToInbox = async () => {
    try {
      const me = await authApi.getMe();

      authSession.setAuthStatus('SIGNED_IN');
      setSignedIn({
        role: me.role,
        user: me.user,
      });

      navigate(ROUTES.teacherThreadList, { replace: true });
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

      navigate(ROUTES.teacherThreadList, { replace: true });
    }
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
