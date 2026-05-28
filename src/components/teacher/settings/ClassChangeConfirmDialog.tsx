import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { Dialog } from '@/components/common/Dialog';
import { DialogHeader } from '@/components/common/DialogHeader';
import { DialogFooter } from '@/components/common/DialogFooter';
import { InlineButton } from '@/components/common/InlineButton';
import { Alert } from '@/components/common/Alert';
import { IcInfo } from '@/icons';

type ClassChangeConfirmDialogProps = {
  isOpen: boolean;
  schoolName: string;
  classSummary: string;
  errorMessage: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const ClassChangeConfirmDialog = ({
  isOpen,
  schoolName,
  classSummary,
  errorMessage,
  isSubmitting,
  onClose,
  onConfirm,
}: ClassChangeConfirmDialogProps) => {
  const theme = useTheme();

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader
        icon={IcInfo}
        title="학급을 변경할까요?"
        description="학급을 변경하면 새로운 학급 코드가 발급돼요. 기존 학급 코드는 더 이상 사용할 수 없어요."
        iconBgColor={theme.colors.semantic.warningSoft}
        iconColor={theme.colors.semantic.warning}
      />

      <ConfirmSummaryBox>
        <ConfirmSummaryRow>
          <ConfirmSummaryLabel>학교명</ConfirmSummaryLabel>
          <ConfirmSummaryValue>{schoolName || '-'}</ConfirmSummaryValue>
        </ConfirmSummaryRow>
        <ConfirmSummaryRow>
          <ConfirmSummaryLabel>학급</ConfirmSummaryLabel>
          <ConfirmSummaryValue>{classSummary}</ConfirmSummaryValue>
        </ConfirmSummaryRow>
      </ConfirmSummaryBox>

      {errorMessage ? (
        <Alert title={errorMessage} description="잠시 후 다시 시도해주세요." variant="error" />
      ) : null}

      <DialogFooter>
        <InlineButton
          variant="ghost"
          size="L"
          label="취소"
          width="100%"
          disabled={isSubmitting}
          onClick={onClose}
        />
        <InlineButton
          variant="primary"
          size="L"
          label={isSubmitting ? '변경 중...' : '변경하기'}
          width="100%"
          disabled={isSubmitting}
          onClick={onConfirm}
        />
      </DialogFooter>
    </Dialog>
  );
};

const ConfirmSummaryBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.brand.primary};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.background.bg4};
`;

const ConfirmSummaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const ConfirmSummaryLabel = styled.span`
  ${({ theme }) => theme.fonts.labelXS};
  color: ${({ theme }) => theme.colors.brand.dark};
`;

const ConfirmSummaryValue = styled.span`
  ${({ theme }) => theme.fonts.labelXS};
  color: ${({ theme }) => theme.colors.text.text1};
`;
