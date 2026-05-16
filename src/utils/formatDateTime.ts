export const formatAiModelDateTime = (dateTime?: string | null) => {
  if (!dateTime) {
    return '-';
  }

  return dateTime.replace('T', ' ').slice(0, 19);
};

export const formatMessagePreviewDateTime = (dateText: string | null) => {
  if (!dateText) {
    return '-';
  }

  const date = new Date(dateText);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();

  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);

  yesterdayStart.setDate(todayStart.getDate() - 1);

  const isToday = dateStart.getTime() === todayStart.getTime();
  const isYesterday = dateStart.getTime() === yesterdayStart.getTime();
  const isThisYear = date.getFullYear() === now.getFullYear();

  if (isToday) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours < 12 ? '오전' : '오후';
    const displayHours = hours % 12 || 12;
    const displayMinutes = String(minutes).padStart(2, '0');

    return `${period} ${displayHours}:${displayMinutes}`;
  }

  if (isYesterday) {
    return '어제';
  }

  if (isThisYear) {
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
};

export const formatChatMessageDateTime = (dateText: string) => {
  const date = new Date(dateText);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours < 12 ? '오전' : '오후';
  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, '0');

  return `${year}.${month}.${day} ${period} ${displayHours}:${displayMinutes}`;
};
