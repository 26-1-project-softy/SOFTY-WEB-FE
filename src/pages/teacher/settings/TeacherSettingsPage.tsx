import styled from '@emotion/styled';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { useOutletContext } from 'react-router-dom';
import { InlineButton } from '@/components/common/InlineButton';
import { IcChange, IcCheck, IcCopy, IcError, IcInfo } from '@/icons';
import type { AppLayoutOutletContext } from '@/layouts/AppLayout';
import { teacherApi, type TeacherSetting } from '@/services/teacher/teacherApi';
import { useLogout } from '@/hooks/useLogout';
import { useToast } from '@/hooks/useToast';

type WorkdayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

type Workday = {
  key: WorkdayKey;
  label: string;
  enabled: boolean;
  start: string;
  end: string;
};

const EMPTY_TIME = '';
const TIME_PLACEHOLDER = '00:00';

const DAY_INFO: { key: WorkdayKey; dayOfWeek: number; label: string }[] = [
  { key: 'mon', dayOfWeek: 1, label: '월' },
  { key: 'tue', dayOfWeek: 2, label: '화' },
  { key: 'wed', dayOfWeek: 3, label: '수' },
  { key: 'thu', dayOfWeek: 4, label: '목' },
  { key: 'fri', dayOfWeek: 5, label: '금' },
  { key: 'sat', dayOfWeek: 6, label: '토' },
  { key: 'sun', dayOfWeek: 7, label: '일' },
];

const toDisplayTime = (value: string | null | undefined) => {
  if (!value) {
    return EMPTY_TIME;
  }

  const normalized = value.trim();
  const match = normalized.match(/^(\d{2}):(\d{2})/);

  if (!match) {
    return EMPTY_TIME;
  }

  return `${match[1]}:${match[2]}`;
};

const sanitizeTimeInput = (value: string) => {
  const sanitized = value.replace(/[^\d:]/g, '').slice(0, 5);

  if (sanitized.length <= 2) {
    return sanitized;
  }

  const withoutColon = sanitized.replace(':', '');

  if (withoutColon.length <= 2) {
    return withoutColon;
  }

  return `${withoutColon.slice(0, 2)}:${withoutColon.slice(2, 4)}`;
};

const isValidTimeFormat = (value: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

const toMinutes = (value: string) => {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
};

const toApiTime = (value: string) => `${value}:00`;

const toWorkdays = (setting: TeacherSetting): Workday[] => {
  return DAY_INFO.map(day => {
    const schedule = setting.schedules.find(item => item.dayOfWeek === day.dayOfWeek);

    if (!schedule) {
      return {
        key: day.key,
        label: day.label,
        enabled: false,
        start: EMPTY_TIME,
        end: EMPTY_TIME,
      };
    }

    return {
      key: day.key,
      label: day.label,
      enabled: true,
      start: toDisplayTime(schedule.startTime),
      end: toDisplayTime(schedule.endTime),
    };
  });
};

const extractClassNumber = (raw: string) => {
  const digits = raw.replace(/\D/g, '');

  if (!digits) {
    return null;
  }

  return Number(digits);
};

export const TeacherSettingsPage = () => {
  const { showToast } = useToast();
  const { logout } = useLogout();
  const { setHeaderActions } = useOutletContext<AppLayoutOutletContext>();
  const [setting, setSetting] = useState<TeacherSetting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [isClassChangeModalOpen, setIsClassChangeModalOpen] = useState(false);
  const [isClassChangeConfirmModalOpen, setIsClassChangeConfirmModalOpen] = useState(false);
  const [isClassChangeSuccessModalOpen, setIsClassChangeSuccessModalOpen] = useState(false);
  const [isClassChangeSubmitting, setIsClassChangeSubmitting] = useState(false);
  const [classChangeErrorTitle, setClassChangeErrorTitle] = useState('');
  const [newClassCode, setNewClassCode] = useState('');

  const [schoolNameInput, setSchoolNameInput] = useState('');
  const [gradeInput, setGradeInput] = useState('');
  const [classInput, setClassInput] = useState('');
  const [initialWorkdays, setInitialWorkdays] = useState<Workday[]>([]);
  const [workdays, setWorkdays] = useState<Workday[]>([]);
  const [isSavingWorkHours, setIsSavingWorkHours] = useState(false);
  const handleLogout = () => logout();

  useEffect(() => {
    let isMounted = true;

    const fetchSetting = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await teacherApi.getTeacherSetting();

        if (!isMounted) {
          return;
        }

        setSetting(response);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const axiosError = error as AxiosError<{ message?: string }>;
        setErrorMessage(axiosError.response?.data?.message || '설정 정보를 불러오지 못했어요.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchSetting();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!setting) {
      setInitialWorkdays([]);
      setWorkdays([]);
      return;
    }

    const nextWorkdays = toWorkdays(setting);
    setInitialWorkdays(nextWorkdays);
    setWorkdays(nextWorkdays);
  }, [setting]);

  const profileName = setting?.teacherName?.trim() ? setting.teacherName : '-';
  const profileInitial = profileName !== '-' ? profileName.charAt(0) : '-';
  const isClassChangeEnabled =
    schoolNameInput.trim().length > 0 &&
    gradeInput.trim().length > 0 &&
    classInput.trim().length > 0;

  const classSummaryText = useMemo(() => {
    if (!gradeInput.trim() || !classInput.trim()) {
      return '-';
    }

    return `${gradeInput}학년 ${classInput}`;
  }, [classInput, gradeInput]);

  const handleOpenClassChangeModal = () => {
    setSchoolNameInput(setting?.schoolName ?? '');
    setGradeInput(setting?.grade != null ? String(setting.grade) : '');
    setClassInput(setting?.classNumber != null ? `${setting.classNumber}반` : '');
    setIsClassChangeModalOpen(true);
  };

  const handleCloseClassChangeModal = () => {
    setIsClassChangeModalOpen(false);
  };

  const handleOpenClassChangeConfirmModal = () => {
    if (!isClassChangeEnabled) {
      return;
    }

    setIsClassChangeModalOpen(false);
    setClassChangeErrorTitle('');
    setIsClassChangeConfirmModalOpen(true);
  };

  const handleCloseClassChangeConfirmModal = () => {
    if (isClassChangeSubmitting) {
      return;
    }

    setClassChangeErrorTitle('');
    setIsClassChangeConfirmModalOpen(false);
  };

  const handleCloseClassChangeSuccessModal = () => {
    setIsClassChangeSuccessModalOpen(false);
  };

  const handleConfirmClassChange = async () => {
    const classNumber = extractClassNumber(classInput.trim());

    if (!classNumber) {
      setClassChangeErrorTitle('반 정보를 확인해주세요.');
      return;
    }

    try {
      setIsClassChangeSubmitting(true);
      setClassChangeErrorTitle('');
      const response = await teacherApi.changeTeacherClass({
        schoolName: schoolNameInput.trim(),
        grade: Number(gradeInput),
        class: classNumber,
      });

      if (!response.success) {
        setClassChangeErrorTitle(response.message || '학급 변경에 실패했어요.');
        return;
      }

      setSetting(prev => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          schoolName: schoolNameInput.trim(),
          grade: Number(gradeInput),
          classNumber,
          classCode: response.classCode || prev.classCode,
        };
      });

      setNewClassCode(response.classCode || '');
      setIsClassChangeConfirmModalOpen(false);
      setIsClassChangeSuccessModalOpen(true);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setClassChangeErrorTitle(axiosError.response?.data?.message || '학급 변경에 실패했어요.');
    } finally {
      setIsClassChangeSubmitting(false);
    }
  };

  const handleCopyClassCode = async () => {
    if (!setting?.classCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(setting.classCode);
      showToast('학급코드를 복사했어요.', 'success');
    } catch {
      showToast('학급코드 복사에 실패했어요.', 'error');
    }
  };

  const handleCopyNewClassCode = async () => {
    if (!newClassCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(newClassCode);
      showToast('학급코드를 복사했어요.', 'success');
    } catch {
      showToast('학급코드 복사에 실패했어요.', 'error');
    }
  };

  const handleToggleWorkday = (targetKey: WorkdayKey) => {
    setWorkdays(prev =>
      prev.map(day => {
        if (day.key !== targetKey) {
          return day;
        }

        return {
          ...day,
          enabled: !day.enabled,
        };
      })
    );
  };

  const handleChangeWorkdayTime = (
    targetKey: WorkdayKey,
    field: 'start' | 'end',
    value: string
  ) => {
    const nextValue = sanitizeTimeInput(value);

    setWorkdays(prev =>
      prev.map(day => {
        if (day.key !== targetKey) {
          return day;
        }

        return {
          ...day,
          [field]: nextValue,
        };
      })
    );
  };

  const handleResetWorkHours = useCallback(() => {
    if (isLoading) {
      return;
    }

    setWorkdays(initialWorkdays);
    showToast('근무시간 입력값을 되돌렸어요.', 'success');
  }, [initialWorkdays, isLoading, showToast]);

  const handleSaveWorkHours = useCallback(async () => {
    if (isLoading || isSavingWorkHours) {
      return;
    }

    const enabledWorkdays = workdays.filter(day => day.enabled);
    if (enabledWorkdays.length === 0) {
      showToast('근무 요일을 1개 이상 활성화해주세요.', 'error');
      return;
    }

    const invalidWorkday = enabledWorkdays.find(
      day => !isValidTimeFormat(day.start) || !isValidTimeFormat(day.end)
    );

    if (invalidWorkday) {
      showToast(`${invalidWorkday.label}요일 시간을 HH:mm 형식으로 입력해주세요.`, 'error');
      return;
    }

    const invalidOrderWorkday = enabledWorkdays.find(
      day => toMinutes(day.start) >= toMinutes(day.end)
    );
    if (invalidOrderWorkday) {
      showToast(`${invalidOrderWorkday.label}요일 종료 시간은 시작 시간보다 늦어야 해요.`, 'error');
      return;
    }

    try {
      setIsSavingWorkHours(true);
      const schedules = enabledWorkdays.map(day => {
        const dayInfo = DAY_INFO.find(info => info.key === day.key);

        return {
          dayOfWeek: dayInfo?.dayOfWeek ?? 0,
          startTime: toApiTime(day.start),
          endTime: toApiTime(day.end),
        };
      });

      const response = await teacherApi.changeTeacherWorkHours({ schedules });

      if (!response.success) {
        const failMessage = response.message?.trim()
          ? response.message
          : response.code
            ? `근무시간 저장에 실패했어요. (code: ${response.code})`
            : '근무시간 저장에 실패했어요.';
        showToast(failMessage, 'error');
        return;
      }

      setSetting(prev => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          schedules: schedules.map(schedule => ({
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
          })),
        };
      });

      setInitialWorkdays(workdays);
      showToast('근무시간이 저장되었어요.', 'success');
    } catch (error) {
      const axiosError = error as AxiosError<{
        message?: string;
        error?: { message?: string };
      }>;
      const status = axiosError.response?.status;
      const serverMessage =
        axiosError.response?.data?.message ??
        axiosError.response?.data?.error?.message ??
        axiosError.message;
      showToast(
        `${serverMessage || '근무시간 저장에 실패했어요.'}${status ? ` (HTTP ${status})` : ''}`,
        'error'
      );
    } finally {
      setIsSavingWorkHours(false);
    }
  }, [isLoading, isSavingWorkHours, showToast, workdays]);

  const headerActions = useMemo(
    () => (
      <>
        <InlineButton
          variant="ghost"
          size="L"
          label="취소"
          disabled={isLoading || isSavingWorkHours}
          onClick={handleResetWorkHours}
        />
        <InlineButton
          variant="primary"
          size="L"
          label={isSavingWorkHours ? '저장 중...' : '변경사항 저장'}
          disabled={isLoading || isSavingWorkHours}
          onClick={() => {
            void handleSaveWorkHours();
          }}
        />
      </>
    ),
    [handleResetWorkHours, handleSaveWorkHours, isLoading, isSavingWorkHours]
  );

  useEffect(() => {
    setHeaderActions(headerActions);

    return () => {
      setHeaderActions(undefined);
    };
  }, [headerActions, setHeaderActions]);

  return (
    <PageContainer>
      <ContentArea>
        <CardSection>
          <SectionTitle>프로필 정보</SectionTitle>
          <ProfileRow>
            <AvatarCircle>{profileInitial}</AvatarCircle>
            <ProfileName>{profileName}</ProfileName>
          </ProfileRow>
        </CardSection>

        <CardSection>
          <SectionTitle>근무시간 설정</SectionTitle>
          <SectionDescription>
            학부모님들이 메시지를 보낼 때 참고할 수 있는 시간이에요. 근무 시간 외에는 확인이 늦어질
            수 있다는 안내를 해드려요.
          </SectionDescription>

          {isLoading ? <StateText>설정 정보를 불러오는 중이에요...</StateText> : null}
          {!isLoading && errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}

          {!isLoading && !errorMessage ? (
            <WorkdayList>
              {workdays.map(day => (
                <WorkdayRow key={day.key}>
                  <ToggleButton
                    type="button"
                    isEnabled={day.enabled}
                    aria-pressed={day.enabled}
                    aria-label={`${day.label}요일 근무시간 사용`}
                    onClick={() => handleToggleWorkday(day.key)}
                  >
                    <ToggleThumb isEnabled={day.enabled} />
                  </ToggleButton>

                  <DayLabel>{day.label}</DayLabel>

                  <TimeRange>
                    <TimeInput
                      type="text"
                      value={day.start}
                      placeholder={TIME_PLACEHOLDER}
                      inputMode="numeric"
                      maxLength={5}
                      disabled={!day.enabled}
                      onChange={event =>
                        handleChangeWorkdayTime(day.key, 'start', event.target.value)
                      }
                    />
                    <RangeSeparator>~</RangeSeparator>
                    <TimeInput
                      type="text"
                      value={day.end}
                      placeholder={TIME_PLACEHOLDER}
                      inputMode="numeric"
                      maxLength={5}
                      disabled={!day.enabled}
                      onChange={event =>
                        handleChangeWorkdayTime(day.key, 'end', event.target.value)
                      }
                    />
                  </TimeRange>
                </WorkdayRow>
              ))}
            </WorkdayList>
          ) : null}
        </CardSection>

        <CardSection>
          <ClassHeader>
            <SectionTitle>학급 관리</SectionTitle>
            <PrimaryActionButton type="button" onClick={handleOpenClassChangeModal}>
              학급 변경하기
            </PrimaryActionButton>
          </ClassHeader>

          <ClassInfoGrid>
            <InfoLabel>학교명</InfoLabel>
            <InfoValue>{setting?.schoolName?.trim() ? setting.schoolName : '-'}</InfoValue>
            <InfoLabel>학급</InfoLabel>
            <InfoValue>
              {setting?.grade != null && setting?.classNumber != null
                ? `${setting.grade}학년 ${setting.classNumber}반`
                : '-'}
            </InfoValue>
          </ClassInfoGrid>

          <Divider />

          <ClassCodeWrap>
            <InfoLabel>학급 코드</InfoLabel>
            <ClassCodeActions>
              <ClassCodeBadge>
                {setting?.classCode?.trim() ? setting.classCode : '-'}
              </ClassCodeBadge>
              <CodeCopyButton
                type="button"
                onClick={handleCopyClassCode}
                disabled={!setting?.classCode?.trim()}
              >
                <IcCopy />
                학급코드 복사하기
              </CodeCopyButton>
            </ClassCodeActions>
          </ClassCodeWrap>
        </CardSection>

        <CardSection>
          <SectionTitle>계정 관리</SectionTitle>
          <AccountLinkList>
            <AccountLinkButton type="button" onClick={handleLogout}>
              로그아웃
            </AccountLinkButton>
            <DangerLinkButton type="button">회원 탈퇴</DangerLinkButton>
          </AccountLinkList>
        </CardSection>
      </ContentArea>

      {isClassChangeModalOpen ? (
        <ModalOverlay onClick={handleCloseClassChangeModal}>
          <ModalCard onClick={event => event.stopPropagation()}>
            <ModalIconWrap>
              <IcChange />
            </ModalIconWrap>

            <ModalTitle>학급 변경</ModalTitle>
            <ModalDescription>
              새 학급 정보를 입력해주세요. 변경이 완료되면 새로운 학급 코드가 발급돼요.
            </ModalDescription>

            <ModalForm>
              <FormGroup>
                <FormLabel>
                  학교명 <RequiredAsterisk>*</RequiredAsterisk>
                </FormLabel>
                <FormInput
                  value={schoolNameInput}
                  onChange={event => setSchoolNameInput(event.target.value)}
                  placeholder="학교명을 입력해주세요."
                  autoComplete="off"
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <FormLabel>
                    학년 <RequiredAsterisk>*</RequiredAsterisk>
                  </FormLabel>
                  <FormSelect
                    value={gradeInput}
                    onChange={event => setGradeInput(event.target.value)}
                  >
                    <option value="">학년을 선택해주세요.</option>
                    <option value="1">1학년</option>
                    <option value="2">2학년</option>
                    <option value="3">3학년</option>
                    <option value="4">4학년</option>
                    <option value="5">5학년</option>
                    <option value="6">6학년</option>
                  </FormSelect>
                </FormGroup>

                <FormGroup>
                  <FormLabel>
                    반 <RequiredAsterisk>*</RequiredAsterisk>
                  </FormLabel>
                  <FormInput
                    value={classInput}
                    onChange={event => setClassInput(event.target.value)}
                    placeholder="2반"
                    autoComplete="off"
                  />
                </FormGroup>
              </FormRow>
            </ModalForm>

            <ModalButtonRow>
              <ModalGhostButton type="button" onClick={handleCloseClassChangeModal}>
                취소
              </ModalGhostButton>
              <ModalPrimaryButton
                type="button"
                disabled={!isClassChangeEnabled}
                onClick={handleOpenClassChangeConfirmModal}
              >
                변경하기
              </ModalPrimaryButton>
            </ModalButtonRow>
          </ModalCard>
        </ModalOverlay>
      ) : null}

      {isClassChangeConfirmModalOpen ? (
        <ModalOverlay onClick={handleCloseClassChangeConfirmModal}>
          <ModalCard onClick={event => event.stopPropagation()}>
            <ConfirmIconWrap>
              <IcInfo />
            </ConfirmIconWrap>

            <ModalTitle>학급을 변경할까요?</ModalTitle>
            <ModalDescription>
              학급을 변경하면 새로운 학급 코드가 발급돼요. 기존 학급 코드는 더 이상 사용할 수
              없어요.
            </ModalDescription>

            <ConfirmSummaryBox>
              <ConfirmSummaryRow>
                <ConfirmSummaryLabel>학교명</ConfirmSummaryLabel>
                <ConfirmSummaryValue>{schoolNameInput || '-'}</ConfirmSummaryValue>
              </ConfirmSummaryRow>
              <ConfirmSummaryRow>
                <ConfirmSummaryLabel>학급</ConfirmSummaryLabel>
                <ConfirmSummaryValue>{classSummaryText}</ConfirmSummaryValue>
              </ConfirmSummaryRow>
            </ConfirmSummaryBox>

            {classChangeErrorTitle ? (
              <ConfirmErrorBox role="alert">
                <ConfirmErrorIcon>
                  <IcError />
                </ConfirmErrorIcon>
                <ConfirmErrorTextWrap>
                  <ConfirmErrorTitle>{classChangeErrorTitle}</ConfirmErrorTitle>
                  <ConfirmErrorDescription>잠시 후 다시 시도해주세요.</ConfirmErrorDescription>
                </ConfirmErrorTextWrap>
              </ConfirmErrorBox>
            ) : null}

            <ModalButtonRow>
              <ModalGhostButton type="button" onClick={handleCloseClassChangeConfirmModal}>
                취소
              </ModalGhostButton>
              <ModalPrimaryButton
                type="button"
                onClick={handleConfirmClassChange}
                disabled={isClassChangeSubmitting}
              >
                {isClassChangeSubmitting ? '변경 중...' : '변경하기'}
              </ModalPrimaryButton>
            </ModalButtonRow>
          </ModalCard>
        </ModalOverlay>
      ) : null}

      {isClassChangeSuccessModalOpen ? (
        <ModalOverlay onClick={handleCloseClassChangeSuccessModal}>
          <ModalCard onClick={event => event.stopPropagation()}>
            <SuccessIconWrap>
              <IcCheck />
            </SuccessIconWrap>

            <ModalTitle>학급이 변경되었어요</ModalTitle>
            <ModalDescription>
              새로운 학급 코드가 발급되었어요.
              <br />
              학부모님께 새 코드를 전달해주세요.
            </ModalDescription>

            <SuccessCodeCard>
              <SuccessCodeMeta>
                {schoolNameInput || '-'} {classSummaryText}
              </SuccessCodeMeta>
              <SuccessCodeValue>{newClassCode || '-'}</SuccessCodeValue>
            </SuccessCodeCard>

            <SuccessCopyButton
              type="button"
              onClick={handleCopyNewClassCode}
              disabled={!newClassCode}
            >
              <IcCopy />
              학급코드 복사하기
            </SuccessCopyButton>

            <SuccessConfirmButton type="button" onClick={handleCloseClassChangeSuccessModal}>
              확인
            </SuccessConfirmButton>
          </ModalCard>
        </ModalOverlay>
      ) : null}
    </PageContainer>
  );
};

const PageContainer = styled.div`
  min-height: calc(100vh - 72px);
  padding: 24px;
  background: ${({ theme }) => theme.colors.background.bg2};
`;

const ContentArea = styled.div`
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CardSection = styled.section`
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.background.bg1};
  padding: 18px 16px;
`;

const SectionTitle = styled.h3`
  ${({ theme }) => theme.fonts.title4};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const SectionDescription = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.text.text4};
`;

const StateText = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 12px 0 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const ErrorText = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 12px 0 0;
  color: ${({ theme }) => theme.colors.semantic.error};
`;

const ProfileRow = styled.div`
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AvatarCircle = styled.span`
  ${({ theme }) => theme.fonts.labelXS};
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.teacherSettings.avatarBackground};
  color: ${({ theme }) => theme.colors.brand.dark};
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const ProfileName = styled.p`
  ${({ theme }) => theme.fonts.labelXS};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const WorkdayList = styled.div`
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const WorkdayRow = styled.div`
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  background: ${({ theme }) => theme.colors.teacherSettings.workdayRowBackground};
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 14px;

  @media (max-width: 760px) {
    flex-wrap: wrap;
    gap: 10px;
  }
`;

const ToggleButton = styled.button<{ isEnabled: boolean }>`
  width: 44px;
  height: 26px;
  border: none;
  border-radius: 999px;
  padding: 3px;
  background: ${({ isEnabled, theme }) =>
    isEnabled ? theme.colors.brand.primary : theme.colors.teacherSettings.toggleOffBackground};
  display: flex;
  align-items: center;
  justify-content: ${({ isEnabled }) => (isEnabled ? 'flex-end' : 'flex-start')};
  cursor: pointer;
`;

const ToggleThumb = styled.span<{ isEnabled: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: ${({ isEnabled, theme }) =>
    isEnabled
      ? theme.colors.background.bg1
      : theme.colors.teacherSettings.toggleThumbOffBackground};
  box-shadow: ${({ theme }) => theme.colors.shadow.toggleThumb};
`;

const DayLabel = styled.span`
  ${({ theme }) => theme.fonts.labelXS};
  min-width: 20px;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const TimeRange = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 760px) {
    width: 100%;
    margin-left: 0;
  }
`;

const TimeInput = styled.input`
  ${({ theme }) => theme.fonts.body2};
  width: 160px;
  border: 1px solid ${({ theme }) => theme.colors.border.border2};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.background.bg1};
  color: ${({ theme }) => theme.colors.text.text2};
  padding: 10px 12px;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.text4};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.teacherSettings.inputDisabledBackground};
    color: ${({ theme }) => theme.colors.text.text4};
    cursor: not-allowed;
  }

  @media (max-width: 760px) {
    width: 100%;
  }
`;

const RangeSeparator = styled.span`
  ${({ theme }) => theme.fonts.body2};
  color: ${({ theme }) => theme.colors.text.text2};
`;

const ClassHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const PrimaryActionButton = styled.button`
  ${({ theme }) => theme.fonts.labelXS};
  border: none;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.brand.primary};
  color: ${({ theme }) => theme.colors.text.textW};
  padding: 10px 14px;
`;

const ClassInfoGrid = styled.div`
  margin-top: 18px;
  display: grid;
  grid-template-columns: auto 1fr;
  row-gap: 10px;
  column-gap: 12px;
`;

const InfoLabel = styled.p`
  ${({ theme }) => theme.fonts.labelXS};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text2};
`;

const InfoValue = styled.p`
  ${({ theme }) => theme.fonts.body2};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const Divider = styled.hr`
  margin: 16px 0;
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.divider.divider2};
`;

const ClassCodeWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ClassCodeActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ClassCodeBadge = styled.span`
  ${({ theme }) => theme.fonts.labelS};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.teacherSettings.classCodeBadgeBorder};
  background: ${({ theme }) => theme.colors.teacherSettings.classCodeBadgeBackground};
  color: ${({ theme }) => theme.colors.text.text1};
  padding: 10px 18px;
`;

const CodeCopyButton = styled.button`
  ${({ theme }) => theme.fonts.labelXS};
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.background.bg1};
  color: ${({ theme }) => theme.colors.text.text1};
  padding: 10px 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const AccountLinkList = styled.div`
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
`;

const AccountLinkButton = styled.button`
  ${({ theme }) => theme.fonts.body2};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const DangerLinkButton = styled.button`
  ${({ theme }) => theme.fonts.body2};
  color: ${({ theme }) => theme.colors.semantic.error};
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: ${({ theme }) => theme.colors.overlay.dim2};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ModalCard = styled.section`
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.background.bg1};
  box-shadow: ${({ theme }) => theme.colors.shadow.modalLarge};
  padding: 28px 28px 24px;
`;

const ModalIconWrap = styled.div`
  width: 58px;
  height: 58px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.teacherSettings.modalIconBackground};
  color: ${({ theme }) => theme.colors.brand.dark};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;

  svg {
    width: 30px;
    height: 30px;
  }
`;

const ConfirmIconWrap = styled(ModalIconWrap)`
  background: ${({ theme }) => theme.colors.teacherSettings.confirmIconBackground};
  color: ${({ theme }) => theme.colors.teacherSettings.confirmIconColor};
`;

const SuccessIconWrap = styled(ModalIconWrap)`
  background: ${({ theme }) => theme.colors.teacherSettings.modalIconBackground};
  color: ${({ theme }) => theme.colors.brand.dark};
`;

const ModalTitle = styled.h4`
  ${({ theme }) => theme.fonts.labelM};
  margin: 16px 0 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const ModalDescription = styled.p`
  ${({ theme }) => theme.fonts.body2};
  margin: 12px 0 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const ModalForm = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const FormGroup = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.span`
  ${({ theme }) => theme.fonts.labelXS};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const RequiredAsterisk = styled.span`
  color: ${({ theme }) => theme.colors.semantic.error};
`;

const FormInput = styled.input`
  ${({ theme }) => theme.fonts.body2};
  width: 100%;
  min-width: 0;
  display: block;
  border: 1px solid ${({ theme }) => theme.colors.border.border2};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.background.bg1};
  color: ${({ theme }) => theme.colors.text.text1};
  padding: 10px 12px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.text4};
  }
`;

const FormSelect = styled.select`
  ${({ theme }) => theme.fonts.body2};
  width: 100%;
  min-width: 0;
  display: block;
  border: 1px solid ${({ theme }) => theme.colors.border.border2};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.background.bg1};
  color: ${({ theme }) => theme.colors.text.text1};
  padding: 10px 12px;
`;

const ConfirmSummaryBox = styled.div`
  margin-top: 18px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.teacherSettings.confirmSummaryBorder};
  background: ${({ theme }) => theme.colors.teacherSettings.confirmSummaryBackground};
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ConfirmSummaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const ConfirmSummaryLabel = styled.span`
  ${({ theme }) => theme.fonts.labelXS};
  color: ${({ theme }) => theme.colors.brand.dark};
`;

const ConfirmSummaryValue = styled.span`
  ${({ theme }) => theme.fonts.labelXS};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const ConfirmErrorBox = styled.div`
  margin-top: 14px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.teacherSettings.confirmErrorBorder};
  background: ${({ theme }) => theme.colors.teacherSettings.confirmErrorBackground};
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ConfirmErrorIcon = styled.span`
  display: inline-flex;
  color: ${({ theme }) => theme.colors.semantic.error};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ConfirmErrorTextWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ConfirmErrorTitle = styled.p`
  ${({ theme }) => theme.fonts.labelXS};
  margin: 0;
  color: ${({ theme }) => theme.colors.semantic.error};
`;

const ConfirmErrorDescription = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 0;
  color: ${({ theme }) => theme.colors.semantic.error};
`;

const SuccessCodeCard = styled.div`
  margin-top: 16px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.teacherSettings.confirmSummaryBorder};
  background: ${({ theme }) => theme.colors.teacherSettings.confirmSummaryBackground};
  padding: 14px;
  text-align: center;
`;

const SuccessCodeMeta = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 0;
  color: ${({ theme }) => theme.colors.brand.dark};
`;

const SuccessCodeValue = styled.p`
  ${({ theme }) => theme.fonts.labelL};
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const SuccessCopyButton = styled.button`
  ${({ theme }) => theme.fonts.labelXS};
  margin-top: 10px;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.background.bg1};
  color: ${({ theme }) => theme.colors.text.text1};
  padding: 11px 12px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 8px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const SuccessConfirmButton = styled.button`
  ${({ theme }) => theme.fonts.labelXS};
  margin-top: 14px;
  width: 100%;
  border: none;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.brand.primary};
  color: ${({ theme }) => theme.colors.text.textW};
  padding: 11px 12px;
`;

const ModalButtonRow = styled.div`
  margin-top: 22px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const ModalGhostButton = styled.button`
  ${({ theme }) => theme.fonts.labelXS};
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.background.bg1};
  color: ${({ theme }) => theme.colors.text.text1};
  padding: 11px 12px;
`;

const ModalPrimaryButton = styled.button`
  ${({ theme }) => theme.fonts.labelXS};
  border: none;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.brand.primary};
  color: ${({ theme }) => theme.colors.text.textW};
  padding: 11px 12px;

  &:disabled {
    background: ${({ theme }) => theme.colors.teacherSettings.primaryDisabledBackground};
    color: ${({ theme }) => theme.colors.teacherSettings.primaryDisabledText};
    cursor: not-allowed;
  }
`;
