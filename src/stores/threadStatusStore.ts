import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InquiryStatusType } from '@/constants/inquiryStatus';

export type ThreadStatus = InquiryStatusType;

type ThreadStatusState = {
  statusByRoomId: Record<number, ThreadStatus>;
  setRoomStatus: (roomId: number, status: ThreadStatus) => void;
};

export const useThreadStatusStore = create<ThreadStatusState>()(
  persist(
    set => ({
      statusByRoomId: {},
      setRoomStatus: (roomId, status) => {
        set(state => ({
          statusByRoomId: {
            ...state.statusByRoomId,
            [roomId]: status,
          },
        }));
      },
    }),
    {
      name: 'softy-thread-status',
    }
  )
);
