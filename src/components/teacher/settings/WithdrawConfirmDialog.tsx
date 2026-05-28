import { useTheme } from '@emotion/react';
import { Dialog } from '@/components/common/Dialog';
import { DialogHeader } from '@/components/common/DialogHeader';
import { DialogFooter } from '@/components/common/DialogFooter';
import { InlineButton } from '@/components/common/InlineButton';
import { Alert } from '@/components/common/Alert';
import { IcError } from '@/icons';

type WithdrawConfirmDialogProps = {
  isOpen: boolean;
  isWithdrawing: boolean;
  errorMessage: string;
  onClose: () => void;
  onConfirm: () => void;
};

export const WithdrawConfirmDialog = ({
  isOpen,
  isWithdrawing,
  errorMessage,
  onClose,
  onConfirm,
}: WithdrawConfirmDialogProps) => {
  const theme = useTheme();

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader
        icon={IcError}
        title="정말 탈퇴하시겠어요?"
        description="탈퇴하면 학급 정보와 대화 내역이 모두 삭제되고, 다시 복구할 수 없어요."
        iconBgColor={theme.colors.semantic.errorSoft}
        iconColor={theme.colors.semantic.error}
      />

      {errorMessage ? <Alert title={errorMessage} variant="error" /> : null}

      <DialogFooter>
        <InlineButton
          variant="ghost"
          size="L"
          label="취소"
          width="100%"
          disabled={isWithdrawing}
          onClick={onClose}
        />
        <InlineButton
          variant="primary"
          size="L"
          label={isWithdrawing ? '탈퇴 중...' : '탈퇴하기'}
          bgColor={theme.colors.semantic.error}
          activeBgColor={theme.colors.semantic.errorPressed}
          width="100%"
          disabled={isWithdrawing}
          onClick={onConfirm}
        />
      </DialogFooter>
    </Dialog>
  );
};
