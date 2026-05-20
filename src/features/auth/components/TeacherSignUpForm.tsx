import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import type { ComponentProps } from 'react';
import { InlineButton } from '@/components/common/InlineButton';
import { TextField } from '@/components/common/TextField';
import { Alert } from '@/components/common/Alert';
import { IconBadge } from '@/components/common/IconBadge';
import type { AuthErrorMessage } from '@/features/auth/lib/getAuthErrorMessage';
import type { SignUpStep } from '@/features/auth/hooks/useTeacherSignUpForm';
import { IcCopy } from '@/icons';
import { TEACHER_SIGN_UP_STEP_CONTENT } from '@/features/auth/constants/signupSteps';
import { useCopyClassCode } from '@/hooks/useCopyClassCode';

type TeacherSignUpFormProps = {
  teacherName: string;
  schoolName: string;
  grade: string;
  classNumber: string;
  fieldErrors: {
    teacherName?: string;
    schoolName?: string;
    grade?: string;
    classNumber?: string;
  };
  globalError: AuthErrorMessage | null;
  isSignUpActionDisabled: boolean;
  step: SignUpStep;
  generatedClassCode: string;
  setTeacherName: (value: string) => void;
  setSchoolName: (value: string) => void;
  setGrade: (value: string) => void;
  setClassNumber: (value: string) => void;
  handleSubmit: NonNullable<ComponentProps<'form'>['onSubmit']>;
  handleSignUpAction: () => void | Promise<void>;
};

export const TeacherSignUpForm = ({
  teacherName,
  schoolName,
  grade,
  classNumber,
  fieldErrors,
  globalError,
  isSignUpActionDisabled,
  step,
  generatedClassCode,
  setTeacherName,
  setSchoolName,
  setGrade,
  setClassNumber,
  handleSubmit,
  handleSignUpAction,
}: TeacherSignUpFormProps) => {
  const theme = useTheme();
  const { copyClassCode } = useCopyClassCode();
  const {
    progressRatio,
    iconBadge: Icon,
    title,
    description,
    actionLabel,
  } = TEACHER_SIGN_UP_STEP_CONTENT[step];

  return (
    <SignUpCard>
      <ProgressTrack aria-hidden>
        <ProgressFill style={{ width: `${progressRatio * 100}%` }} />
      </ProgressTrack>

      <SignUpFormSection onSubmit={handleSubmit}>
        <SignUpHeaderSection>
          {Icon && (
            <IconBadge
              icon={Icon}
              bgColor={theme.colors.background.bg4}
              color={theme.colors.brand.dark}
            />
          )}
          <SignUpHeaderTextArea>
            <Title>{title}</Title>
            <Description>{description}</Description>
          </SignUpHeaderTextArea>
        </SignUpHeaderSection>
        {step === 'FORM' ? (
          <SignUpBodySection>
            <TextField
              id="teacherName"
              name="teacherName"
              label="이름"
              isRequired
              value={teacherName}
              onChange={event => setTeacherName(event.target.value)}
              placeholder="홍길동"
              errorMessage={fieldErrors.teacherName}
            />

            <TextField
              id="schoolName"
              name="schoolName"
              label="학교명"
              isRequired
              value={schoolName}
              onChange={event => setSchoolName(event.target.value)}
              placeholder="한국초등학교"
              errorMessage={fieldErrors.schoolName}
            />

            <InlineTwoColumn>
              <TextField
                id="grade"
                name="grade"
                inputMode="numeric"
                label="학년"
                isRequired
                value={grade}
                onChange={event => setGrade(event.target.value)}
                placeholder="3"
                errorMessage={fieldErrors.grade}
              />

              <TextField
                id="classNumber"
                name="classNumber"
                inputMode="numeric"
                label="반"
                isRequired
                value={classNumber}
                onChange={event => setClassNumber(event.target.value)}
                placeholder="2"
                errorMessage={fieldErrors.classNumber}
              />
            </InlineTwoColumn>
          </SignUpBodySection>
        ) : step === 'CLASS_CODE_READY' ? (
          <SignUpBodySection>
            <ClassCodeCard>
              <ClassLabel>
                {schoolName || '한국초등학교'} {grade || '3'}학년 {classNumber || '2'}반
              </ClassLabel>
              <ClassCode>{generatedClassCode}</ClassCode>
            </ClassCodeCard>

            <InlineButton
              type="button"
              variant="ghost"
              size="L"
              icon={IcCopy}
              label="학급코드 복사하기"
              onClick={() => void copyClassCode(generatedClassCode)}
            />
          </SignUpBodySection>
        ) : null}

        <SignUpActionSection>
          {globalError ? (
            <Alert title={globalError.title} description={globalError.description} />
          ) : null}

          <InlineButton
            type={step === 'FORM' ? 'submit' : 'button'}
            variant="primary"
            size="L"
            label={actionLabel}
            disabled={isSignUpActionDisabled}
            onClick={step === 'FORM' ? undefined : handleSignUpAction}
          />
        </SignUpActionSection>
      </SignUpFormSection>
    </SignUpCard>
  );
};

const SignUpCard = styled.section`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 441px;
  background: ${({ theme }) => theme.colors.background.bg1};
  box-shadow: ${({ theme }) => theme.colors.shadow.modal};
  border-radius: 16px;
  padding: 20px 40px 40px;
  gap: 40px;
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 3px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.neutral.neutral400};
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.colors.brand.primary};
  transition: width 0.2s ease;
`;

const SignUpHeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const SignUpHeaderTextArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h1`
  text-align: center;
  ${({ theme }) => theme.fonts.title3};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const Description = styled.p`
  text-align: center;
  white-space: pre-line;
  ${({ theme }) => theme.fonts.body3};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const SignUpFormSection = styled.form`
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const SignUpBodySection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
`;

const InlineTwoColumn = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 8px;
`;

const ClassCodeCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.brand.primary};
  background: ${({ theme }) => theme.colors.background.bg4};
  padding: 18px 14px;
  gap: 10px;
`;

const ClassLabel = styled.p`
  ${({ theme }) => theme.fonts.caption};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.brand.dark};
`;

const ClassCode = styled.p`
  ${({ theme }) => theme.fonts.title2};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const SignUpActionSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;
`;
