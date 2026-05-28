import styled from '@emotion/styled';
import { SectionCard, SectionCardContent } from '@/components/common/SectionCard';
import { InlineButton } from '@/components/common/InlineButton';
import { TextField } from '@/components/common/TextField';
import { TIME_PLACEHOLDER, type Workday, type WorkdayKey } from '@/features/teacher/settings/types';
import { ToggleSwitch } from '@/components/teacher/settings/ToggleSwitch';

type WorkHoursSettingCardProps = {
  workdays: Workday[];
  isLoading: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  onReset: () => void;
  onSave: () => void;
  onToggleWorkday: (targetKey: WorkdayKey) => void;
  onChangeWorkdayTime: (targetKey: WorkdayKey, field: 'start' | 'end', value: string) => void;
};

export const WorkHoursSettingCard = ({
  workdays,
  isLoading,
  isSaving,
  hasChanges,
  onReset,
  onSave,
  onToggleWorkday,
  onChangeWorkdayTime,
}: WorkHoursSettingCardProps) => {
  const isActionDisabled = isLoading || isSaving || !hasChanges;

  return (
    <SectionCard
      title="근무시간 설정"
      description="학부모님들이 메시지를 보낼 때 참고할 수 있는 시간이에요. 근무 시간 외에는 확인이 늦어질 수 있다는 안내를 해드려요."
      headerAction={
        <>
          <InlineButton
            variant="ghost"
            size="M"
            label="취소"
            disabled={isActionDisabled}
            onClick={onReset}
          />
          <InlineButton
            variant="primary"
            size="M"
            label={isSaving ? '저장 중...' : '변경사항 저장'}
            disabled={isActionDisabled}
            onClick={onSave}
          />
        </>
      }
    >
      <SectionCardContent>
        <WorkdayList>
          {workdays.map(day => (
            <WorkdayItem key={day.key}>
              <WorkdayArea>
                <ToggleSwitch
                  checked={day.enabled}
                  ariaLabel={`${day.label}요일 근무시간 사용`}
                  disabled={isLoading || isSaving}
                  onToggle={() => onToggleWorkday(day.key)}
                />

                <DayLabel>{day.label}</DayLabel>
              </WorkdayArea>

              <WorkTimeRange>
                <TimeField
                  type="text"
                  value={day.start}
                  placeholder={TIME_PLACEHOLDER}
                  inputMode="numeric"
                  maxLength={5}
                  disabled={!day.enabled}
                  aria-label={`${day.label}요일 시작 시간`}
                  onChange={event => onChangeWorkdayTime(day.key, 'start', event.target.value)}
                />
                <RangeSeparator>~</RangeSeparator>
                <TimeField
                  type="text"
                  value={day.end}
                  placeholder={TIME_PLACEHOLDER}
                  inputMode="numeric"
                  maxLength={5}
                  disabled={!day.enabled}
                  aria-label={`${day.label}요일 종료 시간`}
                  onChange={event => onChangeWorkdayTime(day.key, 'end', event.target.value)}
                />
              </WorkTimeRange>
            </WorkdayItem>
          ))}
        </WorkdayList>
      </SectionCardContent>
    </SectionCard>
  );
};

const WorkdayList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const WorkdayItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  padding: 12px 14px;
  gap: 14px;
`;

const WorkdayArea = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const DayLabel = styled.span`
  ${({ theme }) => theme.fonts.labelXS};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const WorkTimeRange = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TimeField = styled(TextField)`
  width: 100%;
  max-width: 180px;

  &:disabled {
    background: ${({ theme }) => theme.colors.background.bg3};
    color: ${({ theme }) => theme.colors.text.text4};
  }
`;

const RangeSeparator = styled.span`
  ${({ theme }) => theme.fonts.body2};
  color: ${({ theme }) => theme.colors.text.text2};
`;
