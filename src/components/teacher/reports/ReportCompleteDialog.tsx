import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Dialog } from '@/components/common/Dialog';
import { DialogHeader } from '@/components/common/DialogHeader';
import { DialogFooter } from '@/components/common/DialogFooter';
import { InlineButton } from '@/components/common/InlineButton';
import { Alert } from '@/components/common/Alert';
import { IcDownload, IcFile } from '@/icons';

type ReportCompleteDialogProps = {
  isOpen: boolean;
  reportFileName: string;
  isDownloadingPdf: boolean;
  isPdfDownloadErrorVisible: boolean;
  onClose: () => void;
  onDownload: () => void;
};

export const ReportCompleteDialog = ({
  isOpen,
  reportFileName,
  isDownloadingPdf,
  isPdfDownloadErrorVisible,
  onClose,
  onDownload,
}: ReportCompleteDialogProps) => {
  const theme = useTheme();

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader
        icon={IcFile}
        title="리포트 생성 완료"
        description="PDF 파일이 준비되었어요."
        iconBgColor={theme.colors.background.bg4}
        iconColor={theme.colors.brand.dark}
      />

      <FileInfoCard>
        <FileInfoLabel>파일명</FileInfoLabel>
        <FileInfoValue>{reportFileName}</FileInfoValue>
      </FileInfoCard>

      <ReportDialogActionArea>
        {isPdfDownloadErrorVisible ? (
          <Alert title="PDF 다운로드에 실패했어요" description="잠시 후 다시 시도해 주세요" />
        ) : null}

        <DialogFooter>
          <InlineButton variant="ghost" size="L" label="닫기" width="100%" onClick={onClose} />
          <InlineButton
            variant="primary"
            size="L"
            icon={IcDownload}
            label={isDownloadingPdf ? '다운로드 중...' : '다운로드'}
            width="100%"
            disabled={isDownloadingPdf}
            onClick={onDownload}
          />
        </DialogFooter>
      </ReportDialogActionArea>
    </Dialog>
  );
};

const FileInfoCard = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background.bg3};
  border-radius: 10px;
  padding: 16px 20px;
  gap: 4px;
`;

const FileInfoLabel = styled.p`
  ${({ theme }) => theme.fonts.caption};
  color: ${({ theme }) => theme.colors.text.text4};
`;

const FileInfoValue = styled.p`
  ${({ theme }) => theme.fonts.body2};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const ReportDialogActionArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
