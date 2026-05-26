const WITHDRAWN_USER_NAME_PATTERN = /^withdrawn_user_\d+$/;

export const UNKNOWN_USER_DISPLAY_NAME = '(알 수 없음)' as const;

export const isWithdrawnUserName = (name: string) => {
  return WITHDRAWN_USER_NAME_PATTERN.test(name.trim());
};

export const formatUserDisplayName = (name: string) => {
  const trimmedName = name.trim();

  if (!trimmedName || isWithdrawnUserName(trimmedName)) {
    return UNKNOWN_USER_DISPLAY_NAME;
  }

  return trimmedName;
};

export const isUnknownUserDisplayName = (name: string) => {
  return name === UNKNOWN_USER_DISPLAY_NAME;
};

export const formatUserDisplayNameWithSuffix = ({
  name,
  suffix,
}: {
  name: string;
  suffix: string;
}) => {
  const displayName = formatUserDisplayName(name);

  if (isUnknownUserDisplayName(displayName)) {
    return displayName;
  }

  return `${displayName} ${suffix}`;
};
