import { create } from 'zustand';

export type ToastType = 'success' | 'error';

export type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastState = {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
  clearToasts: () => void;
};

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  showToast: (message, type = 'success') => {
    const id = Date.now();

    set(state => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    window.setTimeout(() => {
      get().removeToast(id);
    }, 3000);
  },
  removeToast: id => {
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id),
    }));
  },
  clearToasts: () => {
    set({ toasts: [] });
  },
}));
