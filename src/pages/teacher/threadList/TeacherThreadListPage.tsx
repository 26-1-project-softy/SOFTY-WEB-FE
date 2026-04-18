import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { authApi } from '@/services/auth/authApi';

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
    sender: '��μ� ��ȣ��',
    subject: '���� �Ἦ ���� ���޵帳�ϴ�',
    preview: '�ȳ��ϼ��� ������, ���� ���̰� ���� ������ �־� �Ἦ�մϴ�.',
    time: '09:12',
    unread: true,
  },
  {
    id: 2,
    sender: '�ڼ��� ��ȣ��',
    subject: '���� ���� ����',
    preview: '���� ���� �з��� �� �� �� �ȳ� ��Ź�帳�ϴ�.',
    time: '����',
    unread: true,
  },
  {
    id: 3,
    sender: '�ֳ��� ��ȣ��',
    subject: '��� ���� ���� �����ұ��?',
    preview: '�����Ͻ� �ð��븦 �˷��ֽø� ���纸�ڽ��ϴ�.',
    time: '����',
    unread: false,
  },
  {
    id: 4,
    sender: '�̵��� ��ȣ��',
    subject: '����ü���н� �غ� Ȯ��',
    preview: '�غ� ��� �� �ǳ�ȭ ���� ���� Ȯ�� ��Ź�帳�ϴ�.',
    time: '4/15',
    unread: false,
  },
  {
    id: 5,
    sender: '������ ��ȣ��',
    subject: '�б� ���� Ȯ�� �Ϸ�',
    preview: '���� ���� Ȯ���߰� �غ� ì�� �����ڽ��ϴ�.',
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
            <ClassInfoTitle>{classInfo.teacherName} ������ �б�</ClassInfoTitle>
            <ClassInfoText>
              {classInfo.grade && classInfo.classNumber
                ? `${classInfo.grade}�г� ${classInfo.classNumber}��`
                : '�б� ���� Ȯ�� ��'}
            </ClassInfoText>
          </ClassInfoCard>
        ) : null}

        {mockThreads.map(thread => (
          <ThreadCard key={thread.id} unread={thread.unread}>
            <CardHeader>
              <SenderName>{thread.sender}</SenderName>
              <MetaRow>
                <TimeText>{thread.time}</TimeText>
                {thread.unread ? <UnreadDot aria-label="������" /> : null}
              </MetaRow>
            </CardHeader>
            <Subject>{thread.subject}</Subject>
            <Preview>{thread.preview}</Preview>
          </ThreadCard>
        ))}
      </ListPane>

      <EmptyPane>
        <EmptyTitle>��ȭ�� ������ �ּ���</EmptyTitle>
        <EmptyDescription>���� ��Ͽ��� ��ȭ�� �����ϸ� �� ������ �� �� �־��.</EmptyDescription>
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
