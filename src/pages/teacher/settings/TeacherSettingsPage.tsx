import styled from '@emotion/styled';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { Dialog } from '@/components/common/Dialog';
import { useLogout } from '@/hooks/useLogout';
import { IcInfo } from '@/icons';
import { userAuthApi } from '@/services/auth';

export const TeacherSettingsPage = () => {
  const { logout } = useLogout();
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

  return (
    <TeacherSettingsPageContainer>
      <SettingsSectionCard>
        <SectionTitle>계정 관리</SectionTitle>
        <ActionList>
          <ActionButton type="button" onClick={() => logout()}>
            로그아웃
          </ActionButton>
          <ActionButton type="button" onClick={handleOpenWithdrawModal}>
            회원 탈퇴
          </ActionButton>
        </ActionList>
      </SettingsSectionCard>

      <Dialog isOpen={isWithdrawModalOpen} onClose={handleCloseWithdrawModal}>
        <WithdrawModalBody>
          <WithdrawIconWrap>
            <IcInfo />
          </WithdrawIconWrap>
          <WithdrawTitle>정말 탈퇴하시겠어요?</WithdrawTitle>
          <WithdrawDescription>
            탈퇴하면 학급 정보와 대화 내역이 모두 삭제되고,
            <br />
            다시 복구할 수 없어요.
          </WithdrawDescription>

          {withdrawErrorMessage ? (
            <WithdrawErrorText>{withdrawErrorMessage}</WithdrawErrorText>
          ) : null}

          <WithdrawButtonRow>
            <CancelButton type="button" onClick={handleCloseWithdrawModal} disabled={isWithdrawing}>
              취소
            </CancelButton>
            <DangerButton type="button" onClick={handleConfirmWithdraw} disabled={isWithdrawing}>
              {isWithdrawing ? '탈퇴 중...' : '탈퇴하기'}
            </DangerButton>
          </WithdrawButtonRow>
        </WithdrawModalBody>
      </Dialog>
    </TeacherSettingsPageContainer>
  );
};

const TeacherSettingsPageContainer = styled.div`
  min-height: calc(100vh - 72px);
  background: ${({ theme }) => theme.colors.background.bg2};
  padding: 24px;
`;

const SettingsSectionCard = styled.section`
  max-width: 820px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  background: ${({ theme }) => theme.colors.background.bg1};
  padding: 20px;
`;

const SectionTitle = styled.h2`
  ${({ theme }) => theme.fonts.labelM};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const ActionList = styled.div`
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ActionButton = styled.button`
  ${({ theme }) => theme.fonts.body2};
  width: fit-content;
  color: ${({ theme }) => theme.colors.text.text2};
  padding: 6px 0;
`;

const WithdrawModalBody = styled.div`
  width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
`;

const WithdrawIconWrap = styled.span`
  width: 58px;
  height: 58px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff2f4;
  color: ${({ theme }) => theme.colors.semantic.error};

  svg {
    width: 28px;
    height: 28px;
  }
`;

const WithdrawTitle = styled.h3`
  ${({ theme }) => theme.fonts.labelM};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const WithdrawDescription = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text2};
  line-height: 1.6;
`;

const WithdrawErrorText = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 0;
  color: ${({ theme }) => theme.colors.semantic.error};
`;

const WithdrawButtonRow = styled.div`
  margin-top: 8px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const CancelButton = styled.button`
  ${({ theme }) => theme.fonts.labelS};
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  background: ${({ theme }) => theme.colors.background.bg1};
  color: ${({ theme }) => theme.colors.text.text2};
  padding: 11px 0;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DangerButton = styled.button`
  ${({ theme }) => theme.fonts.labelS};
  border-radius: 10px;
  border: none;
  background: ${({ theme }) => theme.colors.semantic.error};
  color: ${({ theme }) => theme.colors.text.textW};
  padding: 11px 0;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
