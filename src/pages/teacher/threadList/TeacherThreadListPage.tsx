import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { authApi } from '@/services/auth/auth.api';

type MockThread = {
  id: number;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
};

const mockThreads: MockThread[] = [
  {
    id: 1,
    sender: '김민수 보호자',
    subject: '오늘 결석 사유 전달드립니다',
    preview: '안녕하세요 선생님, 오늘 아이가 감기 증상이 있어 결석합니다.',
    time: '09:12',
    unread: true,
  },
  {
    id: 2,
    sender: '박서준 보호자',
    subject: '숙제 관련 문의',
    preview: '국어 숙제 분량을 한 번 더 안내 부탁드립니다.',
    time: '어제',
    unread: true,
  },
  {
    id: 3,
    sender: '최나은 보호자',
    subject: '상담 일정 조율 가능할까요?',
    preview: '가능하신 시간대를 알려주시면 맞춰보겠습니다.',
    time: '어제',
    unread: false,
  },
  {
    id: 4,
    sender: '이도윤 보호자',
    subject: '현장체험학습 준비물 확인',
    preview: '준비물 목록 중 실내화 포함 여부 확인 부탁드립니다.',
    time: '4/15',
    unread: false,
  },
  {
    id: 5,
    sender: '정유진 보호자',
    subject: '학급 공지 확인 완료',
    preview: '공지 내용 확인했고 준비물 챙겨 보내겠습니다.',
    time: '4/14',
    unread: false,
  },
];

export const TeacherThreadListPage = () => {
  const [classInfo, setClassInfo] = useState<{
    teacherName: string;
    grade?: number;
    classNumber?: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchClassInfo = async () => {
      try {
        const me = await authApi.getMe();

        if (!isMounted || me.role !== 'teacher') {
          return;
        }

        setClassInfo({
          teacherName: me.user.name,
          grade: me.user.grade,
          classNumber: me.user.classNumber,
        });
      } catch {
        if (isMounted) {
          setClassInfo(null);
        }
      }
    };

    void fetchClassInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PageContainer>
      <ListPane>
        {classInfo ? (
          <ClassInfoCard>
            <ClassInfoTitle>{classInfo.teacherName} 선생님 학급</ClassInfoTitle>
            <ClassInfoText>
              {classInfo.grade && classInfo.classNumber
                ? `${classInfo.grade}학년 ${classInfo.classNumber}반`
                : '학급 정보 확인 중'}
            </ClassInfoText>
          </ClassInfoCard>
        ) : null}

        {mockThreads.map(thread => (
          <ThreadCard key={thread.id} unread={thread.unread}>
            <CardHeader>
              <SenderName>{thread.sender}</SenderName>
              <MetaRow>
                <TimeText>{thread.time}</TimeText>
                {thread.unread ? <UnreadDot aria-label="안읽음" /> : null}
              </MetaRow>
            </CardHeader>
            <Subject>{thread.subject}</Subject>
            <Preview>{thread.preview}</Preview>
          </ThreadCard>
        ))}
      </ListPane>

      <EmptyPane>
        <EmptyTitle>대화를 선택해 주세요</EmptyTitle>
        <EmptyDescription>좌측 목록에서 대화를 선택하면 상세 내용을 볼 수 있어요.</EmptyDescription>
      </EmptyPane>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: grid;
  grid-template-columns: 420px 1fr;
  min-height: calc(100vh - 72px);
  background: ${({ theme }) => theme.colors.background.bg2};

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const ListPane = styled.section`
  border-right: 1px solid ${({ theme }) => theme.colors.border.border1};
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;

  @media (max-width: 1100px) {
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.border1};
    max-height: 55vh;
  }
`;

const ClassInfoCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.background.bg1};
  padding: 12px;
`;

const ClassInfoTitle = styled.p`
  ${({ theme }) => theme.fonts.labelXS};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const ClassInfoText = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 6px 0 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const ThreadCard = styled.button<{ unread: boolean }>`
  text-align: left;
  border-radius: 12px;
  border: 1px solid
    ${({ unread, theme }) => (unread ? theme.colors.brand.primary : theme.colors.border.border1)};
  background: ${({ theme }) => theme.colors.background.bg1};
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.background.bg4};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const SenderName = styled.span`
  ${({ theme }) => theme.fonts.labelXS};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const MetaRow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const TimeText = styled.span`
  ${({ theme }) => theme.fonts.caption};
  color: ${({ theme }) => theme.colors.text.text3};
`;

const UnreadDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.brand.primary};
`;

const Subject = styled.p`
  ${({ theme }) => theme.fonts.body2};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const Preview = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text3};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EmptyPane = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
`;

const EmptyTitle = styled.h2`
  ${({ theme }) => theme.fonts.title4};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const EmptyDescription = styled.p`
  ${({ theme }) => theme.fonts.body2};
  margin: 10px 0 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;
