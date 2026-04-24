import styled from '@emotion/styled';
import { createPortal } from 'react-dom';
import { useMemo, type MouseEvent, type ReactNode } from 'react';
import { useDialogBehavior } from '@/features/auth/hooks/useDialogBehavior';

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
};

export const Dialog = ({
  isOpen,
  onClose,
  children,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  ariaLabelledBy,
  ariaDescribedBy,
}: DialogProps) => {
  const portalTarget = useMemo(() => {
    if (typeof document === 'undefined') {
      return null;
    }

    return document.body;
  }, []);

  const { dialogPanelRef, handleKeyDownPanel } = useDialogBehavior({
    isOpen,
    onClose,
    closeOnEscape,
  });

  const handleClickOverlay = (event: MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdropClick) {
      return;
    }

    if (event.target !== event.currentTarget) {
      return;
    }

    onClose();
  };

  if (!isOpen || !portalTarget) {
    return null;
  }

  return createPortal(
    <DialogOverlay onClick={handleClickOverlay}>
      <DialogPanel
        ref={dialogPanelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        tabIndex={-1}
        onKeyDown={handleKeyDownPanel}
      >
        {children}
      </DialogPanel>
    </DialogOverlay>,
    portalTarget
  );
};

const DialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.5);

  @media (max-width: 393px) {
    padding: 16px;
  }
`;

const DialogPanel = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  overflow-y: auto;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.background.bg1};
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.18);
  padding: 40px;
  gap: 40px;
  outline: none;

  @media (max-width: 393px) {
    padding: 24px;
  }
`;
