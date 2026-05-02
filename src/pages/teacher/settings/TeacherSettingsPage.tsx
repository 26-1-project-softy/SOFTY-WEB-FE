import styled from '@emotion/styled';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { useOutletContext } from 'react-router-dom';
import { InlineButton } from '@/components/common/InlineButton';
import { TextField } from '@/components/common/TextField';
import { ToggleSwitch } from '@/components/common/ToggleSwitch';
import { IcChange, IcCheck, IcCopy, IcError, IcInfo } from '@/icons';
import type { AppLayoutOutletContext } from '@/layouts/AppLayout';
import { teacherApi, type TeacherSetting } from '@/services/teacher/teacherApi';
import { useToast } from '@/hooks/useToast';
import { useTeacherWithdraw } from '@/features/teacher/settings/hooks/useTeacherWithdraw';

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
  { key: 'mon', dayOfWeek: 1, label: '��' },
  { key: 'tue', dayOfWeek: 2, label: 'ȭ' },
  { key: 'wed', dayOfWeek: 3, label: '��' },
  { key: 'thu', dayOfWeek: 4, label: '��' },
  { key: 'fri', dayOfWeek: 5, label: '��' },
  { key: 'sat', dayOfWeek: 6, label: '��' },
  { key: 'sun', dayOfWeek: 7, label: '��' },
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
  const {
    isWithdrawModalOpen,
    isWithdrawing,
    withdrawErrorMessage,
    handleOpenWithdrawModal,
    handleCloseWithdrawModal,
    handleConfirmWithdraw,
    handleLogout,
  } = useTeacherWithdraw();
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
        setErrorMessage(axiosError.response?.data?.message || '���� ������ �ҷ����� ���߾��.');
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

    return `${gradeInput}�г� ${classInput}`;
  }, [classInput, gradeInput]);

  const handleOpenClassChangeModal = () => {
    setSchoolNameInput(setting?.schoolName ?? '');
    setGradeInput(setting?.grade != null ? String(setting.grade) : '');
    setClassInput(setting?.classNumber != null ? `${setting.classNumber}��` : '');
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
      setClassChangeErrorTitle('�� ������ Ȯ�����ּ���.');
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
        setClassChangeErrorTitle(response.message || '�б� ���濡 �����߾��.');
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
      setClassChangeErrorTitle(axiosError.response?.data?.message || '�б� ���濡 �����߾��.');
    } finally {
      setIsClassChangeSubmitting(false);
    }
  };

  const copyClassCodeWithToast = async (rawClassCode: string | null | undefined) => {
    const classCode = rawClassCode?.trim();

    if (!classCode) {
      showToast('������ �б��ڵ尡 �����.', 'error');
      return;
    }

    if (!navigator.clipboard) {
      showToast('���� ������������ ���縦 �������� �ʾƿ�.', 'error');
      return;
    }

    try {
      await navigator.clipboard.writeText(classCode);
      showToast('�б��ڵ带 �����߾��.', 'success');
    } catch {
      showToast('�б��ڵ� ���翡 �����߾��.', 'error');
    }
  };

  const handleCopyClassCode = async () => {
    await copyClassCodeWithToast(setting?.classCode);
  };

  const handleCopyNewClassCode = async () => {
    await copyClassCodeWithToast(newClassCode);
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
  const hasWorkHoursChanges = useMemo(() => {
    if (initialWorkdays.length !== workdays.length) {
      return true;
    }

    return workdays.some((day, index) => {
      const initialDay = initialWorkdays[index];

      if (!initialDay) {
        return true;
      }

      return (
        day.key !== initialDay.key ||
        day.enabled !== initialDay.enabled ||
        day.start !== initialDay.start ||
        day.end !== initialDay.end
      );
    });
  }, [initialWorkdays, workdays]);
  const handleResetWorkHours = useCallback(() => {
    if (isLoading || !hasWorkHoursChanges) {
      return;
    }

    setWorkdays(initialWorkdays);
    showToast('�ٹ��ð� �Է°��� �ǵ��Ⱦ��.', 'success');
  }, [hasWorkHoursChanges, initialWorkdays, isLoading, showToast]);

  const handleSaveWorkHours = useCallback(async () => {
    if (isLoading || isSavingWorkHours || !hasWorkHoursChanges) {
      return;
    }

    const enabledWorkdays = workdays.filter(day => day.enabled);
    if (enabledWorkdays.length === 0) {
      showToast('�ٹ� ������ 1�� �̻� Ȱ��ȭ���ּ���.', 'error');
      return;
    }

    const invalidWorkday = enabledWorkdays.find(
      day => !isValidTimeFormat(day.start) || !isValidTimeFormat(day.end)
    );

    if (invalidWorkday) {
      showToast(`${invalidWorkday.label}���� �ð��� HH:mm �������� �Է����ּ���.`, 'error');
      return;
    }

    const invalidOrderWorkday = enabledWorkdays.find(
      day => toMinutes(day.start) >= toMinutes(day.end)
    );
    if (invalidOrderWorkday) {
      showToast(`${invalidOrderWorkday.label}���� ���� �ð��� ���� �ð����� �ʾ�� �ؿ�.`, 'error');
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
            ? `�ٹ��ð� ���忡 �����߾��. (code: ${response.code})`
            : '�ٹ��ð� ���忡 �����߾��.';
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
      showToast('�ٹ��ð��� ����Ǿ����.', 'success');
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
        `${serverMessage || '�ٹ��ð� ���忡 �����߾��.'}${status ? ` (HTTP ${status})` : ''}`,
        'error'
      );
    } finally {
      setIsSavingWorkHours(false);
    }
  }, [hasWorkHoursChanges, isLoading, isSavingWorkHours, showToast, workdays]);

  useEffect(() => {
    setHeaderActions(undefined);

    return () => {
      setHeaderActions(undefined);
    };
  }, [setHeaderActions]);

  return (
    <PageContainer>
      <ContentArea>
        <CardSection>
          <SectionTitle>������ ����</SectionTitle>
          <ProfileRow>
            <AvatarCircle>{profileInitial}</AvatarCircle>
            <ProfileName>{profileName}</ProfileName>
          </ProfileRow>
        </CardSection>

        <CardSection>
          <SectionHeader>
            <SectionTitle>�ٹ��ð� ����</SectionTitle>
            <SectionActionGroup>
              <InlineButton
                variant="ghost"
                size="L"
                label="���"
                disabled={isLoading || isSavingWorkHours || !hasWorkHoursChanges}
                onClick={handleResetWorkHours}
              />
              <InlineButton
                variant="primary"
                size="L"
                label={isSavingWorkHours ? '���� ��...' : '������� ����'}
                disabled={isLoading || isSavingWorkHours || !hasWorkHoursChanges}
                onClick={() => {
                  void handleSaveWorkHours();
                }}
              />
            </SectionActionGroup>
          </SectionHeader>
          <SectionDescription>
            �кθ�Ե��� �޽����� ���� �� ������ �� �ִ� �ð��̿���. �ٹ� �ð� �ܿ��� Ȯ���� �ʾ��� �� �ִٴ� �ȳ���
            �ص����.
          </SectionDescription>

          {isLoading ? <StateText>���� ������ �ҷ����� ���̿���...</StateText> : null}
          {!isLoading && errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}

          {!isLoading && !errorMessage ? (
            <WorkdayList>
              {workdays.map(day => (
                <WorkdayRow key={day.key}>
                  <ToggleSwitch
                    checked={day.enabled}
                    ariaLabel={`${day.label} ���� �ٹ��ð� ���`}
                    onToggle={() => handleToggleWorkday(day.key)}
                  />

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
          <SectionHeader>
            <SectionTitle>�б� ����</SectionTitle>
            <InlineButton
              type="button"
              variant="primary"
              size="L"
              label="�б� �����ϱ�"
              onClick={handleOpenClassChangeModal}
            />
          </SectionHeader>

          <ClassInfoGrid>
            <InfoLabel>�б���</InfoLabel>
            <InfoValue>{setting?.schoolName?.trim() ? setting.schoolName : '-'}</InfoValue>
            <InfoLabel>�б�</InfoLabel>
            <InfoValue>
              {setting?.grade != null && setting?.classNumber != null
                ? `${setting.grade}�г� ${setting.classNumber}��`
                : '-'}
            </InfoValue>
          </ClassInfoGrid>

          <Divider />

          <ClassCodeWrap>
            <InfoLabel>�б� �ڵ�</InfoLabel>
            <ClassCodeActions>
              <ClassCodeBadge>
                {setting?.classCode?.trim() ? setting.classCode : '-'}
              </ClassCodeBadge>
              <CodeCopyButton
                type="button"
                variant="ghost"
                size="L"
                icon={IcCopy}
                label="�б��ڵ� �����ϱ�"
                onClick={handleCopyClassCode}
              />
            </ClassCodeActions>
          </ClassCodeWrap>
        </CardSection>

        <CardSection>
          <SectionTitle>���� ����</SectionTitle>
          <AccountLinkList>
            <AccountLinkButton
              type="button"
              variant="text"
              size="L"
              label="�α׾ƿ�"
              onClick={handleLogout}
            />
            <DangerLinkButton
              type="button"
              variant="text"
              size="L"
              label="ȸ�� Ż��"
              onClick={handleOpenWithdrawModal}
            />
          </AccountLinkList>
        </CardSection>
      </ContentArea>

      {isWithdrawModalOpen ? (
        <ModalOverlay onClick={handleCloseWithdrawModal}>
          <ModalCard onClick={event => event.stopPropagation()}>
            <ConfirmIconWrap>
              <IcInfo />
            </ConfirmIconWrap>

            <ModalTitle>ȸ�� Ż���Ͻðھ��?</ModalTitle>
            <ModalDescription>
              Ż���ϸ� ���� ������ �����Ǹ� ������ �� �����.
              <br />
              ���� Ż���Ͻ÷��� �Ʒ� ��ư�� ���� �ּ���.
            </ModalDescription>

            {withdrawErrorMessage ? (
              <ConfirmErrorBox role="alert">
                <ConfirmErrorIcon>
                  <IcError />
                </ConfirmErrorIcon>
                <ConfirmErrorTextWrap>
                  <ConfirmErrorTitle>{withdrawErrorMessage}</ConfirmErrorTitle>
                  <ConfirmErrorDescription>��� �� �ٽ� �õ��� �ּ���.</ConfirmErrorDescription>
                </ConfirmErrorTextWrap>
              </ConfirmErrorBox>
            ) : null}

            <ModalButtonRow>
              <ModalGhostButton
                type="button"
                variant="ghost"
                size="L"
                label="���"
                onClick={handleCloseWithdrawModal}
              />
              <ModalPrimaryButton
                type="button"
                variant="primary"
                size="L"
                label={isWithdrawing ? 'Ż�� ��...' : 'ȸ�� Ż��'}
                onClick={() => {
                  void handleConfirmWithdraw();
                }}
                disabled={isWithdrawing}
              />
            </ModalButtonRow>
          </ModalCard>
        </ModalOverlay>
      ) : null}

      {isClassChangeModalOpen ? (
        <ModalOverlay onClick={handleCloseClassChangeModal}>
          <ModalCard onClick={event => event.stopPropagation()}>
            <ModalIconWrap>
              <IcChange />
            </ModalIconWrap>

            <ModalTitle>�б� ����</ModalTitle>
            <ModalDescription>
              �� �б� ������ �Է����ּ���. ������ �Ϸ�Ǹ� ���ο� �б� �ڵ尡 �߱޵ſ�.
            </ModalDescription>

            <ModalForm>
              <FormGroup>
                <FormLabel>
                  �б��� <RequiredAsterisk>*</RequiredAsterisk>
                </FormLabel>
                <FormInput
                  value={schoolNameInput}
                  onChange={event => setSchoolNameInput(event.target.value)}
                  placeholder="�б����� �Է����ּ���."
                  autoComplete="off"
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <FormLabel>
                    �г� <RequiredAsterisk>*</RequiredAsterisk>
                  </FormLabel>
                  <FormSelect
                    value={gradeInput}
                    onChange={event => setGradeInput(event.target.value)}
                  >
                    <option value="">�г��� �������ּ���.</option>
                    <option value="1">1�г�</option>
                    <option value="2">2�г�</option>
                    <option value="3">3�г�</option>
                    <option value="4">4�г�</option>
                    <option value="5">5�г�</option>
                    <option value="6">6�г�</option>
                  </FormSelect>
                </FormGroup>

                <FormGroup>
                  <FormLabel>
                    �� <RequiredAsterisk>*</RequiredAsterisk>
                  </FormLabel>
                  <FormInput
                    value={classInput}
                    onChange={event => setClassInput(event.target.value)}
                    placeholder="2��"
                    autoComplete="off"
                  />
                </FormGroup>
              </FormRow>
            </ModalForm>

            <ModalButtonRow>
              <ModalGhostButton
                type="button"
                variant="ghost"
                size="L"
                label="���"
                onClick={handleCloseClassChangeModal}
              />
              <ModalPrimaryButton
                type="button"
                variant="primary"
                size="L"
                label="�����ϱ�"
                disabled={!isClassChangeEnabled}
                onClick={handleOpenClassChangeConfirmModal}
              />
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

            <ModalTitle>�б��� �����ұ��?</ModalTitle>
            <ModalDescription>
              �б��� �����ϸ� ���ο� �б� �ڵ尡 �߱޵ſ�. ���� �б� �ڵ�� �� �̻� ����� �� �����.
            </ModalDescription>

            <ConfirmSummaryBox>
              <ConfirmSummaryRow>
                <ConfirmSummaryLabel>�б���</ConfirmSummaryLabel>
                <ConfirmSummaryValue>{schoolNameInput || '-'}</ConfirmSummaryValue>
              </ConfirmSummaryRow>
              <ConfirmSummaryRow>
                <ConfirmSummaryLabel>�б�</ConfirmSummaryLabel>
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
                  <ConfirmErrorDescription>��� �� �ٽ� �õ����ּ���.</ConfirmErrorDescription>
                </ConfirmErrorTextWrap>
              </ConfirmErrorBox>
            ) : null}

            <ModalButtonRow>
              <ModalGhostButton
                type="button"
                variant="ghost"
                size="L"
                label="���"
                onClick={handleCloseClassChangeConfirmModal}
              />
              <ModalPrimaryButton
                type="button"
                variant="primary"
                size="L"
                label={isClassChangeSubmitting ? '���� ��...' : '�����ϱ�'}
                onClick={handleConfirmClassChange}
                disabled={isClassChangeSubmitting}
              />
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

            <ModalTitle>�б��� ����Ǿ����</ModalTitle>
            <ModalDescription>
              ���ο� �б� �ڵ尡 �߱޵Ǿ����.
              <br />
              �кθ�Բ� �� �ڵ带 �������ּ���.
            </ModalDescription>

            <SuccessCodeCard>
              <SuccessCodeMeta>
                {schoolNameInput || '-'} {classSummaryText}
              </SuccessCodeMeta>
              <SuccessCodeValue>{newClassCode || '-'}</SuccessCodeValue>
            </SuccessCodeCard>

            <SuccessCopyButton
              type="button"
              variant="ghost"
              size="L"
              width="100%"
              icon={IcCopy}
              label="�б��ڵ� �����ϱ�"
              onClick={handleCopyNewClassCode}
            />

            <SuccessConfirmButton
              type="button"
              variant="primary"
              size="L"
              width="100%"
              label="Ȯ��"
              onClick={handleCloseClassChangeSuccessModal}
            />
          </ModalCard>
        </ModalOverlay>
      ) : null}

      {isWithdrawModalOpen ? (
        <ModalOverlay onClick={handleCloseWithdrawModal}>
          <ModalCard onClick={event => event.stopPropagation()}>
            <WithdrawIconWrap>
              <IcError />
            </WithdrawIconWrap>

            <ModalTitle>���� Ż���Ͻðھ��?</ModalTitle>
            <ModalDescription>
              Ż���ϸ� �б� ������ ��ȭ ������ ��� �����ǰ�, �ٽ� ������ �� �����.
            </ModalDescription>

            {withdrawErrorMessage ? (
              <WithdrawErrorText role="alert">{withdrawErrorMessage}</WithdrawErrorText>
            ) : null}

            <ModalButtonRow>
              <ModalGhostButton
                type="button"
                variant="ghost"
                size="L"
                label="���"
                onClick={handleCloseWithdrawModal}
              />
              <WithdrawConfirmButton
                type="button"
                variant="primary"
                size="L"
                label={isWithdrawing ? 'Ż�� ��...' : 'Ż���ϱ�'}
                onClick={() => {
                  void handleConfirmWithdraw();
                }}
                disabled={isWithdrawing}
              />
            </ModalButtonRow>
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
  background: ${({ theme }) => theme.colors.background.bg4};
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
  background: ${({ theme }) => theme.colors.background.bg3};
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 14px;

  @media (max-width: 760px) {
    flex-wrap: wrap;
    gap: 10px;
  }
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

const TimeInput = styled(TextField)`
  width: 160px;
  gap: 0;

  input {
    color: ${({ theme }) => theme.colors.text.text2};
  }

  input:disabled {
    background: ${({ theme }) => theme.colors.background.bg3};
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

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const SectionActionGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
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
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  background: ${({ theme }) => theme.colors.background.bg4};
  color: ${({ theme }) => theme.colors.text.text1};
  padding: 10px 18px;
`;

const CodeCopyButton = styled(InlineButton)`
  height: 42px;
  padding: 10px 12px;
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

const AccountLinkButton = styled(InlineButton)`
  padding: 0;
  height: auto;
  justify-content: flex-start;
`;

const DangerLinkButton = styled(InlineButton)`
  padding: 0;
  height: auto;
  justify-content: flex-start;

  span {
    color: ${({ theme }) => theme.colors.semantic.error};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: ${({ theme }) => theme.colors.overlay.dim};
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
  background: ${({ theme }) => theme.colors.background.bg4};
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
  background: ${({ theme }) => theme.colors.semantic.warningSoft};
  color: ${({ theme }) => theme.colors.semantic.warning};
`;

const SuccessIconWrap = styled(ModalIconWrap)`
  background: ${({ theme }) => theme.colors.background.bg4};
  color: ${({ theme }) => theme.colors.brand.dark};
`;

const WithdrawIconWrap = styled(ModalIconWrap)`
  background: ${({ theme }) => theme.colors.semantic.errorSoft};
  color: ${({ theme }) => theme.colors.semantic.error};
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

const FormInput = styled(TextField)`
  width: 100%;
  gap: 0;
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
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  background: ${({ theme }) => theme.colors.background.bg4};
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
  border: 1px solid ${({ theme }) => theme.colors.semantic.error};
  background: ${({ theme }) => theme.colors.semantic.errorSoft};
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
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  background: ${({ theme }) => theme.colors.background.bg4};
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

const SuccessCopyButton = styled(InlineButton)`
  margin-top: 10px;
  height: 42px;
  svg {
    width: 16px;
    height: 16px;
  }
`;

const SuccessConfirmButton = styled(InlineButton)`
  margin-top: 14px;
  height: 42px;
`;

const ModalButtonRow = styled.div`
  margin-top: 22px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const ModalGhostButton = styled(InlineButton)`
  width: 100%;
  height: 42px;
`;

const ModalPrimaryButton = styled(InlineButton)`
  width: 100%;
  height: 42px;
`;

const WithdrawConfirmButton = styled(ModalPrimaryButton)`
  background: ${({ theme }) => theme.colors.semantic.error};

  &:disabled {
    background: ${({ theme }) => theme.colors.semantic.error};
    color: ${({ theme }) => theme.colors.text.textW};
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const WithdrawErrorText = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 12px 0 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.semantic.error};
`;
