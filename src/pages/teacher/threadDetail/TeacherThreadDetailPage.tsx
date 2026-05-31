import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useThreadDetail } from '@/features/teacher/threadDetail/hooks/useThreadDetail';
import { ChatHeader } from '@/components/teacher/threadDetail/ChatHeader';
import { ChatInput } from '@/components/teacher/threadDetail/ChatInput';
import { ChatMessageList } from '@/components/teacher/threadDetail/ChatMessageList';
import { InlineButton } from '@/components/common/InlineButton';
import { Alert } from '@/components/common/Alert';
import { Dialog } from '@/components/common/Dialog';
import { DialogHeader } from '@/components/common/DialogHeader';
import { DialogFooter } from '@/components/common/DialogFooter';
import { INQUIRY_STATUS } from '@/constants/inquiryStatus';
import { ROUTES } from '@/constants/routes';
import { IcInfo, IcSparkles } from '@/icons';
import { HEADER_HEIGHT } from '@/constants/layout';

export const TeacherThreadDetailPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { threadId } = useParams();
  const chatRoomId = useMemo(() => Number(threadId), [threadId]);

  const {
    status,
    isStatusMenuOpen,
    isStatusUpdating,
    isStatusConfirmDialogOpen,
    messageInput,
    analysisResult,
    analysisFeedbackScore,
    isFeedbackSubmitting,
    feedbackSaved,
    feedbackErrorMessage,
    analysisErrorMessage,
    sendErrorMessage,
    isAnalysisRequesting,
    loadState,
    detailErrorMessage,
    counterpartName,
    studentName,
    intentLabel,
    intentType,
    messages,
    messagesError,
    messagesPartialError,
    isMessagesLoading,
    isMessagesLoadingMore,
    messagesHasNext,
    composerActionMode,
    isComposerActionDisabled,
    isUnsafeRisk,
    scrollToLatestRequestKey,
    setIsStatusMenuOpen,
    handleMessageInputChange,
    handleComposerActionClick,
    handleRetryAnalysis,
    handleApplyRecommendedReply,
    handleAnalysisFeedbackClick,
    handleRetryFeedback,
    handleLoadMoreMessages,
    handleRetryMissingMessages,
    handleRetryConversation,
    handleSelectStatus,
    handleCloseStatusConfirmDialog,
    handleConfirmStatusChange,
  } = useThreadDetail({ chatRoomId });

  const isChatCompleted = status === INQUIRY_STATUS.COMPLETED;

  return (
    <ThreadDetailPageContainer>
      <ChatHeader
        counterpartName={counterpartName}
        studentName={studentName}
        intentLabel={intentLabel}
        intentType={intentType}
        status={status}
        isStatusMenuOpen={isStatusMenuOpen}
        onBack={() => navigate(ROUTES.teacherThreadList)}
        onToggleStatusMenu={() => setIsStatusMenuOpen(prev => !prev)}
        onSelectStatus={handleSelectStatus}
      />

      <ThreadBody>
        <ConversationPanel>
          <ChatMessageList
            key={chatRoomId}
            loadState={loadState}
            detailErrorMessage={detailErrorMessage}
            isMessagesLoading={isMessagesLoading}
            messagesError={messagesError}
            messagesPartialError={messagesPartialError}
            messagesHasNext={messagesHasNext}
            isMessagesLoadingMore={isMessagesLoadingMore}
            messages={messages}
            scrollToLatestRequestKey={scrollToLatestRequestKey}
            isChatCompleted={isChatCompleted}
            onRetryConversation={() => void handleRetryConversation()}
            onRetryMissingMessages={handleRetryMissingMessages}
            onLoadMoreMessages={handleLoadMoreMessages}
          />

          {!isChatCompleted ? (
            <ChatInput
              value={messageInput}
              onChange={handleMessageInputChange}
              actionMode={composerActionMode}
              isActionDisabled={isComposerActionDisabled}
              onActionClick={handleComposerActionClick}
              errorMessage={sendErrorMessage}
            />
          ) : null}
        </ConversationPanel>

        <AssistantPanel>
          <AssistantHeader>
            <IcSparkles />
            <span>AI 소통 어시스턴트</span>
          </AssistantHeader>

          <AssistantBody>
            {isAnalysisRequesting ? (
              <AssistantAnalyzing>
                <AnalyzingDots aria-hidden>
                  <span />
                  <span />
                  <span />
                </AnalyzingDots>
                <AssistantAnalyzingTitle>메시지를 살펴보고 있어요</AssistantAnalyzingTitle>
                <AssistantAnalyzingText>
                  표현의 톤과 오해 소지를 점검하고 있어요.
                </AssistantAnalyzingText>
              </AssistantAnalyzing>
            ) : null}

            {!isAnalysisRequesting && !analysisResult && !analysisErrorMessage ? (
              <AssistantEmpty>
                <IcSparkles />
                <AssistantEmptyTitle>아직 분석할 메시지가 없어요</AssistantEmptyTitle>
                <AssistantEmptyText>
                  메시지를 작성하면 분쟁 가능성을 살펴보고, 필요한 경우 더 부드러운 답장을
                  추천드려요.
                </AssistantEmptyText>
              </AssistantEmpty>
            ) : null}

            {!isAnalysisRequesting && !analysisResult && analysisErrorMessage ? (
              <AnalysisResultSection>
                <AnalysisTitle>AI 분쟁 가능성 분석</AnalysisTitle>
                <Alert
                  title={analysisErrorMessage}
                  description="잠시 후 다시 시도해 주세요."
                  variant="error"
                  onRetry={isAnalysisRequesting ? undefined : handleRetryAnalysis}
                />
              </AnalysisResultSection>
            ) : null}

            {!isAnalysisRequesting && analysisResult ? (
              <AnalysisResultSection>
                <AnalysisTitle>AI 분쟁 가능성 분석</AnalysisTitle>

                <LowRiskCard $risk={isUnsafeRisk ? 'high' : 'low'}>
                  <LowRiskTitle $risk={isUnsafeRisk ? 'high' : 'low'}>
                    {analysisResult.title}
                  </LowRiskTitle>
                  <LowRiskDescription>{analysisResult.description}</LowRiskDescription>
                </LowRiskCard>

                <FeedbackSection>
                  <FeedbackQuestion>분쟁 가능성 분석 결과가 얼마나 적절했나요?</FeedbackQuestion>
                  <FeedbackScale>
                    {[1, 2, 3, 4, 5].map(score => (
                      <FeedbackScoreButton
                        key={score}
                        type="button"
                        $selected={analysisFeedbackScore === score}
                        onClick={() => void handleAnalysisFeedbackClick(score)}
                        aria-pressed={analysisFeedbackScore === score}
                        disabled={isFeedbackSubmitting}
                      >
                        {score}
                      </FeedbackScoreButton>
                    ))}
                  </FeedbackScale>

                  <FeedbackLabels>
                    <span>매우 부적절</span>
                    <span>매우 적절</span>
                  </FeedbackLabels>

                  {analysisFeedbackScore != null && feedbackSaved ? (
                    <FeedbackAppliedBox role="status" aria-live="polite">
                      <FeedbackAppliedIcon>
                        <IcInfo />
                      </FeedbackAppliedIcon>
                      <FeedbackAppliedTextArea>
                        <FeedbackAppliedTitle>의견이 반영되었어요</FeedbackAppliedTitle>
                        <FeedbackAppliedDescription>
                          보내주신 피드백은 분석 품질 개선에 활용돼요.
                        </FeedbackAppliedDescription>
                      </FeedbackAppliedTextArea>
                    </FeedbackAppliedBox>
                  ) : null}

                  {analysisFeedbackScore != null && !feedbackSaved && feedbackErrorMessage ? (
                    <Alert
                      title={feedbackErrorMessage}
                      description="잠시 후 다시 시도해 주세요."
                      variant="error"
                      onRetry={isFeedbackSubmitting ? undefined : handleRetryFeedback}
                    />
                  ) : null}
                </FeedbackSection>

                {isUnsafeRisk ? (
                  <RecommendSection>
                    <RecommendTitle>AI 추천 답변</RecommendTitle>
                    <RecommendCard>
                      {analysisResult.recommendedMessage ||
                        '학부모님, 안내해주신 내용을 바탕으로 확인 후 정확하게 다시 안내드리겠습니다.'}
                    </RecommendCard>
                    <InlineButton
                      variant="ghost"
                      size="M"
                      width="100%"
                      label="적용하기"
                      onClick={handleApplyRecommendedReply}
                    />
                  </RecommendSection>
                ) : null}
              </AnalysisResultSection>
            ) : null}
          </AssistantBody>
        </AssistantPanel>
      </ThreadBody>

      <Dialog isOpen={isStatusConfirmDialogOpen} onClose={handleCloseStatusConfirmDialog}>
        <DialogHeader
          icon={IcInfo}
          iconBgColor={theme.colors.background.bg4}
          iconColor={theme.colors.brand.primary}
          title="문의를 완료 처리할까요?"
          description={`완료 처리하면 이 채팅방에서는 더 이상 메시지를 보낼 수 없어요. 필요한 경우 다시 처리중으로 변경할 수 있어요.`}
        />

        <DialogFooter>
          <InlineButton
            variant="ghost"
            size="L"
            label="취소"
            width="100%"
            onClick={handleCloseStatusConfirmDialog}
            disabled={isStatusUpdating}
          />
          <InlineButton
            variant="primary"
            size="L"
            label="완료"
            width="100%"
            onClick={() => void handleConfirmStatusChange()}
            disabled={isStatusUpdating}
          />
        </DialogFooter>
      </Dialog>
    </ThreadDetailPageContainer>
  );
};

const ThreadDetailPageContainer = styled.section`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  background: ${({ theme }) => theme.colors.background.bg6};
  padding-top: ${HEADER_HEIGHT}px;
`;

const ThreadBody = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const ConversationPanel = styled.section`
  display: flex;
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid ${({ theme }) => theme.colors.border.border1};
`;

const AssistantPanel = styled.aside`
  display: flex;
  flex: 0 0 clamp(180px, 30vw, 360px);
  width: clamp(180px, 30vw, 360px);
  min-height: 0;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background.bg1};
`;

const AssistantHeader = styled.header`
  display: flex;
  align-items: center;
  word-break: keep-all;
  ${({ theme }) => theme.fonts.labelM};
  color: ${({ theme }) => theme.colors.brand.dark};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.border1};
  padding: 16px 14px;
  gap: 8px;

  svg {
    flex-shrink: 0;
  }
`;

const AssistantBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding-bottom: 40px;
`;

const AssistantEmpty = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 10px;
  color: ${({ theme }) => theme.colors.text.text4};
  text-align: center;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const AssistantEmptyTitle = styled.p`
  ${({ theme }) => theme.fonts.labelS};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const AssistantEmptyText = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text4};
`;

const AssistantAnalyzing = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 14px;
  text-align: center;
`;

const AnalyzingDots = styled.div`
  display: inline-flex;
  gap: 8px;

  span {
    width: 12px;
    height: 12px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.brand.primary};
    opacity: 0.35;
    animation: dotBlink 1.1s infinite ease-in-out;
  }

  span:nth-of-type(2) {
    animation-delay: 0.15s;
  }

  span:nth-of-type(3) {
    animation-delay: 0.3s;
  }

  @keyframes dotBlink {
    0%,
    80%,
    100% {
      transform: translateY(0);
      opacity: 0.35;
    }

    40% {
      transform: translateY(-3px);
      opacity: 1;
    }
  }
`;

const AssistantAnalyzingTitle = styled.p`
  ${({ theme }) => theme.fonts.titleS};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const AssistantAnalyzingText = styled.p`
  ${({ theme }) => theme.fonts.body2};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const AnalysisResultSection = styled.div`
  display: flex;
  flex-direction: column;
  padding: 14px 12px;
  gap: 10px;
`;

const AnalysisTitle = styled.h4`
  ${({ theme }) => theme.fonts.labelS};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const LowRiskCard = styled.div<{ $risk: 'low' | 'high' }>`
  padding: 12px;
  border: 1px solid
    ${({ $risk, theme }) =>
      $risk === 'high' ? theme.colors.semantic.error : theme.colors.border.border1};
  border-radius: 12px;
  background: ${({ $risk, theme }) =>
    $risk === 'high' ? theme.colors.semantic.errorSoft : theme.colors.semantic.successSoft};
`;

const LowRiskTitle = styled.p<{ $risk: 'low' | 'high' }>`
  ${({ theme }) => theme.fonts.labelXS};
  margin: 0;
  color: ${({ $risk, theme }) =>
    $risk === 'high' ? theme.colors.semantic.error : theme.colors.semantic.success};
`;

const LowRiskDescription = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.text.text2};
`;

const FeedbackSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FeedbackQuestion = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const FeedbackScale = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
`;

const FeedbackScoreButton = styled.button<{ $selected: boolean }>`
  ${({ theme }) => theme.fonts.labelXS};
  height: 30px;
  border: 1px solid
    ${({ theme, $selected }) =>
      $selected ? theme.colors.brand.primary : theme.colors.border.border1};
  border-radius: 8px;
  background: ${({ theme, $selected }) =>
    $selected ? theme.colors.brand.primary : theme.colors.background.bg1};
  color: ${({ theme, $selected }) =>
    $selected ? theme.colors.text.textW : theme.colors.text.text2};
  cursor: pointer;
`;

const FeedbackLabels = styled.div`
  ${({ theme }) => theme.fonts.caption};
  display: flex;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.text.text4};
`;

const FeedbackAppliedBox = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  gap: 10px;
  border: 1px solid ${({ theme }) => theme.colors.brand.primary};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.background.bg4};
`;

const FeedbackAppliedIcon = styled.span`
  display: inline-flex;
  color: ${({ theme }) => theme.colors.brand.primary};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const FeedbackAppliedTextArea = styled.div`
  min-width: 0;
`;

const FeedbackAppliedTitle = styled.p`
  ${({ theme }) => theme.fonts.labelXS};
  margin: 0;
  color: ${({ theme }) => theme.colors.brand.primary};
`;

const FeedbackAppliedDescription = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 2px 0 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const RecommendSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RecommendTitle = styled.h5`
  ${({ theme }) => theme.fonts.labelS};
  margin: 2px 0 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const RecommendCard = styled.div`
  ${({ theme }) => theme.fonts.body3};
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.background.bg1};
  color: ${({ theme }) => theme.colors.text.text2};
  line-height: 1.45;
`;
