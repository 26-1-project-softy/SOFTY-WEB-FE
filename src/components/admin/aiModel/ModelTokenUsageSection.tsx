import styled from '@emotion/styled';
import { SectionCard, SectionCardContent } from '@/components/common/SectionCard';
import { KpiCard } from '@/components/common/KpiCard';
import { Alert } from '@/components/common/Alert';
import { Loader } from '@/components/common/Loader';
import { SectionEmptyState } from '@/components/common/SectionEmptyState';
import { InfoFieldGrid } from '@/components/admin/aiModel/InfoFieldGrid';
import { useTokenUsage } from '@/features/admin/aiModel/hooks/useTokenUsage';
import { IcDashboard } from '@/icons';

const formatTokenCount = (value?: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '0';
  }

  return value.toLocaleString();
};

export const ModelTokenUsageSection = () => {
  const { tokenUsage, isLoading, isError, errorMessage } = useTokenUsage();

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <SectionCard title="LLM 토큰 사용량">
        <SectionCardContent>
          <Alert
            title="토큰 사용량을 불러오지 못했어요"
            description={errorMessage || '잠시 후 다시 시도해주세요.'}
          />
        </SectionCardContent>
      </SectionCard>
    );
  }

  if (!tokenUsage) {
    return (
      <SectionCard title="LLM 토큰 사용량">
        <SectionCardContent>
          <SectionEmptyState
            icon={IcDashboard}
            title="토큰 사용량 데이터가 없어요"
            description="토큰 사용량이 집계되면 표시돼요."
          />
        </SectionCardContent>
      </SectionCard>
    );
  }

  const tokenUsageKpis = [
    {
      title: '총 사용 토큰',
      value: formatTokenCount(tokenUsage.totalUsage.totalTokens),
    },
    {
      title: '입력 토큰',
      value: formatTokenCount(tokenUsage.totalUsage.inputTokens),
    },
    {
      title: '출력 토큰',
      value: formatTokenCount(tokenUsage.totalUsage.outputTokens),
    },
  ];

  return (
    <SectionCard title="LLM 토큰 사용량">
      <SectionCardContent>
        <TokenUsageContainer>
          <KpiGrid>
            {tokenUsageKpis.map(kpi => (
              <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} />
            ))}
          </KpiGrid>

          {tokenUsage.details.length > 0 && (
            <TokenUsageDetailList>
              {tokenUsage.details.map(detail => {
                const tokenUsageDetailFields = [
                  {
                    label: '입력 토큰',
                    value: formatTokenCount(detail.inputTokens),
                  },
                  {
                    label: '출력 토큰',
                    value: formatTokenCount(detail.outputTokens),
                  },
                  {
                    label: '총 토큰',
                    value: formatTokenCount(detail.totalTokens),
                  },
                ];

                return (
                  <TokenUsageDetailCard key={detail.modelName}>
                    <TokenUsageModelName>{detail.modelName || '-'}</TokenUsageModelName>
                    <InfoFieldGrid fields={tokenUsageDetailFields} />
                  </TokenUsageDetailCard>
                );
              })}
            </TokenUsageDetailList>
          )}
        </TokenUsageContainer>
      </SectionCardContent>
    </SectionCard>
  );
};

const TokenUsageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const TokenUsageDetailList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TokenUsageDetailCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border.border2};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.background.bg1};
`;

const TokenUsageModelName = styled.h3`
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ theme }) => theme.colors.text.text1};
`;
