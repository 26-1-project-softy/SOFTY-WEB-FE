import { useToast } from '@/hooks/useToast';
import { copyTextToClipboard, type CopyTextToClipboardResult } from '@/utils/copyTextToClipboard';

const CLASS_CODE_COPY_TOAST_MESSAGE = {
  SUCCESS: {
    message: '학급코드를 복사했어요.',
    type: 'success',
  },
  EMPTY_TEXT: {
    message: '복사할 학급코드가 없어요.',
    type: 'error',
  },
  UNSUPPORTED: {
    message: '현재 브라우저에서는 복사를 지원하지 않아요.',
    type: 'error',
  },
  FAILED: {
    message: '학급코드 복사에 실패했어요.',
    type: 'error',
  },
} satisfies Record<
  CopyTextToClipboardResult,
  {
    message: string;
    type: 'success' | 'error';
  }
>;

export const useCopyClassCode = () => {
  const { showToast } = useToast();

  const copyClassCode = async (classCode: string | null | undefined) => {
    const result = await copyTextToClipboard(classCode);
    const toastMessage = CLASS_CODE_COPY_TOAST_MESSAGE[result];

    showToast(toastMessage.message, toastMessage.type);
  };

  return { copyClassCode };
};
