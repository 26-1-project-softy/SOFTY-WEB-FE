export type WorkdayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type Workday = {
  key: WorkdayKey;
  label: string;
  enabled: boolean;
  start: string;
  end: string;
};

export type ClassChangeFieldErrors = {
  schoolName?: string;
  grade?: string;
  classNumber?: string;
};

export const EMPTY_TIME = '';
export const TIME_PLACEHOLDER = '00:00';

export const DAY_INFO: { key: WorkdayKey; dayOfWeek: number; label: string }[] = [
  { key: 'mon', dayOfWeek: 1, label: '월' },
  { key: 'tue', dayOfWeek: 2, label: '화' },
  { key: 'wed', dayOfWeek: 3, label: '수' },
  { key: 'thu', dayOfWeek: 4, label: '목' },
  { key: 'fri', dayOfWeek: 5, label: '금' },
  { key: 'sat', dayOfWeek: 6, label: '토' },
  { key: 'sun', dayOfWeek: 7, label: '일' },
];
