import styled from '@emotion/styled';
import { SectionCard, SectionCardContent } from '@/components/common/SectionCard';
import { Alert } from '@/components/common/Alert';
import { Loader } from '@/components/common/Loader';
import { SectionEmptyState } from '@/components/common/SectionEmptyState';
import { InlineButton } from '@/components/common/InlineButton';
import { TrainingHistoryChart } from '@/components/admin/aiModel/TrainingHistoryChart';
import { useTrainingHistory } from '@/features/admin/aiModel/hooks/useTrainingHistory';
import { formatDateTime } from '@/utils/formatDateTime';
import { IcDashboard } from '@/icons';

export const ModelTrainingHistorySection = () => {
  const {
    trainingHistory,
    trainingHistoryList,
    page,
    totalPages,
    isLoading,
    isError,
    errorMessage,
    hasPrevPage,
    hasNextPage,
    handleClickPrevPage,
    handleClickNextPage,
  } = useTrainingHistory();

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <SectionCard title="학습 이력">
        <SectionCardContent>
          <Alert
            title="학습 이력을 불러오지 못했어요"
            description={errorMessage || '잠시 후 다시 시도해주세요.'}
          />
        </SectionCardContent>
      </SectionCard>
    );
  }

  if (!trainingHistory || trainingHistoryList.length === 0) {
    return (
      <SectionCard title="학습 이력">
        <SectionCardContent>
          <SectionEmptyState
            icon={IcDashboard}
            title="학습 이력이 없어요"
            description="모델 학습이 완료되면 이력이 표시돼요."
          />
        </SectionCardContent>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="학습 이력">
      <SectionCardContent>
        <TrainingHistoryContainer>
          <ChartSection>
            <ChartTitle>F1-score 추이</ChartTitle>
            <TrainingHistoryChart data={trainingHistoryList} />
          </ChartSection>

          <TableWrapper>
            <HistoryTable>
              <thead>
                <tr>
                  <TableHeader>학습 일시</TableHeader>
                  <TableHeader>버전</TableHeader>
                  <TableHeader>데이터셋</TableHeader>
                  <TableHeader>F1-score</TableHeader>
                  <TableHeader>상태</TableHeader>
                </tr>
              </thead>

              <tbody>
                {trainingHistoryList.map(item => (
                  <tr key={`${item.version}-${item.trainedAt}`}>
                    <TableCell>{formatDateTime(item.trainedAt)}</TableCell>
                    <TableCell>{item.version || '-'}</TableCell>
                    <TableCell>{item.datasetVersion || '-'}</TableCell>
                    <TableCell>{item.f1Score.toFixed(2)}</TableCell>
                    <TableCell>{item.status || '-'}</TableCell>
                  </tr>
                ))}
              </tbody>
            </HistoryTable>
          </TableWrapper>

          {totalPages > 1 && (
            <PaginationArea>
              <InlineButton
                variant="ghost"
                size="M"
                label="이전"
                onClick={handleClickPrevPage}
                disabled={!hasPrevPage}
              />
              <PageText>
                {page} / {totalPages}
              </PageText>
              <InlineButton
                variant="ghost"
                size="M"
                label="다음"
                onClick={handleClickNextPage}
                disabled={!hasNextPage}
              />
            </PaginationArea>
          )}
        </TrainingHistoryContainer>
      </SectionCardContent>
    </SectionCard>
  );
};

const TrainingHistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ChartSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ChartTitle = styled.h3`
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const HistoryTable = styled.table`
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  padding: 14px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.border1};
  text-align: left;
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const TableCell = styled.td`
  padding: 14px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.border1};
  ${({ theme }) => theme.fonts.body2};
  color: ${({ theme }) => theme.colors.text.text2};
`;

const PaginationArea = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
`;

const PageText = styled.span`
  ${({ theme }) => theme.fonts.body2};
  color: ${({ theme }) => theme.colors.text.text3};
`;
