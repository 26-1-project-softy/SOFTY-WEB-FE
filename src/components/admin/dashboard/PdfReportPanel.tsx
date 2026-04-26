import styled from '@emotion/styled';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Loader } from '@/components/common/Loader';
import { SectionErrorState } from '@/components/common/SectionErrorState';
import { SectionEmptyState } from '@/components/common/SectionEmptyState';
import { KpiCard } from '@/components/common/KpiCard';
import { SectionCard } from '@/components/common/SectionCard';
import { getPdfChartData } from '@/features/admin/dashboard/lib/dashboardChartData';
import type { PdfStatistics } from '@/features/admin/dashboard/types/dashboard';
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { chartColors } from '@/constants/chartColors';
import { IcDashboard } from '@/icons';

type PdfReportPanelProps = {
  data?: PdfStatistics;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

const PDF_CHART_ROW_HEIGHT = 48;
const PDF_CHART_MIN_HEIGHT = 120;
const PDF_CHART_MAX_HEIGHT = 480;

export const PdfReportPanel = ({ data, isLoading, isError, onRetry }: PdfReportPanelProps) => {
  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <SectionErrorState onRetry={onRetry} />;
  }

  if (!data) {
    return <SectionEmptyState icon={IcDashboard} />;
  }

  const sortedPdfList = [...data.list].sort((left, right) => right.pdfCount - left.pdfCount);
  const chartData = getPdfChartData(sortedPdfList);

  const calculatedChartHeight = Math.max(
    chartData.length * PDF_CHART_ROW_HEIGHT,
    PDF_CHART_MIN_HEIGHT
  );
  const chartHeight = Math.min(calculatedChartHeight, PDF_CHART_MAX_HEIGHT);
  const isChartScrollable = calculatedChartHeight > PDF_CHART_MAX_HEIGHT;

  return (
    <PdfReportPanelContainer>
      <KpiGrid>
        <KpiCard title="PDF 리포트 생성 수 합계" value={`${data.totalPdfCount}건`} />
      </KpiGrid>

      <PdfContentGrid>
        <SectionCard title="교사별 PDF 생성 수">
          <PdfChartScrollArea $height={chartHeight} $isScrollable={isChartScrollable}>
            <PdfChartInner $height={calculatedChartHeight}>
              <ResponsiveContainer width="100%" height={calculatedChartHeight}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 16, right: 20, left: 20, bottom: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="teacherName"
                    type="category"
                    width={68}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: ValueType | undefined) => [`${value}건`, 'PDF 생성 수']}
                  />
                  <Bar
                    dataKey="pdfCount"
                    barSize={24}
                    fill={chartColors.pdfReport.primary}
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </PdfChartInner>
          </PdfChartScrollArea>
        </SectionCard>

        <SectionCard title="교사별 상세 목록">
          <PdfTable>
            <thead>
              <tr>
                <PdfTableHeader>교사명</PdfTableHeader>
                <PdfTableHeader $align="right">PDF 생성 수</PdfTableHeader>
              </tr>
            </thead>
            <tbody>
              {sortedPdfList.map(item => (
                <tr key={item.teacherId}>
                  <PdfTableCell>{item.teacherName}</PdfTableCell>
                  <PdfTableCell $align="right">{item.pdfCount}</PdfTableCell>
                </tr>
              ))}
            </tbody>
          </PdfTable>
        </SectionCard>
      </PdfContentGrid>
    </PdfReportPanelContainer>
  );
};

const PdfReportPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;

  @media (max-width: 1140px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const PdfContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PdfChartScrollArea = styled.div<{ $height: number; $isScrollable: boolean }>`
  width: 100%;
  height: ${({ $height }) => `${$height}px`};
  overflow-x: hidden;
  overflow-y: ${({ $isScrollable }) => ($isScrollable ? 'auto' : 'hidden')};
`;

const PdfChartInner = styled.div<{ $height: number }>`
  width: 100%;
  height: ${({ $height }) => `${$height}px`};

  .recharts-wrapper *:focus {
    outline: none;
  }
`;

const PdfTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const PdfTableHeader = styled.th<{ $align?: 'left' | 'right' }>`
  ${({ theme }) => theme.fonts.labelS};
  padding: 12px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.border1};
  text-align: ${({ $align = 'left' }) => $align};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const PdfTableCell = styled.td<{ $align?: 'left' | 'right' }>`
  ${({ theme }) => theme.fonts.body3};
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.border1};
  text-align: ${({ $align = 'left' }) => $align};
  color: ${({ theme }) => theme.colors.text.text1};
`;
