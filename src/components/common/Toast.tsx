import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import type { ToastItem, ToastType } from '@/stores/toastStore';
import { useToastStore } from '@/stores/toastStore';
import { IcCheck, IcError } from '@/icons';

const toastSlideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const getToastIcon = (type: ToastType) => {
  return type === 'success' ? <IcCheck /> : <IcError />;
};

export const Toast = () => {
  const toasts = useToastStore(state => state.toasts);
  const removeToast = useToastStore(state => state.removeToast);

  return (
    <ToastStack aria-live="polite" aria-atomic="true">
      {toasts.map(toast => (
        <ToastCard
          key={toast.id}
          type="button"
          toastType={toast.type}
          onClick={() => removeToast(toast.id)}
        >
          <ToastStatusIcon toastType={toast.type}>{getToastIcon(toast.type)}</ToastStatusIcon>
          <ToastMessage>{toast.message}</ToastMessage>
        </ToastCard>
      ))}
    </ToastStack>
  );
};

const ToastStack = styled.div`
  position: fixed;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
`;

const ToastCard = styled.button<{ toastType: ToastItem['type'] }>`
  display: flex;
  align-items: center;
  max-width: 360px;
  border-radius: 10px;
  border: 1px solid
    ${({ toastType, theme }) =>
      toastType === 'success' ? theme.colors.semantic.success : theme.colors.semantic.error};
  background: ${({ toastType, theme }) =>
    toastType === 'success' ? theme.colors.semantic.successSoft : theme.colors.semantic.errorSoft};
  padding: 8px;
  gap: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  pointer-events: auto;
  animation: ${toastSlideIn} 0.2s ease-out;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ToastStatusIcon = styled.span<{ toastType: ToastItem['type'] }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${({ toastType }) => (toastType === 'success' ? '#55b85d' : '#ff5a5a')};

  & > svg {
    width: 18px;
    height: 18px;
  }
`;

const ToastMessage = styled.span`
  flex: 1;
  text-align: left;
  ${({ theme }) => theme.fonts.body3};
  color: ${({ theme }) => theme.colors.text.text1};
  word-break: break-word;
`;
