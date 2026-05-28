import { AxiosError } from 'axios';
import { useCallback, useMemo, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import type { TeacherSetting } from '@/services/teacher/teacherApi';
import {
  DAY_INFO,
  EMPTY_TIME,
  type Workday,
  type WorkdayKey,
} from '@/features/teacher/settings/types';
import { useChangeWorkHoursMutation } from '@/features/teacher/settings/mutations/useChangeWorkHoursMutation';

const toDisplayTime = (value?: string) => {
  if (!value) {
    return EMPTY_TIME;
  }

  const match = value.trim().match(/^(\d{2}):(\d{2})/);

  if (!match) {
    return EMPTY_TIME;
  }

  return `${match[1]}:${match[2]}`;
};

const sanitizeTimeInput = (value: string) => {
  const sanitized = value.replace(/[^\d:]/g, '').slice(0, 5);

  if (sanitized.length <= 2) {
    return sanitized;
  }

  const withoutColon = sanitized.replace(':', '');

  if (withoutColon.length <= 2) {
    return withoutColon;
  }

  return `${withoutColon.slice(0, 2)}:${withoutColon.slice(2, 4)}`;
};

const isValidTimeFormat = (value: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

const toMinutes = (value: string) => {
  const [hour, minute] = value.split(':').map(Number);

  return hour * 60 + minute;
};

const toApiTime = (value: string) => `${value}:00`;

const toWorkdays = (setting?: TeacherSetting): Workday[] => {
  if (!setting) {
    return [];
  }

  return DAY_INFO.map(day => {
    const schedule = setting.schedules.find(item => item.dayOfWeek === day.dayOfWeek);

    if (!schedule) {
      return {
        key: day.key,
        label: day.label,
        enabled: false,
        start: EMPTY_TIME,
        end: EMPTY_TIME,
      };
    }

    return {
      key: day.key,
      label: day.label,
      enabled: true,
      start: toDisplayTime(schedule.startTime),
      end: toDisplayTime(schedule.endTime),
    };
  });
};

const areWorkdaysEqual = (currentWorkdays: Workday[], initialWorkdays: Workday[]) => {
  if (currentWorkdays.length !== initialWorkdays.length) {
    return false;
  }

  return currentWorkdays.every((day, index) => {
    const initialDay = initialWorkdays[index];

    if (!initialDay) {
      return false;
    }

    return (
      day.key === initialDay.key &&
      day.enabled === initialDay.enabled &&
      day.start === initialDay.start &&
      day.end === initialDay.end
    );
  });
};

export const useWorkHoursForm = ({
  setting,
  isSettingLoading,
}: {
  setting?: TeacherSetting;
  isSettingLoading: boolean;
}) => {
  const { showToast } = useToast();
  const { mutateAsync: changeTeacherWorkHours, isPending: isSavingWorkHours } =
    useChangeWorkHoursMutation();

  const [editedWorkdays, setEditedWorkdays] = useState<Workday[] | null>(null);

  const initialWorkdays = useMemo(() => toWorkdays(setting), [setting]);
  const workdays = editedWorkdays ?? initialWorkdays;
  const hasWorkHoursChanges = !areWorkdaysEqual(workdays, initialWorkdays);

  const handleToggleWorkday = (targetKey: WorkdayKey) => {
    setEditedWorkdays(previousWorkdays => {
      const baseWorkdays = previousWorkdays ?? initialWorkdays;

      return baseWorkdays.map(day => {
        if (day.key !== targetKey) {
          return day;
        }

        return {
          ...day,
          enabled: !day.enabled,
        };
      });
    });
  };

  const handleChangeWorkdayTime = (
    targetKey: WorkdayKey,
    field: 'start' | 'end',
    value: string
  ) => {
    const nextValue = sanitizeTimeInput(value);

    setEditedWorkdays(previousWorkdays => {
      const baseWorkdays = previousWorkdays ?? initialWorkdays;

      return baseWorkdays.map(day => {
        if (day.key !== targetKey) {
          return day;
        }

        return {
          ...day,
          [field]: nextValue,
        };
      });
    });
  };

  const handleResetWorkHours = useCallback(() => {
    if (isSettingLoading || !hasWorkHoursChanges) {
      return;
    }

    setEditedWorkdays(null);
    showToast('근무시간 입력값을 되돌렸어요.', 'success');
  }, [hasWorkHoursChanges, isSettingLoading, showToast]);

  const handleSaveWorkHours = useCallback(async () => {
    if (isSettingLoading || isSavingWorkHours || !hasWorkHoursChanges) {
      return;
    }

    const enabledWorkdays = workdays.filter(day => day.enabled);

    if (enabledWorkdays.length === 0) {
      showToast('근무 요일을 1개 이상 활성화해주세요.', 'error');
      return;
    }

    const invalidWorkday = enabledWorkdays.find(
      day => !isValidTimeFormat(day.start) || !isValidTimeFormat(day.end)
    );

    if (invalidWorkday) {
      showToast(`${invalidWorkday.label}요일 시간을 HH:mm 형식으로 입력해주세요.`, 'error');
      return;
    }

    const invalidOrderWorkday = enabledWorkdays.find(
      day => toMinutes(day.start) >= toMinutes(day.end)
    );

    if (invalidOrderWorkday) {
      showToast(`${invalidOrderWorkday.label}요일 종료 시간은 시작 시간보다 늦어야 해요.`, 'error');
      return;
    }

    const schedules = enabledWorkdays.map(day => {
      const dayInfo = DAY_INFO.find(info => info.key === day.key);

      return {
        dayOfWeek: dayInfo?.dayOfWeek ?? 0,
        startTime: toApiTime(day.start),
        endTime: toApiTime(day.end),
      };
    });

    try {
      const response = await changeTeacherWorkHours({ schedules });

      if (!response.success) {
        const failMessage = response.message?.trim()
          ? response.message
          : response.code
            ? `근무시간 저장에 실패했어요. (code: ${response.code})`
            : '근무시간 저장에 실패했어요.';

        showToast(failMessage, 'error');
        return;
      }

      setEditedWorkdays(workdays);
      showToast('근무시간이 저장되었어요.', 'success');
    } catch (error) {
      const axiosError = error as AxiosError<{
        message?: string;
        error?: { message?: string };
      }>;

      const status = axiosError.response?.status;
      const serverMessage =
        axiosError.response?.data?.message ??
        axiosError.response?.data?.error?.message ??
        axiosError.message;

      showToast(
        `${serverMessage || '근무시간 저장에 실패했어요.'}${status ? ` (HTTP ${status})` : ''}`,
        'error'
      );
    }
  }, [
    changeTeacherWorkHours,
    hasWorkHoursChanges,
    isSavingWorkHours,
    isSettingLoading,
    showToast,
    workdays,
  ]);

  return {
    workdays,
    hasWorkHoursChanges,
    isSavingWorkHours,
    handleToggleWorkday,
    handleChangeWorkdayTime,
    handleResetWorkHours,
    handleSaveWorkHours,
  };
};
