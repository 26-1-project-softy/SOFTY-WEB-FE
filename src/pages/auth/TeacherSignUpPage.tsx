import styled from '@emotion/styled';
import { IcInfo } from '@/icons';
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
    isSubmitAttempted,
    isSignUpEnabled,
    setTeacherName,
    setSchoolName,
    setGrade,
    setClassNumber,
    handleSubmit,
  } = useTeacherSignUpForm();

  const showFieldErrors = isSubmitAttempted;

  return (
    <PageContainer>
      <Card>
        <Title>교사 정보 입력</Title>
        <Description>가입을 위해 선생님의 정보를 입력해주세요.</Description>

        <SignUpForm onSubmit={handleSubmit}>
          <InputGroup>
            <Label
              htmlFor="teacherName"
              hasError={Boolean(showFieldErrors && fieldErrors.teacherName)}
            >
              이름 <RequiredMark>*</RequiredMark>
            </Label>
            <Input
              id="teacherName"
              name="teacherName"
              value={teacherName}
              onChange={event => setTeacherName(event.target.value)}
              placeholder="홍길동"
              hasError={Boolean(showFieldErrors && fieldErrors.teacherName)}
            />
            {showFieldErrors && fieldErrors.teacherName ? (
              <FieldErrorText>{fieldErrors.teacherName}</FieldErrorText>
            ) : null}
          </InputGroup>

          <InputGroup>
            <Label
              htmlFor="schoolName"
              hasError={Boolean(showFieldErrors && fieldErrors.schoolName)}
            >
              학교명 <RequiredMark>*</RequiredMark>
            </Label>
            <Input
              id="schoolName"
              name="schoolName"
              value={schoolName}
              onChange={event => setSchoolName(event.target.value)}
              placeholder="한국초등학교"
              hasError={Boolean(showFieldErrors && fieldErrors.schoolName)}
            />
            {showFieldErrors && fieldErrors.schoolName ? (
              <FieldErrorText>{fieldErrors.schoolName}</FieldErrorText>
            ) : null}
          </InputGroup>

          <InlineTwoColumn>
            <InputGroup>
              <Label htmlFor="grade" hasError={Boolean(showFieldErrors && fieldErrors.grade)}>
                학년 <RequiredMark>*</RequiredMark>
              </Label>
              <Input
                id="grade"
                name="grade"
                value={grade}
                onChange={event => setGrade(event.target.value)}
                placeholder="3"
                hasError={Boolean(showFieldErrors && fieldErrors.grade)}
              />
              {showFieldErrors && fieldErrors.grade ? (
                <FieldErrorText>{fieldErrors.grade}</FieldErrorText>
              ) : null}
            </InputGroup>

            <InputGroup>
              <Label
                htmlFor="classNumber"
                hasError={Boolean(showFieldErrors && fieldErrors.classNumber)}
              >
                반 <RequiredMark>*</RequiredMark>
              </Label>
              <Input
                id="classNumber"
                name="classNumber"
                value={classNumber}
                onChange={event => setClassNumber(event.target.value)}
                placeholder="2"
                hasError={Boolean(showFieldErrors && fieldErrors.classNumber)}
              />
              {showFieldErrors && fieldErrors.classNumber ? (
                <FieldErrorText>{fieldErrors.classNumber}</FieldErrorText>
              ) : null}
            </InputGroup>
          </InlineTwoColumn>

          {globalError ? (
            <ErrorBox role="alert">
              <ErrorIcon>
                <IcInfo />
              </ErrorIcon>
              <ErrorTextWrap>
                <ErrorTitle>{globalError.title}</ErrorTitle>
                <ErrorDescription>{globalError.description}</ErrorDescription>
              </ErrorTextWrap>
            </ErrorBox>
          ) : null}

          <PrimaryButton type="submit" disabled={!isSignUpEnabled}>
            {isSubmitting ? '가입 중...' : '가입하기'}
          </PrimaryButton>
        </SignUpForm>
      </Card>

      <FooterText>© 2026, 소프티 All rights reserved.</FooterText>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  min-height: 100vh;
  background: #e5e5e5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px 28px;
`;

const Card = styled.section`
  width: 100%;
  max-width: 560px;
  border-radius: 20px;
  background: #f4f4f4;
  box-shadow: 0 12px 22px rgba(0, 0, 0, 0.14);
  padding: 28px 30px;

  @media (max-width: 640px) {
    padding: 20px 16px;
    border-radius: 16px;
  }
`;

const Title = styled.h1`
  ${({ theme }) => theme.fonts.title2};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const Description = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 12px 0 0;
  color: ${({ theme }) => theme.colors.text.text3};
  text-align: center;
`;

const SignUpForm = styled.form`
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InlineTwoColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const Label = styled.label<{ hasError?: boolean }>`
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ hasError, theme }) =>
    hasError ? theme.colors.semantic.error : theme.colors.text.text1};
`;

const RequiredMark = styled.span`
  color: ${({ theme }) => theme.colors.semantic.error};
`;

const Input = styled.input<{ hasError?: boolean }>`
  ${({ theme }) => theme.fonts.body2};
  border: 1px solid ${({ hasError }) => (hasError ? '#ff5b66' : '#c6c6c6')};
  border-radius: 10px;
  background: #f4f4f4;
  padding: 11px 12px;
  color: ${({ theme }) => theme.colors.text.text1};

  &::placeholder {
    color: #9a9a9a;
  }

  &:focus {
    outline: none;
    border-color: ${({ hasError, theme }) => (hasError ? '#ff5b66' : theme.colors.brand.primary)};
    box-shadow: ${({ hasError }) =>
      hasError ? '0 0 0 2px rgba(255, 44, 61, 0.14)' : '0 0 0 2px rgba(85, 181, 166, 0.16)'};
  }
`;

const FieldErrorText = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 0;
  color: ${({ theme }) => theme.colors.semantic.error};
`;

const ErrorBox = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  border-radius: 16px;
  border: 1px solid #ff5b66;
  background: #ffe9ec;
  padding: 12px 14px;
`;

const ErrorIcon = styled.span`
  display: inline-flex;
  color: ${({ theme }) => theme.colors.semantic.error};

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ErrorTextWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ErrorTitle = styled.p`
  ${({ theme }) => theme.fonts.labelXS};
  margin: 0;
  color: ${({ theme }) => theme.colors.semantic.error};
`;

const ErrorDescription = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 0;
  color: ${({ theme }) => theme.colors.semantic.error};
`;

const PrimaryButton = styled.button`
  ${({ theme }) => theme.fonts.labelS};
  margin-top: 14px;
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 14px;
  color: ${({ theme }) => theme.colors.text.textW};
  background: ${({ theme }) => theme.colors.brand.primary};
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.background.brandHover};
  }

  &:disabled {
    background: #d0d0d0;
    color: #7a7a7a;
    cursor: not-allowed;
  }
`;

const FooterText = styled.p`
  ${({ theme }) => theme.fonts.body3};
  color: #919191;
  margin: 18px 0 0;
`;
