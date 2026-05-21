export type CopyTextToClipboardResult = 'SUCCESS' | 'EMPTY_TEXT' | 'UNSUPPORTED' | 'FAILED';

export const copyTextToClipboard = async (
  text: string | null | undefined
): Promise<CopyTextToClipboardResult> => {
  const trimmedText = text?.trim();

  if (!trimmedText) {
    return 'EMPTY_TEXT';
  }

  if (!navigator.clipboard) {
    return 'UNSUPPORTED';
  }

  try {
    await navigator.clipboard.writeText(trimmedText);
    return 'SUCCESS';
  } catch {
    return 'FAILED';
  }
};
