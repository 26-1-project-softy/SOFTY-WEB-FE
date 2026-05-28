import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { Dialog } from '@/components/common/Dialog';
import { DialogHeader } from '@/components/common/DialogHeader';
import { InlineButton } from '@/components/common/InlineButton';
import { IcCheck, IcCopy } from '@/icons';

type ClassChangeSuccessDialogProps = {
  isOpen: boolean;
  schoolName: string;
  classSummary: string;
  classCode: string;
  onClose: () => void;
  onCopyClassCode: () => void;
};

export const ClassChangeSuccessDialog = ({
  isOpen,
  schoolName,
  classSummary,
  classCode,
  onClose,
  onCopyClassCode,
}: ClassChangeSuccessDialogProps) => {
  const theme = useTheme();

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader
        icon={IcCheck}
        title="학급이 변경되었어요"
        description={
          <>
            새로운 학급 코드가 발급되었어요.
            <br />
            학부모님께 새 코드를 전달해주세요.
          </>
        }
        iconBgColor={theme.colors.background.bg4}
        iconColor={theme.colors.brand.dark}
      />

      <SuccessCodeCard>
        <SuccessCodeMeta>
          {schoolName || '-'} {classSummary}
        </SuccessCodeMeta>
        <SuccessCodeValue>{classCode || '-'}</SuccessCodeValue>
      </SuccessCodeCard>

      <SuccessActionArea>
        <InlineButton
          variant="ghost"
          size="L"
          icon={IcCopy}
          label="학급코드 복사하기"
          width="100%"
          onClick={onCopyClassCode}
        />
        <InlineButton variant="primary" size="L" label="확인" width="100%" onClick={onClose} />
      </SuccessActionArea>
    </Dialog>
  );
};

const SuccessCodeCard = styled.div`
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.background.bg4};
  text-align: center;
`;

const SuccessCodeMeta = styled.p`
  ${({ theme }) => theme.fonts.caption};
  color: ${({ theme }) => theme.colors.brand.dark};
`;

const SuccessCodeValue = styled.p`
  ${({ theme }) => theme.fonts.labelL};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const SuccessActionArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
