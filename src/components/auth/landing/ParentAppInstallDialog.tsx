import styled from '@emotion/styled';
import { Dialog } from '@/components/common/Dialog';
import { DialogHeader } from '@/components/common/DialogHeader';
import { DialogFooter } from '@/components/common/DialogFooter';
import { InlineButton } from '@/components/common/InlineButton';
import { IcDownload } from '@/icons';
import { ImgParentAppQR } from '@/images';
import { useTheme } from '@emotion/react';

type ParentAppInstallDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenDistributionPage?: () => void;
};

export const ParentAppInstallDialog = ({
  isOpen,
  onClose,
  onOpenDistributionPage,
}: ParentAppInstallDialogProps) => {
  const theme = useTheme();

  const handleClickDistributionPage = () => {
    if (!onOpenDistributionPage) {
      return;
    }

    onOpenDistributionPage();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth={720}>
      <DialogHeader
        icon={IcDownload}
        title="학부모 앱 설치"
        description={
          <>
            아래 QR을 스캔하면 학부모 앱 내부 배포 페이지로 이동할 수 있어요.
            <br />
            배포 페이지에서 APK를 다운로드해 설치를 진행해주세요.
          </>
        }
        iconBgColor={theme.colors.background.bg4}
        iconColor={theme.colors.brand.primary}
      />

      <BodySection>
        <QrCard>
          <QrImage src={ImgParentAppQR} alt="학부모 앱 내부 배포 QR 코드" />

          <QrGuideText>
            안드로이드 기기에서 QR을 스캔한 뒤
            <br />
            내부 배포 페이지에서 APK를 다운로드해주세요.
          </QrGuideText>
        </QrCard>

        <GuideCard>
          <GuideTitle>설치 전 안내</GuideTitle>
          <GuideList>
            <GuideItem>QR은 학부모 앱 내부 배포 페이지로 연결돼요.</GuideItem>
            <GuideItem>배포 페이지에서 APK 파일을 다운로드할 수 있어요.</GuideItem>
            <GuideItem>설치 과정에서 출처를 확인하는 안내가 표시될 수 있어요.</GuideItem>
          </GuideList>
        </GuideCard>
      </BodySection>

      <DialogFooter>
        <InlineButton variant="ghost" size="L" label="닫기" onClick={onClose} />
        <InlineButton
          variant="primary"
          size="L"
          label="배포 페이지 열기"
          onClick={handleClickDistributionPage}
        />
      </DialogFooter>
    </Dialog>
  );
};

const BodySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const QrCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.background.bg2};
  padding: 28px 24px;
`;

const QrImage = styled.img`
  display: block;
  width: 220px;
  max-width: 100%;
  height: auto;
  object-fit: contain;
`;

const QrGuideText = styled.p`
  text-align: center;
  word-break: keep-all;
  ${({ theme }) => theme.fonts.body2};
  color: ${({ theme }) => theme.colors.text.text2};
`;

const GuideCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.background.bg1};
  padding: 24px;
`;

const GuideTitle = styled.h3`
  ${({ theme }) => theme.fonts.labelXS};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const GuideList = styled.ul`
  margin: 16px 0 0;
  padding-left: 20px;
`;

const GuideItem = styled.li`
  ${({ theme }) => theme.fonts.caption};
  color: ${({ theme }) => theme.colors.text.text3};

  & + & {
    margin-top: 10px;
  }
`;
