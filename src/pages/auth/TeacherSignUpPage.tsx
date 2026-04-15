import styled from '@emotion/styled';
import { AxiosError } from 'axios';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { teacherApi } from '@/api/auth/teacherApi';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { authApi } from '@/services/auth/auth.api';
import { IcCheck, IcCopy, IcInfo, IcSparkles } from '@/icons';

type SignUpStep = 'form' | 'signupComplete' | 'classCodeComplete';

type FieldErrors = {
  teacherName?: string;
  schoolName?: string;
  grade?: string;
  classNumber?: string;
};

type GlobalError = {
  title: string;
  description: string;
} | null;

const FORM_ERROR_FALLBACK: GlobalError = {
  title: '회원가입 중 문제가 발생했어요',
  description: '잠시 후 다시 시도해 주세요.',
};

const parseNumberText = (value: string) => Number(value.trim());

export const TeacherSignUpPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState<SignUpStep>('form');
  const [teacherName, setTeacherName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [grade, setGrade] = useState('');
  const [classNumber, setClassNumber] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [globalError, setGlobalError] = useState<GlobalError>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingClassCode, setIsCreatingClassCode] = useState(false);
  const [isMovingInbox, setIsMovingInbox] = useState(false);
  const [generatedClassCode, setGeneratedClassCode] = useState('');

  const kakaoAccessToken = searchParams.get('kakaoAccessToken') || '';

  const validationResult = useMemo(() => {
    const errors: FieldErrors = {};

    if (teacherName.trim().length < 2) {
      errors.teacherName = '이름은 2자 이상 입력해주세요.';
    }

    if (schoolName.trim().length === 0) {
      errors.schoolName = '학교명을 입력해주세요.';
    }

    if (!/^\d+$/.test(grade.trim())) {
      errors.grade = '숫자만 입력해주세요.';
    }

    if (!/^\d+$/.test(classNumber.trim())) {
      errors.classNumber = '숫자만 입력해주세요.';
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0,
      parsedGrade: parseNumberText(grade),
      parsedClassNumber: parseNumberText(classNumber),
    };
  }, [teacherName, schoolName, grade, classNumber]);

  const isSignUpEnabled = validationResult.isValid && !isSubmitting && kakaoAccessToken.length > 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitAttempted(true);
    setFieldErrors(validationResult.errors);
    setGlobalError(null);

    if (!kakaoAccessToken) {
      setGlobalError({
        title: '카카오 인증 정보가 만료되었어요',
        description: '카카오 로그인을 다시 진행해 주세요.',
      });
      return;
    }

    if (!validationResult.isValid) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await teacherApi.signUp({
        kakaoAccessToken,
        teacherName: teacherName.trim(),
        schoolName: schoolName.trim(),
        grade: validationResult.parsedGrade,
        classNumber: validationResult.parsedClassNumber,
      });

      if (!response.success) {
        setGlobalError({
          title: response.message || FORM_ERROR_FALLBACK.title,
          description: FORM_ERROR_FALLBACK.description,
        });
        return;
      }

      setStep('signupComplete');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message || FORM_ERROR_FALLBACK.title;

      setGlobalError({
        title: message,
        description: FORM_ERROR_FALLBACK.description,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateClassCode = async () => {
    try {
      setGlobalError(null);
      setIsCreatingClassCode(true);

      const response = await teacherApi.createClassCode();

      if (!response.success) {
        setGlobalError({
          title: response.message || '학급 코드 생성 중 문제가 발생했어요',
          description: '잠시 후 다시 시도해 주세요.',
        });
        return;
      }

      setGeneratedClassCode(response.data.classCode);
      setStep('classCodeComplete');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message || '학급 코드 생성 중 문제가 발생했어요';

      setGlobalError({
        title: message,
        description: '잠시 후 다시 시도해 주세요.',
      });
    } finally {
      setIsCreatingClassCode(false);
    }
  };

  const handleCopyClassCode = async () => {
    if (!generatedClassCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedClassCode);
      showToast('학급코드를 복사했어요.');
    } catch {
      showToast('복사에 실패했어요. 다시 시도해 주세요.', 'error');
    }
  };

  const handleMoveInbox = async () => {
    try {
      setIsMovingInbox(true);
      const me = await authApi.getMe();
      setAuth({ isAuthenticated: true, role: me.role, user: me.user });
      navigate(me.role === 'teacher' ? ROUTES.teacherThreadList : ROUTES.adminDashboard, {
        replace: true,
      });
    } catch {
      setAuth({
        isAuthenticated: true,
        role: 'teacher',
        user: {
          name: teacherName.trim(),
          grade: validationResult.parsedGrade,
          classNumber: validationResult.parsedClassNumber,
        },
      });
      navigate(ROUTES.teacherThreadList, { replace: true });
    } finally {
      setIsMovingInbox(false);
    }
  };

  const showFieldErrors = isSubmitAttempted;

  return (
    <PageContainer>
      <Card>
        <ProgressTrack>
          <ProgressBar progress={step === 'classCodeComplete' ? 100 : 42} />
        </ProgressTrack>

        {step === 'form' ? (
          <FormSection>
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
          </FormSection>
        ) : null}

        {step === 'signupComplete' ? (
          <ResultSection>
            <ResultIconWrap>
              <IcCheck />
            </ResultIconWrap>
            <Title>가입 완료</Title>
            <ResultBodyText>교사 가입이 완료되었어요.</ResultBodyText>
            <ResultBodyText>
              이제 학급을 개설하고, 학부모님과 안전한 소통을 시작해보세요.
            </ResultBodyText>

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

            <PrimaryButton
              type="button"
              onClick={handleCreateClassCode}
              disabled={isCreatingClassCode}
            >
              {isCreatingClassCode ? '생성 중...' : '학급 개설하기'}
            </PrimaryButton>
          </ResultSection>
        ) : null}

        {step === 'classCodeComplete' ? (
          <ResultSection>
            <ResultIconWrap>
              <IcSparkles />
            </ResultIconWrap>
            <Title>학급 코드 생성 완료</Title>
            <ResultBodyText>학급이 개설되었어요.</ResultBodyText>
            <ResultBodyText>생성된 학급 코드를 학부모님들께 공유해주세요.</ResultBodyText>

            <CodeCard>
              <CodeClassInfo>
                {schoolName.trim()} {grade.trim()}학년 {classNumber.trim()}반
              </CodeClassInfo>
              <CodeValue>{generatedClassCode}</CodeValue>
            </CodeCard>

            <GhostButton type="button" onClick={handleCopyClassCode}>
              <IcCopy />
              학급코드 복사하기
            </GhostButton>

            <PrimaryButton type="button" onClick={handleMoveInbox} disabled={isMovingInbox}>
              {isMovingInbox ? '이동 중...' : '수신함으로 이동'}
            </PrimaryButton>
          </ResultSection>
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
  max-width: 560px;
  border-radius: 20px;
  background: #f4f4f4;
  box-shadow: 0 12px 22px rgba(0, 0, 0, 0.14);
  padding: 18px 30px 28px;

  @media (max-width: 640px) {
    padding: 16px 16px 22px;
    border-radius: 16px;
  }
`;

const ProgressTrack = styled.div`
  height: 3px;
  width: 100%;
  border-radius: 999px;
  background: #c9c9c9;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ progress: number }>`
  height: 100%;
  width: ${({ progress }) => `${progress}%`};
  background: ${({ theme }) => theme.colors.brand.primary};
  transition: width 0.25s ease;
`;

const FormSection = styled.div`
  margin-top: 28px;
`;

const ResultSection = styled.div`
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
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

  @media (max-width: 640px) {
    grid-template-columns: 1fr 1fr;
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

const GhostButton = styled.button`
  ${({ theme }) => theme.fonts.labelS};
  margin-top: 14px;
  width: 100%;
  border: 1px solid #d4d4d4;
  border-radius: 12px;
  padding: 14px;
  color: ${({ theme }) => theme.colors.text.text1};
  background: #f4f4f4;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ResultIconWrap = styled.span`
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: #e7f1ef;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.brand.dark};

  svg {
    width: 28px;
    height: 28px;
  }
`;

const ResultBodyText = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 6px 0 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const CodeCard = styled.div`
  width: 100%;
  margin-top: 18px;
  border-radius: 18px;
  background: #dfeae8;
  padding: 16px 14px;
`;

const CodeClassInfo = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 0;
  color: ${({ theme }) => theme.colors.brand.dark};
`;

const CodeValue = styled.p`
  ${({ theme }) => theme.fonts.title1};
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const FooterText = styled.p`
  ${({ theme }) => theme.fonts.body3};
  color: #919191;
  margin: 18px 0 0;
`;
