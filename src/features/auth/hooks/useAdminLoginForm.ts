import { useMemo, useState, type ComponentProps } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getAuthErrorMessage } from '@/features/auth/lib/getAuthErrorMessage';
import { adminAuthApi, authApi, authSession } from '@/services/auth';
import { useToastStore } from '@/stores/toastStore';
import { ROUTES } from '@/constants/routes';

type LoginErrorState = {
  title: string;
  description: string;
} | null;

const DEFAULT_LOGIN_ERROR: LoginErrorState = {
  title: '아이디 또는 비밀번호가 올바르지 않아요',
  description: '입력한 정보를 다시 확인해 주세요.',
};

type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>;

export const useAdminLoginForm = () => {
  const navigate = useNavigate();
  const { setSignedIn, setSignedOut } = useAuth();
  const showToast = useToastStore(state => state.showToast);

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<LoginErrorState>(null);

  const isLoginEnabled = useMemo(() => {
    return !isSubmitting && loginId.trim().length > 0 && password.trim().length > 0;
  }, [isSubmitting, loginId, password]);

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

      if (!response.success || !response.data?.accessToken || !response.data?.refreshToken) {
        authSession.clearSession();
        setSignedOut();

        const message = response.message || DEFAULT_LOGIN_ERROR.title;

        setLoginError({
          title: message,
          description: DEFAULT_LOGIN_ERROR.description,
        });
        showToast(message, 'error');
        return;
      }

      authSession.setTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      });

      const me = await authApi.getMe();

      if (me.role !== 'admin') {
        authSession.clearSession();
        setSignedOut();

        const message = '관리자 계정만 로그인할 수 있어요.';

        setLoginError({
          title: message,
          description: DEFAULT_LOGIN_ERROR.description,
        });
        showToast(message, 'error');
        return;
      }

      authSession.setAuthStatus('SIGNED_IN');
      setSignedIn({
        role: me.role,
        user: me.user,
      });

      navigate(ROUTES.adminDashboard, { replace: true });
    } catch (error) {
      const message = getAuthErrorMessage(error, DEFAULT_LOGIN_ERROR.title);

      authSession.clearSession();
      setSignedOut();

      setLoginError({
        title: message,
        description: DEFAULT_LOGIN_ERROR.description,
      });
      showToast(message, 'error');
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
