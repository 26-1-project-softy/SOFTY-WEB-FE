import styled from '@emotion/styled';
import { SectionCard, SectionCardContent } from '@/components/common/SectionCard';
import { InlineButton } from '@/components/common/InlineButton';
import { IcCopy } from '@/icons';

type ClassManagementCardProps = {
  schoolName?: string;
  grade?: number;
  classNumber?: number;
  classCode?: string;
  onOpenClassChangeModal: () => void;
  onCopyClassCode: () => void;
};

export const ClassManagementCard = ({
  schoolName,
  grade,
  classNumber,
  classCode,
  onOpenClassChangeModal,
  onCopyClassCode,
}: ClassManagementCardProps) => {
  const schoolNameText = schoolName?.trim() ? schoolName : '-';
  const classText = grade != null && classNumber != null ? `${grade}학년 ${classNumber}반` : '-';
  const classCodeText = classCode?.trim() ? classCode : '-';

  return (
    <SectionCard
      title="학급 관리"
      headerAction={
        <InlineButton
          type="button"
          variant="primary"
          size="M"
          label="학급 변경하기"
          onClick={onOpenClassChangeModal}
        />
      }
    >
      <SectionCardContent>
        <ClassManagementContent>
          <ClassInfoGrid>
            <InfoLabel>학교명</InfoLabel>
            <InfoValue>{schoolNameText}</InfoValue>
            <InfoLabel>학급</InfoLabel>
            <InfoValue>{classText}</InfoValue>
          </ClassInfoGrid>

          <Divider />

          <ClassCodeWrap>
            <InfoLabel>학급 코드</InfoLabel>
            <ClassCodeActions>
              <ClassCodeBadge>{classCodeText}</ClassCodeBadge>
              <InlineButton
                variant="ghost"
                size="L"
                icon={IcCopy}
                label="학급코드 복사하기"
                onClick={onCopyClassCode}
              />
            </ClassCodeActions>
          </ClassCodeWrap>
        </ClassManagementContent>
      </SectionCardContent>
    </SectionCard>
  );
};

const ClassManagementContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ClassInfoGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  row-gap: 16px;
  column-gap: 10px;
`;

const InfoLabel = styled.p`
  ${({ theme }) => theme.fonts.labelXS};
  color: ${({ theme }) => theme.colors.text.text2};
`;

const InfoValue = styled.p`
  ${({ theme }) => theme.fonts.body2};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const Divider = styled.hr`
  width: 100%;
  border-top: 1px solid ${({ theme }) => theme.colors.divider.divider2};
`;

const ClassCodeWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ClassCodeActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ClassCodeBadge = styled.span`
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ theme }) => theme.colors.text.text1};
  background: ${({ theme }) => theme.colors.background.bg4};
  border-radius: 12px;
  padding: 10px 18px;
`;
