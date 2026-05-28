import styled from '@emotion/styled';
import { useCopyClassCode } from '@/hooks/useCopyClassCode';
import { useTeacherSettingQuery } from '@/features/teacher/settings/queries';
import {
  useClassChangeForm,
  useTeacherWithdraw,
  useWorkHoursForm,
} from '@/features/teacher/settings/hooks';
import { Loader } from '@/components/common/Loader';
import { ProfileInfoCard } from '@/components/teacher/settings/ProfileInfoCard';
import { WorkHoursSettingCard } from '@/components/teacher/settings/WorkHoursSettingCard';
import { ClassManagementCard } from '@/components/teacher/settings/ClassManagementCard';
import { AccountManagementCard } from '@/components/teacher/settings/AccountManagementCard';
import { ClassChangeFormDialog } from '@/components/teacher/settings/ClassChangeFormDialog';
import { ClassChangeConfirmDialog } from '@/components/teacher/settings/ClassChangeConfirmDialog';
import { ClassChangeSuccessDialog } from '@/components/teacher/settings/ClassChangeSuccessDialog';
import { WithdrawConfirmDialog } from '@/components/teacher/settings/WithdrawConfirmDialog';
import { HEADER_HEIGHT } from '@/constants/layout';
import { Alert } from '@/components/common/Alert';

export const TeacherSettingsPage = () => {
  const { copyClassCode } = useCopyClassCode();

  const { data: setting, isLoading, isError, errorMessage, refetch } = useTeacherSettingQuery();

  const {
    isWithdrawModalOpen,
    isWithdrawing,
    withdrawErrorMessage,
    handleOpenWithdrawModal,
    handleCloseWithdrawModal,
    handleConfirmWithdraw,
    handleLogout,
  } = useTeacherWithdraw();

  const {
    workdays,
    hasWorkHoursChanges,
    isSavingWorkHours,
    handleToggleWorkday,
    handleChangeWorkdayTime,
    handleResetWorkHours,
    handleSaveWorkHours,
  } = useWorkHoursForm({
    setting,
    isSettingLoading: isLoading,
  });

  const {
    isClassChangeModalOpen,
    isClassChangeConfirmModalOpen,
    isClassChangeSuccessModalOpen,
    isClassChangeSubmitting,
    classChangeErrorTitle,
    newClassCode,
    schoolNameInput,
    gradeInput,
    classInput,
    classSummaryText,
    classChangeFieldErrors,
    isClassChangeEnabled,
    setSchoolNameInput,
    handleOpenClassChangeModal,
    handleCloseClassChangeModal,
    handleChangeClassGrade,
    handleChangeClassNumber,
    handleOpenClassChangeConfirmModal,
    handleCloseClassChangeConfirmModal,
    handleCloseClassChangeSuccessModal,
    handleConfirmClassChange,
  } = useClassChangeForm(setting);

  const renderSettingContent = () => {
    if (isLoading) {
      return <Loader />;
    }

    if (isError) {
      return (
        <Alert
          variant="error"
          title="사용자 정보를 불러오지 못했어요"
          description={errorMessage || '잠시 후 다시 시도해주세요.'}
          onRetry={() => void refetch()}
        />
      );
    }

    return (
      <>
        <ProfileInfoCard teacherName={setting?.teacherName} />

        <WorkHoursSettingCard
          workdays={workdays}
          isLoading={isLoading}
          isSaving={isSavingWorkHours}
          hasChanges={hasWorkHoursChanges}
          onReset={handleResetWorkHours}
          onSave={() => void handleSaveWorkHours()}
          onToggleWorkday={handleToggleWorkday}
          onChangeWorkdayTime={handleChangeWorkdayTime}
        />

        <ClassManagementCard
          schoolName={setting?.schoolName}
          grade={setting?.grade}
          classNumber={setting?.class}
          classCode={setting?.classCode}
          onOpenClassChangeModal={handleOpenClassChangeModal}
          onCopyClassCode={() => void copyClassCode(setting?.classCode)}
        />
      </>
    );
  };

  return (
    <SettingsPageContainer>
      <ContentArea>
        {renderSettingContent()}

        <AccountManagementCard
          disabled={isWithdrawing}
          onLogout={handleLogout}
          onWithdraw={handleOpenWithdrawModal}
        />
      </ContentArea>

      <ClassChangeFormDialog
        isOpen={isClassChangeModalOpen}
        schoolNameInput={schoolNameInput}
        gradeInput={gradeInput}
        classInput={classInput}
        fieldErrors={classChangeFieldErrors}
        isSubmitEnabled={isClassChangeEnabled}
        onClose={handleCloseClassChangeModal}
        onChangeSchoolName={setSchoolNameInput}
        onChangeGrade={handleChangeClassGrade}
        onChangeClassNumber={handleChangeClassNumber}
        onSubmit={handleOpenClassChangeConfirmModal}
      />

      <ClassChangeConfirmDialog
        isOpen={isClassChangeConfirmModalOpen}
        schoolName={schoolNameInput}
        classSummary={classSummaryText}
        errorMessage={classChangeErrorTitle}
        isSubmitting={isClassChangeSubmitting}
        onClose={handleCloseClassChangeConfirmModal}
        onConfirm={() => void handleConfirmClassChange()}
      />

      <ClassChangeSuccessDialog
        isOpen={isClassChangeSuccessModalOpen}
        schoolName={schoolNameInput}
        classSummary={classSummaryText}
        classCode={newClassCode}
        onClose={handleCloseClassChangeSuccessModal}
        onCopyClassCode={() => void copyClassCode(newClassCode)}
      />

      <WithdrawConfirmDialog
        isOpen={isWithdrawModalOpen}
        isWithdrawing={isWithdrawing}
        errorMessage={withdrawErrorMessage}
        onClose={handleCloseWithdrawModal}
        onConfirm={() => void handleConfirmWithdraw()}
      />
    </SettingsPageContainer>
  );
};

const SettingsPageContainer = styled.div`
  display: flex;
  justify-content: center;
  min-height: calc(100vh - ${HEADER_HEIGHT}px);
  background: ${({ theme }) => theme.colors.background.bg2};
  padding: 16px 24px;
`;

const ContentArea = styled.div`
  display: flex;
  width: 100%;
  max-width: 960px;
  flex-direction: column;
  gap: 16px;
`;
