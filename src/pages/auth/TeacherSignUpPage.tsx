import styled from '@emotion/styled';
import { IcCheck, IcCopy, IcInfo, IcSparkles } from '@/icons';
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

        {step === 'SIGN_UP_SUCCESS' ? (
          <SuccessSection>
            <SuccessIconWrap>
              <IcCheck />
            </SuccessIconWrap>
            <SuccessTitle>가입 완료</SuccessTitle>
            <SuccessDescription>
              교사 가입이 완료되었어요.
              <br />
              이제 학급을 개설하고, 학부모님과 안전한 소통을 시작해보세요.
            </SuccessDescription>
            <PrimaryButton
              type="button"
              onClick={handleOpenClassCodeModal}
              disabled={isCreatingClassCode}
            >
              {isCreatingClassCode ? '학급 코드 생성 중...' : '학급 개설하기'}
            </PrimaryButton>
          </SuccessSection>
        ) : null}

        {step === 'CLASS_CODE_READY' ? (
          <SuccessSection>
            <SuccessIconWrap>
              <IcSparkles />
            </SuccessIconWrap>
            <SuccessTitle>학급 코드 생성 완료</SuccessTitle>
            <SuccessDescription>
              학급이 개설되었어요.
              <br />
              생성된 학급 코드를 학부모님들께 공유해주세요.
            </SuccessDescription>

            <ClassCodeCard>
              <ClassLabel>
                {schoolName || '한국초등학교'} {grade || '3'}학년 {classNumber || '2'}반
              </ClassLabel>
              <ClassCode>{generatedClassCode}</ClassCode>
            </ClassCodeCard>

            <CopyButton type="button" onClick={handleCopyClassCode}>
              <IcCopy />
              학급코드 복사하기
            </CopyButton>

            <PrimaryButton type="button" onClick={handleGoToInbox}>
              수신함으로 이동
            </PrimaryButton>
          </SuccessSection>
        ) : null}

        {step === 'FORM' ? (
          <>
            <Title>교사 정보 입력</Title>
            <Description>가입을 위해 선생님의 정보를 입력해주세요.</Description>

            <SignUpForm onSubmit={handleSubmit}>
              <InputGroup>
                <Label htmlFor="teacherName" hasError={Boolean(fieldErrors.teacherName)}>
                  이름 <RequiredMark>*</RequiredMark>
                </Label>
                <Input
                  id="teacherName"
                  name="teacherName"
                  value={teacherName}
                  onChange={event => setTeacherName(event.target.value)}
                  placeholder="홍길동"
                  hasError={Boolean(fieldErrors.teacherName)}
                />
                {fieldErrors.teacherName ? (
                  <FieldErrorText>{fieldErrors.teacherName}</FieldErrorText>
                ) : null}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="schoolName" hasError={Boolean(fieldErrors.schoolName)}>
                  학교명 <RequiredMark>*</RequiredMark>
                </Label>
                <Input
                  id="schoolName"
                  name="schoolName"
                  value={schoolName}
                  onChange={event => setSchoolName(event.target.value)}
                  placeholder="한국초등학교"
                  hasError={Boolean(fieldErrors.schoolName)}
                />
                {fieldErrors.schoolName ? (
                  <FieldErrorText>{fieldErrors.schoolName}</FieldErrorText>
                ) : null}
              </InputGroup>

              <InlineTwoColumn>
                <InputGroup>
                  <Label htmlFor="grade" hasError={Boolean(fieldErrors.grade)}>
                    학년 <RequiredMark>*</RequiredMark>
                  </Label>
                  <Input
                    id="grade"
                    name="grade"
                    value={grade}
                    onChange={event => setGrade(event.target.value)}
                    placeholder="3"
                    hasError={Boolean(fieldErrors.grade)}
                  />
                  {fieldErrors.grade ? <FieldErrorText>{fieldErrors.grade}</FieldErrorText> : null}
                </InputGroup>

                <InputGroup>
                  <Label htmlFor="classNumber" hasError={Boolean(fieldErrors.classNumber)}>
                    반 <RequiredMark>*</RequiredMark>
                  </Label>
                  <Input
                    id="classNumber"
                    name="classNumber"
                    value={classNumber}
                    onChange={event => setClassNumber(event.target.value)}
                    placeholder="2"
                    hasError={Boolean(fieldErrors.classNumber)}
                  />
                  {fieldErrors.classNumber ? (
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
          </>
        ) : null}
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
  max-width: 430px;
  border-radius: 16px;
  background: #f4f4f4;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.16);
  padding: 18px 36px 30px;

  @media (max-width: 640px) {
    padding: 18px 18px 24px;
    border-radius: 16px;
  }
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 3px;
  border-radius: 999px;
  background: #bdbdbd;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.colors.brand.primary};
  transition: width 0.2s ease;
`;

const Title = styled.h1`
  ${({ theme }) => theme.fonts.title2};
  margin: 34px 0 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const Description = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 12px 0 0;
  color: ${({ theme }) => theme.colors.text.text3};
  text-align: center;
`;

const SignUpForm = styled.form`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const InlineTwoColumn = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 10px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
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
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
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
  gap: 12px;
  align-items: center;
  border-radius: 14px;
  border: 1px solid #ff5b66;
  background: #fff1f3;
  padding: 14px 16px;
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
  margin-top: 8px;
  width: 100%;
  border: none;
  border-radius: 10px;
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

const SuccessSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 44px;
`;

const SuccessIconWrap = styled.span`
  width: 64px;
  height: 64px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #e8f3f1;
  color: #5b8f8a;

  svg {
    width: 30px;
    height: 30px;
  }
`;

const SuccessTitle = styled.h2`
  ${({ theme }) => theme.fonts.title2};
  margin: 34px 0 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const SuccessDescription = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 14px 0 0;
  color: ${({ theme }) => theme.colors.text.text2};
  text-align: center;
  line-height: 1.7;
`;

const ClassCodeCard = styled.div`
  width: 100%;
  margin-top: 18px;
  border-radius: 14px;
  border: 1px solid #c9e6e1;
  background: #ddebe8;
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const ClassLabel = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 0;
  color: #4a7b76;
`;

const ClassCode = styled.p`
  ${({ theme }) => theme.fonts.title2};
  margin: 0;
  letter-spacing: 0.02em;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const CopyButton = styled.button`
  ${({ theme }) => theme.fonts.labelS};
  margin-top: 16px;
  width: 100%;
  border-radius: 10px;
  border: 1px solid #d2d2d2;
  padding: 12px;
  background: ${({ theme }) => theme.colors.background.bg1};
  color: ${({ theme }) => theme.colors.text.text1};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const FooterText = styled.p`
  ${({ theme }) => theme.fonts.body3};
  color: #919191;
  margin: 18px 0 0;
`;
