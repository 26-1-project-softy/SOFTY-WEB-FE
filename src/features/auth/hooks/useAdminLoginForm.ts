import { AxiosError } from 'axios';
import { useMemo, useState, type ComponentProps } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  getAuthErrorMessage,
  type AuthErrorMessage,
} from '@/features/auth/lib/getAuthErrorMessage';
import { InvalidAuthenticatedUserResponseError } from '@/services/auth/authApi';
import { adminAuthApi, authApi, authSession } from '@/services/auth';
import { ROUTES } from '@/constants/routes';

type LoginErrorState = AuthErrorMessage | null;

const DEFAULT_LOGIN_ERROR: AuthErrorMessage = {
  title: '아이디 또는 비밀번호가 올바르지 않아요',
  description: '입력한 정보를 다시 확인해 주세요.',
};

const RETRYABLE_STATUS_CODES = [500, 502, 503, 504] as const;

const delay = (ms: number) =>
  new Promise<void>(resolve => {
    window.setTimeout(resolve, ms);
  });

const isRetryableError = (error: unknown) => {
  if (!(error instanceof AxiosError)) {
    return false;
  }

  if (!error.response) {
    return true;
  }

  const status = error.response.status;

  return RETRYABLE_STATUS_CODES.includes(status as (typeof RETRYABLE_STATUS_CODES)[number]);
};

const getMeWithRetry = async (accessToken: string) => {
  try {
    return await authApi.getMe(accessToken);
  } catch (error) {
    if (!isRetryableError(error)) {
      throw error;
    }

    await delay(300);

    return authApi.getMe(accessToken);
  }
};

type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>;

export const useAdminLoginForm = () => {
  const navigate = useNavigate();
  const { setSignedIn, setSignedOut } = useAuth();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<LoginErrorState>(null);

  const isLoginEnabled = useMemo(() => {
    return !isSubmitting && loginId.trim().length > 0 && password.trim().length > 0;
  }, [isSubmitting, loginId, password]);

  const resetFailedLoginAttempt = () => {
    authSession.clearSession();
    setSignedOut();
  };

  const handleChangeLoginId = (value: string) => {
    setLoginId(value);

    if (loginError) {
      setLoginError(null);
    }
  };

  const handleChangePassword = (value: string) => {
    setPassword(value);

    if (loginError) {
      setLoginError(null);
    }
  };

  const handleSubmit: FormSubmitHandler = async event => {
    event.preventDefault();

    if (!isLoginEnabled) {
      return;
    }

    try {
      setIsSubmitting(true);
      setLoginError(null);

      const response = await adminAuthApi.login({
        loginId: loginId.trim(),
        password: password.trim(),
      });

      const accessToken = response.data?.accessToken;
      const refreshToken = response.data?.refreshToken;

      if (!response.success || !accessToken || !refreshToken) {
        resetFailedLoginAttempt();

        setLoginError({
          title: response.message || DEFAULT_LOGIN_ERROR.title,
          description: DEFAULT_LOGIN_ERROR.description,
        });
        return;
      }

      const me = await getMeWithRetry(accessToken);

      if (me.role !== 'admin') {
        resetFailedLoginAttempt();

        setLoginError({
          title: '관리자 계정만 로그인할 수 있어요',
          description: '교사 계정은 카카오 로그인을 이용해 주세요.',
        });
        return;
      }

      authSession.setTokens({
        accessToken,
        refreshToken,
      });
      authSession.setAuthStatus('SIGNED_IN');

      setSignedIn({
        role: me.role,
        user: me.user,
      });

      navigate(ROUTES.adminDashboard, { replace: true });
    } catch (error) {
      resetFailedLoginAttempt();

      if (error instanceof AxiosError && error.response?.status === 401) {
        setLoginError(DEFAULT_LOGIN_ERROR);
        return;
      }

      if (error instanceof InvalidAuthenticatedUserResponseError) {
        setLoginError({
          title: '관리자 정보를 확인할 수 없어요',
          description: '잠시 후 다시 시도해 주세요.',
        });
        return;
      }

      setLoginError(getAuthErrorMessage(error, DEFAULT_LOGIN_ERROR));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    loginId,
    password,
    isSubmitting,
    loginError,
    isLoginEnabled,
    handleChangeLoginId,
    handleChangePassword,
    handleSubmit,
  };
};
