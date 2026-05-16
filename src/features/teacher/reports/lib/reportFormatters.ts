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

export const formatPreviewName = (name?: string) => {
  if (!name || !name.trim()) {
    return '-';
  }

  return name.replace(' 학부모님', '');
};
