import { TeacherClassCodeReadySection } from '@/features/auth/components/teacherSignUp/TeacherClassCodeReadySection';
import { TeacherSignUpFormSection } from '@/features/auth/components/teacherSignUp/TeacherSignUpFormSection';
import { TeacherSignUpSuccessSection } from '@/features/auth/components/teacherSignUp/TeacherSignUpSuccessSection';
import {
  Card,
  FooterText,
  PageContainer,
  ProgressFill,
  ProgressTrack,
} from '@/features/auth/components/teacherSignUp/teacherSignUpPageStyles';
import { useTeacherSignUpForm } from '@/features/auth/hooks/useTeacherSignUpForm';

export const TeacherSignUpPage = () => {
  const {
    teacherName,
    schoolName,
    grade,
    classNumber,
    fieldErrors,
    globalError,
    isSubmitting,
    isCreatingClassCode,
    isSignUpEnabled,
    step,
    generatedClassCode,
    setTeacherName,
    setSchoolName,
    setGrade,
    setClassNumber,
    handleSubmit,
    handleOpenClassCodeModal,
    handleCopyClassCode,
    handleGoToInbox,
  } = useTeacherSignUpForm();

  const progressRatio = step === 'CLASS_CODE_READY' ? 1 : step === 'SIGN_UP_SUCCESS' ? 0.66 : 0.33;

  return (
    <PageContainer>
      <Card>
        <ProgressTrack aria-hidden>
          <ProgressFill style={{ width: `${progressRatio * 100}%` }} />
        </ProgressTrack>

        {step === 'FORM' ? (
          <TeacherSignUpFormSection
            teacherName={teacherName}
            schoolName={schoolName}
            grade={grade}
            classNumber={classNumber}
            fieldErrors={fieldErrors}
            globalError={globalError}
            isSignUpEnabled={isSignUpEnabled}
            isSubmitting={isSubmitting}
            onTeacherNameChange={setTeacherName}
            onSchoolNameChange={setSchoolName}
            onGradeChange={setGrade}
            onClassNumberChange={setClassNumber}
            onSubmit={handleSubmit}
          />
        ) : null}

        {step === 'SIGN_UP_SUCCESS' ? (
          <TeacherSignUpSuccessSection
            isCreatingClassCode={isCreatingClassCode}
            onOpenClassCodeModal={handleOpenClassCodeModal}
          />
        ) : null}

        {step === 'CLASS_CODE_READY' ? (
          <TeacherClassCodeReadySection
            schoolName={schoolName}
            grade={grade}
            classNumber={classNumber}
            generatedClassCode={generatedClassCode}
            onCopyClassCode={handleCopyClassCode}
            onGoToInbox={handleGoToInbox}
          />
        ) : null}
      </Card>

      <FooterText>© 2026, 소프티 All rights reserved.</FooterText>
    </PageContainer>
  );
};
