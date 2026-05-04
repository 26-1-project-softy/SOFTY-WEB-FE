export const formatDateTime = (dateTime?: string | null) => {
  if (!dateTime) {
    return '-';
  }

  return dateTime.replace('T', ' ').slice(0, 19);
};
