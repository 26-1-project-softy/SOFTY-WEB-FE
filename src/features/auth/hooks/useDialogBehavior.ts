import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react';

type UseDialogBehaviorParams = {
  isOpen: boolean;
  onClose: () => void;
  closeOnEscape: boolean;
};

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

let openedDialogCount = 0;

export const useDialogBehavior = ({ isOpen, onClose, closeOnEscape }: UseDialogBehaviorParams) => {
  const dialogPanelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    openedDialogCount += 1;
    document.body.style.overflow = 'hidden';

    return () => {
      openedDialogCount = Math.max(0, openedDialogCount - 1);

      if (openedDialogCount === 0) {
        document.body.style.overflow = originalOverflow;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') {
      return;
    }

    previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;

    const animationFrameId = window.requestAnimationFrame(() => {
      const dialogPanel = dialogPanelRef.current;

      if (!dialogPanel) {
        return;
      }

      const focusableElements = dialogPanel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      const firstFocusableElement = focusableElements[0];

      if (firstFocusableElement) {
        firstFocusableElement.focus();
        return;
      }

      dialogPanel.focus();
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      previouslyFocusedElementRef.current?.focus?.();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeOnEscape, isOpen, onClose]);

  const handleKeyDownPanel = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') {
      return;
    }

    const dialogPanel = dialogPanelRef.current;

    if (!dialogPanel) {
      return;
    }

    const focusableElements = Array.from(
      dialogPanel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter(element => {
      return !element.hasAttribute('disabled') && element.tabIndex !== -1;
    });

    if (focusableElements.length === 0) {
      event.preventDefault();
      dialogPanel.focus();
      return;
    }

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (activeElement === firstFocusableElement || activeElement === dialogPanel) {
        event.preventDefault();
        lastFocusableElement.focus();
      }

      return;
    }

    if (activeElement === lastFocusableElement) {
      event.preventDefault();
      firstFocusableElement.focus();
    }
  };

  return {
    dialogPanelRef,
    handleKeyDownPanel,
  };
};
