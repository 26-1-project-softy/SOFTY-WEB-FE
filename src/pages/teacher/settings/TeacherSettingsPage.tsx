import styled from '@emotion/styled';
import { useState } from 'react';
import { AxiosError } from 'axios';
import { userApi } from '@/services/auth/userApi';
import { useLogout } from '@/hooks/useLogout';
import { IcInfo } from '@/icons';

type PageError = {
  title: string;
  description: string;
} | null;

export const TeacherSettingsPage = () => {
  const { logout } = useLogout();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pageError, setPageError] = useState<PageError>(null);

  const handleOpenDeleteModal = () => {
    setPageError(null);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) {
      return;
    }

    setIsDeleteModalOpen(false);
  };

  const handleDeleteMe = async () => {
    try {
      setIsDeleting(true);
      const response = await userApi.deleteMe();

      if (!response.success) {
        if (response.code === 401) {
          logout();
          return;
        }

        if (response.code === 409) {
          setPageError({
            title: response.message || '�̹� Ż���� �����̿���',
            description: '�α��� ȭ������ �̵��� �ٽ� Ȯ���� �ּ���.',
          });
          setIsDeleteModalOpen(false);
          return;
        }

        if (response.code === 502) {
          setPageError({
            title: response.message || 'īī�� ���� ���� ���з� Ż�� �Ϸ���� �ʾҽ��ϴ�.',
            description: '��� �� �ٽ� �õ��� �ּ���.',
          });
          setIsDeleteModalOpen(false);
          return;
        }

        setPageError({
          title: response.message || '����� ������ �ҷ����� ���߾��',
          description: '��� �� �ٽ� �õ��� �ּ���.',
        });
        setIsDeleteModalOpen(false);
        return;
      }

      logout();
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const status = axiosError.response?.status;

      if (status === 401) {
        logout();
        return;
      }

      if (status === 409) {
        setPageError({
          title: axiosError.response?.data?.message || '�̹� Ż���� �����̿���',
          description: '�α��� ȭ������ �̵��� �ٽ� Ȯ���� �ּ���.',
        });
        setIsDeleteModalOpen(false);
        return;
      }

      if (status === 502) {
        setPageError({
          title: axiosError.response?.data?.message || 'īī�� ���� ���� ���з� Ż�� �Ϸ���� �ʾҽ��ϴ�.',
          description: '��� �� �ٽ� �õ��� �ּ���.',
        });
        setIsDeleteModalOpen(false);
        return;
      }

      setPageError({
        title: axiosError.response?.data?.message || '����� ������ �ҷ����� ���߾��',
        description: '��� �� �ٽ� �õ��� �ּ���.',
      });
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRetry = () => {
    setPageError(null);
  };

  return (
    <PageContainer>
      <TopActions>
        <ActionGhostButton type="button">���</ActionGhostButton>
        <ActionGhostButton type="button">������� ����</ActionGhostButton>
      </TopActions>

      {pageError ? (
        <ErrorBanner role="alert">
          <ErrorLeft>
            <ErrorIcon>
              <IcInfo />
            </ErrorIcon>
            <ErrorTextWrap>
              <ErrorTitle>{pageError.title}</ErrorTitle>
              <ErrorDescription>{pageError.description}</ErrorDescription>
            </ErrorTextWrap>
          </ErrorLeft>
          <ErrorRetryButton type="button" onClick={handleRetry}>
            �ٽ� �õ�
          </ErrorRetryButton>
        </ErrorBanner>
      ) : null}

      <SectionCard>
        <SectionTitle>���� ����</SectionTitle>
        <MenuList>
          <MenuItemButton type="button" onClick={() => logout()}>
            �α׾ƿ�
          </MenuItemButton>
          <MenuItemButton type="button" onClick={handleOpenDeleteModal}>
            ȸ�� Ż��
          </MenuItemButton>
        </MenuList>
      </SectionCard>

      {isDeleteModalOpen ? (
        <ModalOverlay onClick={handleCloseDeleteModal}>
          <ModalCard onClick={event => event.stopPropagation()}>
            <ModalIconWrap>
              <IcInfo />
            </ModalIconWrap>
            <ModalTitle>���� Ż���Ͻðھ��?</ModalTitle>
            <ModalDescription>
              Ż���ϸ� �б� ������ ��ȭ ������ ��� �����ǰ�,
              <br />
              �ٽ� ������ �� �����.
            </ModalDescription>

            <ModalButtonRow>
              <ModalCancelButton
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
              >
                ���
              </ModalCancelButton>
              <ModalDangerButton type="button" onClick={handleDeleteMe} disabled={isDeleting}>
                {isDeleting ? 'Ż�� ��...' : 'Ż���ϱ�'}
              </ModalDangerButton>
            </ModalButtonRow>
          </ModalCard>
        </ModalOverlay>
      ) : null}
    </PageContainer>
  );
};

const PageContainer = styled.div`
  position: relative;
  padding: 18px 18px 24px;
  background: ${({ theme }) => theme.colors.background.bg2};
`;

const TopActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const ActionGhostButton = styled.button`
  ${({ theme }) => theme.fonts.caption};
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  border-radius: 8px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.background.bg1};
  color: ${({ theme }) => theme.colors.text.text3};
`;

const ErrorBanner = styled.div`
  margin-top: 14px;
  border-radius: 10px;
  border: 1px solid #ff7d86;
  background: #fff0f1;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const ErrorLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ErrorIcon = styled.span`
  display: inline-flex;
  color: ${({ theme }) => theme.colors.semantic.error};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ErrorTextWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ErrorTitle = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 0;
  color: ${({ theme }) => theme.colors.semantic.error};
`;

const ErrorDescription = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 0;
  color: ${({ theme }) => theme.colors.semantic.error};
`;

const ErrorRetryButton = styled.button`
  ${({ theme }) => theme.fonts.labelXS};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const SectionCard = styled.section`
  margin-top: 14px;
  max-width: 820px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  background: ${({ theme }) => theme.colors.background.bg1};
  padding: 12px;
`;

const SectionTitle = styled.h3`
  ${({ theme }) => theme.fonts.labelS};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const MenuList = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MenuItemButton = styled.button`
  ${({ theme }) => theme.fonts.body3};
  width: fit-content;
  color: ${({ theme }) => theme.colors.text.text2};
  padding: 6px 2px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 16px;
`;

const ModalCard = styled.section`
  width: 100%;
  max-width: 360px;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.background.bg1};
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.2);
  padding: 22px 20px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const ModalIconWrap = styled.span`
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff1f1;
  color: ${({ theme }) => theme.colors.text.text1};

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ModalTitle = styled.h4`
  ${({ theme }) => theme.fonts.labelS};
  margin: 12px 0 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const ModalDescription = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 10px 0 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const ModalButtonRow = styled.div`
  margin-top: 18px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const ModalCancelButton = styled.button`
  ${({ theme }) => theme.fonts.labelXS};
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.bg1};
  color: ${({ theme }) => theme.colors.text.text2};
  padding: 10px 0;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ModalDangerButton = styled.button`
  ${({ theme }) => theme.fonts.labelXS};
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.semantic.error};
  color: ${({ theme }) => theme.colors.text.textW};
  padding: 10px 0;

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;
