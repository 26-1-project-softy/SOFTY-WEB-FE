import styled from '@emotion/styled';
import { AxiosError } from 'axios';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { teacherApi } from '@/services/auth/teacherApi';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/services/auth/authApi';
import { IcInfo } from '@/icons';

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
  title: 'ȸ������ �� ������ �߻��߾��',
  description: '��� �� �ٽ� �õ��� �ּ���.',
};

const parseNumberText = (value: string) => Number(value.trim());

export const TeacherSignUpPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuth();

  const [teacherName, setTeacherName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [grade, setGrade] = useState('');
  const [classNumber, setClassNumber] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [globalError, setGlobalError] = useState<GlobalError>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const kakaoAccessToken = searchParams.get('kakaoAccessToken') || '';

  const validationResult = useMemo(() => {
    const errors: FieldErrors = {};

    if (teacherName.trim().length < 2) {
      errors.teacherName = '�̸��� 2�� �̻� �Է����ּ���.';
    }

    if (schoolName.trim().length === 0) {
      errors.schoolName = '�б����� �Է����ּ���.';
    }

    if (!/^\d+$/.test(grade.trim())) {
      errors.grade = '���ڸ� �Է����ּ���.';
    }

    if (!/^\d+$/.test(classNumber.trim())) {
      errors.classNumber = '���ڸ� �Է����ּ���.';
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
        title: 'īī�� ���� ������ ����Ǿ����',
        description: 'īī�� �α����� �ٽ� ������ �ּ���.',
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

      try {
        const me = await authApi.getMe();
        setAuth({ isAuthenticated: true, role: me.role, user: me.user });
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
      }

      navigate(ROUTES.inbox, { replace: true });
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

  const showFieldErrors = isSubmitAttempted;

  return (
    <PageContainer>
      <Card>
        <Title>���� ���� �Է�</Title>
        <Description>������ ���� �������� ������ �Է����ּ���.</Description>

        <SignUpForm onSubmit={handleSubmit}>
          <InputGroup>
            <Label
              htmlFor="teacherName"
              hasError={Boolean(showFieldErrors && fieldErrors.teacherName)}
            >
              �̸� <RequiredMark>*</RequiredMark>
            </Label>
            <Input
              id="teacherName"
              name="teacherName"
              value={teacherName}
              onChange={event => setTeacherName(event.target.value)}
              placeholder="ȫ�浿"
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
              �б��� <RequiredMark>*</RequiredMark>
            </Label>
            <Input
              id="schoolName"
              name="schoolName"
              value={schoolName}
              onChange={event => setSchoolName(event.target.value)}
              placeholder="�ѱ��ʵ��б�"
              hasError={Boolean(showFieldErrors && fieldErrors.schoolName)}
            />
            {showFieldErrors && fieldErrors.schoolName ? (
              <FieldErrorText>{fieldErrors.schoolName}</FieldErrorText>
            ) : null}
          </InputGroup>

          <InlineTwoColumn>
            <InputGroup>
              <Label htmlFor="grade" hasError={Boolean(showFieldErrors && fieldErrors.grade)}>
                �г� <RequiredMark>*</RequiredMark>
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
                �� <RequiredMark>*</RequiredMark>
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
            {isSubmitting ? '���� ��...' : '�����ϱ�'}
          </PrimaryButton>
        </SignUpForm>
      </Card>

      <FooterText>�� 2026, ����Ƽ All rights reserved.</FooterText>
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
