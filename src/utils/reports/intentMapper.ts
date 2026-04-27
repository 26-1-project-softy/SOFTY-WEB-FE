export type IntentType = 'absenceLate' | 'counseling' | 'request' | 'inquiry';

const serverIntentTypeMap: Record<string, IntentType> = {
  ABSENCE_LATE: 'absenceLate',
  COUNSELING: 'counseling',
  REQUEST: 'request',
  INQUIRY: 'inquiry',
};

export const mapServerIntentType = (intentType?: string | null): IntentType | null => {
  if (!intentType) {
    return null;
  }

  return serverIntentTypeMap[intentType] ?? null;
};

export const inferIntentTypeFromLabel = (label?: string | null): IntentType => {
  if (!label) {
    return 'request';
  }

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

export const resolveIntentType = ({
  intentType,
  intentLabel,
}: {
  intentType?: string | null;
  intentLabel?: string | null;
}): IntentType => {
  const mappedIntentType = mapServerIntentType(intentType);

  if (mappedIntentType) {
    return mappedIntentType;
  }

  return inferIntentTypeFromLabel(intentLabel);
};
