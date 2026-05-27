import styled from '@emotion/styled';
import { Loader } from '@/components/common/Loader';
import { SectionEmptyState } from '@/components/common/SectionEmptyState';
import { SectionErrorState } from '@/components/common/SectionErrorState';
import {
  getInquiryIntentByType,
  INQUIRY_INTENT_COLOR_KEY,
  INQUIRY_INTENT_LABEL,
  type InquiryIntentType,
} from '@/constants/inquiryIntent';
import { formatMessagePreviewDateTime } from '@/utils/formatDateTime';
import { formatUserDisplayNameWithSuffix } from '@/utils/formatUserDisplayName';
import { IcChat } from '@/icons';
import type { useTeacherReports } from '@/features/teacher/reports/hooks/useTeacherReports';

type TeacherReportsState = ReturnType<typeof useTeacherReports>;

type ReportRoomListSectionProps = {
  reportItems: TeacherReportsState['reportItems'];
  selectedReportId: TeacherReportsState['selectedReportId'];
  isLoading: TeacherReportsState['isLoading'];
  hasListError: TeacherReportsState['hasListError'];
  hasNoData: TeacherReportsState['hasNoData'];
  listErrorDisplayMessage: TeacherReportsState['listErrorDisplayMessage'];
  onRetryReportRooms: () => void;
  onSelectReport: TeacherReportsState['handleSelectReport'];
};

export const ReportRoomListSection = ({
  reportItems,
  selectedReportId,
  isLoading,
  hasListError,
  hasNoData,
  listErrorDisplayMessage,
  onRetryReportRooms,
  onSelectReport,
}: ReportRoomListSectionProps) => {
  if (isLoading) {
    return (
      <ReportListSection>
        <Loader />
      </ReportListSection>
    );
  }

  if (hasListError) {
    return (
      <ReportListSection>
        <SectionErrorState
          title="채팅방 목록을 불러오지 못했어요"
          description={listErrorDisplayMessage}
          onRetry={onRetryReportRooms}
        />
      </ReportListSection>
    );
  }

  if (hasNoData) {
    return (
      <ReportListSection>
        <SectionEmptyState
          icon={IcChat}
          title="아직 데이터가 없어요"
          description={`학부모님과의 대화가 시작되면 이곳에서 채팅방을 선택해\n리포트를 생성할 수 있어요.`}
        />
      </ReportListSection>
    );
  }

  return (
    <ReportListSection>
      <ReportList>
        {reportItems.map(item => {
          const intentType = getInquiryIntentByType(item.intentType);
          const parentDisplayName = formatUserDisplayNameWithSuffix({
            name: item.parentName,
            suffix: '학부모님',
          });
          const studentDisplayName = formatUserDisplayNameWithSuffix({
            name: item.studentName,
            suffix: '학생',
          });

          return (
            <ReportListItem
              key={item.chatRoomId}
              $isSelected={item.chatRoomId === selectedReportId}
              onClick={() => onSelectReport(item.chatRoomId)}
            >
              <ReportItemTopRow>
                <ReportTitleArea>
                  <ParentName>{parentDisplayName}</ParentName>
                  <StudentName>{studentDisplayName}</StudentName>
                </ReportTitleArea>
                <LastMessageDate>
                  마지막 메시지: {formatMessagePreviewDateTime(item.lastMessageAt)}
                </LastMessageDate>
              </ReportItemTopRow>

              <IntentBadge $intentType={intentType}>{INQUIRY_INTENT_LABEL[intentType]}</IntentBadge>
            </ReportListItem>
          );
        })}
      </ReportList>
    </ReportListSection>
  );
};

const ReportListSection = styled.section`
  width: 52%;
  min-width: 0;
  padding: 20px 16px;
  background: ${({ theme }) => theme.colors.background.bg1};

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ReportList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ReportListItem = styled.button<{ $isSelected: boolean }>`
  width: 100%;
  padding: 12px 20px;
  border-radius: 16px;
  background: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.background.bg4 : theme.colors.background.bg1};
  text-align: left;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $isSelected, theme }) =>
      $isSelected ? theme.colors.background.bg4 : theme.colors.background.bg3};
  }
`;

const ReportItemTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
`;

const ReportTitleArea = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`;

const ParentName = styled.span`
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const StudentName = styled.span`
  ${({ theme }) => theme.fonts.body2};
  color: ${({ theme }) => theme.colors.text.text4};
`;

const LastMessageDate = styled.span`
  ${({ theme }) => theme.fonts.caption};
  color: ${({ theme }) => theme.colors.text.text4};
`;

const IntentBadge = styled.span<{ $intentType: InquiryIntentType }>`
  ${({ theme }) => theme.fonts.labelXS};
  display: inline-flex;
  margin-top: 8px;
  padding: 4px 10px;
  border-radius: 999px;

  ${({ $intentType, theme }) => {
    const colorKey = INQUIRY_INTENT_COLOR_KEY[$intentType];
    const color = theme.colors.intent[colorKey];

    return `
      border: 1px solid ${color.border};
      background: ${color.background};
      color: ${color.text};
    `;
  }}
`;
