import { useMemo, useState, type ComponentProps } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getAuthErrorMessage } from '@/features/auth/lib/getAuthErrorMessage';
import { authApi, authSession, teacherAuthApi } from '@/services/auth';
import { ROUTES } from '@/constants/routes';

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

const FORM_ERROR_FALLBACK: GlobalError = {
  title: '회원가입 중 문제가 발생했어요',
  description: '잠시 후 다시 시도해 주세요.',
};

const parseNumberText = (value: string) => Number(value.trim());

type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>;

export const useTeacherSignUpForm = () => {
  const navigate = useNavigate();
  const { authStatus, setSignedIn, setSignedOut } = useAuth();

  const [teacherName, setTeacherName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [grade, setGrade] = useState('');
  const [classNumber, setClassNumber] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [globalError, setGlobalError] = useState<GlobalError>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationResult = useMemo(() => {
    const errors: FieldErrors = {};

    if (teacherName.trim().length < 2) {
      errors.teacherName = '이름은 2자 이상 입력해주세요.';
    }

    if (schoolName.trim().length === 0) {
      errors.schoolName = '학교명을 입력해주세요.';
    }

    if (!/^\d+$/.test(grade.trim())) {
      errors.grade = '숫자만 입력해주세요.';
    }

    if (!/^\d+$/.test(classNumber.trim())) {
      errors.classNumber = '숫자만 입력해주세요.';
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0,
      parsedGrade: parseNumberText(grade),
      parsedClassNumber: parseNumberText(classNumber),
    };
  }, [teacherName, schoolName, grade, classNumber]);

  const isSignUpEnabled =
    validationResult.isValid && !isSubmitting && authStatus === 'SIGNUP_REQUIRED';

  const handleSubmit: FormSubmitHandler = async event => {
    event.preventDefault();

    setIsSubmitAttempted(true);
    setFieldErrors(validationResult.errors);
    setGlobalError(null);

    if (authStatus !== 'SIGNUP_REQUIRED') {
      setGlobalError({
        title: '인증 정보가 만료되었어요',
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

      const me = await authApi.getMe();

      authSession.setAuthStatus('SIGNED_IN');
      setSignedIn({
        role: me.role,
        user: me.user,
      });

      navigate(ROUTES.teacherThreadList, { replace: true });
    } catch (error) {
      const message = getAuthErrorMessage(error, FORM_ERROR_FALLBACK.title);

      if (
        message === '인증 정보가 유효하지 않아요. 다시 시도해 주세요.' ||
        message === '접근 권한이 없어요.'
      ) {
        authSession.clearSession();
        setSignedOut();
        navigate(ROUTES.root, { replace: true });
        return;
      }

      setGlobalError({
        title: message,
        description: FORM_ERROR_FALLBACK.description,
      });
    } finally {
      setIsSubmitting(false);
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
    isSubmitAttempted,
    isSignUpEnabled,
    setTeacherName,
    setSchoolName,
    setGrade,
    setClassNumber,
    handleSubmit,
  };
};
