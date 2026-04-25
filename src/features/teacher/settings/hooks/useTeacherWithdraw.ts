import { AxiosError } from 'axios';
import { useState } from 'react';
import { useLogout } from '@/hooks/useLogout';
import { userAuthApi } from '@/services/auth';

export const useTeacherWithdraw = () => {
  const { logout } = useLogout();
  const handleLogout = () => logout();

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawErrorMessage, setWithdrawErrorMessage] = useState('');

  const handleOpenWithdrawModal = () => {
    setWithdrawErrorMessage('');
    setIsWithdrawModalOpen(true);
  };

  const handleCloseWithdrawModal = () => {
    if (isWithdrawing) {
      return;
    }

    setWithdrawErrorMessage('');
    setIsWithdrawModalOpen(false);
  };

  const handleConfirmWithdraw = async () => {
    try {
      setIsWithdrawing(true);
      setWithdrawErrorMessage('');

      const response = await userAuthApi.deleteMe();

      if (!response.success) {
        setWithdrawErrorMessage(
          response.message || '회원 탈퇴에 실패했어요. 잠시 후 다시 시도해 주세요.'
        );
        return;
      }

      logout();
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message || '회원 탈퇴에 실패했어요. 잠시 후 다시 시도해 주세요.';

      setWithdrawErrorMessage(message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return {
    isWithdrawModalOpen,
    isWithdrawing,
    withdrawErrorMessage,
    handleOpenWithdrawModal,
    handleCloseWithdrawModal,
    handleConfirmWithdraw,
    handleLogout,
  };
};
