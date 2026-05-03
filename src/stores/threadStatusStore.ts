import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThreadStatus = 'processing' | 'done' | 'hold';

type ThreadStatusState = {
  statusByRoomId: Record<number, ThreadStatus>;
  setRoomStatus: (roomId: number, status: ThreadStatus) => void;
};

export const mapApiStatusToThreadStatus = (status?: string | null): ThreadStatus => {
  if (status === 'DONE') return 'done';
  if (status === 'HOLD') return 'hold';
  return 'processing';
};

export const toThreadStatusLabel = (status: ThreadStatus): '처리중' | '완료' | '보류' => {
  if (status === 'done') return '완료';
  if (status === 'hold') return '보류';
  return '처리중';
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
