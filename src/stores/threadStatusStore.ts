import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThreadStatus = 'processing' | 'done';

type ThreadStatusState = {
  statusByRoomId: Record<number, ThreadStatus>;
  setRoomStatus: (roomId: number, status: ThreadStatus) => void;
};

export const mapApiStatusToThreadStatus = (status?: string | null): ThreadStatus => {
  const normalizedStatus = status?.toUpperCase().trim();

  if (normalizedStatus === 'COMPLETED' || normalizedStatus === 'DONE') return 'done';
  if (normalizedStatus === 'IN_PROGRESS' || normalizedStatus === 'PROCESSING') return 'processing';
  return 'processing';
};

export const toThreadStatusLabel = (status: ThreadStatus): '처리중' | '완료' => {
  if (status === 'done') return '완료';
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
