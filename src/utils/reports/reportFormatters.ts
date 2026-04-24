export type IntentType = 'absenceLate' | 'counseling' | 'request' | 'inquiry';

export const toIntentType = (label: string): IntentType => {
  if (/(결석|지각|absence|late)/i.test(label)) {
    return 'absenceLate';
  }

  if (/(상담|counsel)/i.test(label)) {
    return 'counseling';
  }

  if (/(문의|inquiry)/i.test(label)) {
    return 'inquiry';
  }

  return 'request';
};

export const formatDateOnly = (value: string) => {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 10) || '-';
  }

  const year = parsed.getFullYear();
  const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
  const day = `${parsed.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateTime = (value?: string) => {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const year = parsed.getFullYear();
  const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
  const day = `${parsed.getDate()}`.padStart(2, '0');
  const hour24 = parsed.getHours();
  const minute = `${parsed.getMinutes()}`.padStart(2, '0');
  const period = hour24 >= 12 ? '오후' : '오전';
  const hour12 = hour24 % 12 || 12;

  return `${year}-${month}-${day} ${period} ${hour12}:${minute}`;
};

export const formatPreviewName = (name?: string) => {
  if (!name || !name.trim()) {
    return '-';
  }

  return name.replace(' 학부모님', '');
};
