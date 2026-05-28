import styled from '@emotion/styled';
import { SectionCard } from '@/components/common/SectionCard';

type AccountManagementCardProps = {
  disabled: boolean;
  onLogout: () => void;
  onWithdraw: () => void;
};

export const AccountManagementCard = ({
  disabled,
  onLogout,
  onWithdraw,
}: AccountManagementCardProps) => {
  return (
    <SectionCard title="계정 관리">
      <AccountActionButtonList>
        <AccountActionButton
          type="button"
          disabled={disabled}
          onClick={onLogout}
          aria-label="로그아웃"
        >
          <AccountActionLabel>로그아웃</AccountActionLabel>
        </AccountActionButton>

        <AccountActionButton
          type="button"
          disabled={disabled}
          onClick={onWithdraw}
          aria-label="회원 탈퇴"
        >
          <AccountActionLabel $isDestructive>회원 탈퇴</AccountActionLabel>
        </AccountActionButton>
      </AccountActionButtonList>
    </SectionCard>
  );
};

const AccountActionButtonList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 0;
`;

const AccountActionButton = styled.button`
  width: 100%;
  padding: 8px 20px;
  text-align: left;
  background: ${({ theme }) => theme.colors.background.bg1};
  transition:
    background-color 0.15s ease,
    opacity 0.15s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.background.bg3};
  }

  &:active:not(:disabled) {
    opacity: 0.7;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const AccountActionLabel = styled.span<{ $isDestructive?: boolean }>`
  ${({ theme }) => theme.fonts.body2};
  color: ${({ $isDestructive, theme }) =>
    $isDestructive ? theme.colors.semantic.error : theme.colors.text.text1};
`;
