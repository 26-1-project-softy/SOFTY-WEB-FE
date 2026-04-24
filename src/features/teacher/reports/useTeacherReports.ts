import { AxiosError } from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { reportDownloadService } from '@/services/teacher/reportDownloadService';
import {
  reportsApi,
  type ReportChatPreviewMessage,
  type ReportChatRoomItem,
} from '@/services/teacher/reportsApi';
import { formatDateOnly } from '@/utils/reports/reportFormatters';

const PREVIEW_PAGE_SIZE = 30;

export const useTeacherReports = () => {
  const [reportItems, setReportItems] = useState<ReportChatRoomItem[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPreviewLoadError, setIsPreviewLoadError] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isPreviewLoadingMore, setIsPreviewLoadingMore] = useState(false);
  const [previewMessages, setPreviewMessages] = useState<ReportChatPreviewMessage[]>([]);
  const [previewNextCursor, setPreviewNextCursor] = useState('');
  const [previewHasNext, setPreviewHasNext] = useState(false);
  const [isReportCompleteModalOpen, setIsReportCompleteModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [generatedPdfFileName, setGeneratedPdfFileName] = useState('');
  const [generatedPdfDownloadUrl, setGeneratedPdfDownloadUrl] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isPdfDownloadErrorVisible, setIsPdfDownloadErrorVisible] = useState(false);
  const previewRequestIdRef = useRef(0);
  const { showToast } = useToast();

  const selectedReport = useMemo(
    () => reportItems.find(item => item.chatRoomId === selectedReportId) ?? null,
    [reportItems, selectedReportId]
  );
  const hasNoData = !isLoading && !errorMessage && reportItems.length === 0;
  const hasListError = !isLoading && !!errorMessage;
  const listErrorDisplayMessage = errorMessage || '서비스에 문제가 생겼습니다.';

  const defaultReportFileName = useMemo(() => {
    if (!selectedReport?.lastMessageAt) {
      return '증빙리포트_0000-00-00.pdf';
    }

    return `증빙리포트_${formatDateOnly(selectedReport.lastMessageAt)}.pdf`;
  }, [selectedReport]);
  const reportFileName = generatedPdfFileName || defaultReportFileName;

  const fetchReportRooms = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const response = await reportsApi.getReportChatRooms({ page: 0, size: 20 });

      setReportItems(response.data);
      setSelectedReportId(prev => {
        if (prev && response.data.some(item => item.chatRoomId === prev)) {
          return prev;
        }

        return null;
      });
      setIsPreviewLoadError(false);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const status = axiosError.response?.status;
      const isNetworkError = !axiosError.response;
      const isServerError = typeof status === 'number' && status >= 500;

      if (isNetworkError || isServerError) {
        setErrorMessage('서비스에 문제가 생겼습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setErrorMessage(axiosError.response?.data?.message || '채팅방 목록을 불러오지 못했어요.');
      }
      setReportItems([]);
      setSelectedReportId(null);
      setIsPreviewLoadError(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPreviewMessages = useCallback(
    async ({
      chatRoomId,
      cursor = '',
      append = false,
    }: {
      chatRoomId: number;
      cursor?: string;
      append?: boolean;
    }) => {
      const requestId = ++previewRequestIdRef.current;

      if (append) {
        setIsPreviewLoadingMore(true);
      } else {
        setIsPreviewLoading(true);
      }

      try {
        const response = await reportsApi.getReportChatRoomPreview(chatRoomId, {
          cursor,
          size: PREVIEW_PAGE_SIZE,
        });

        if (requestId !== previewRequestIdRef.current) {
          return;
        }

        setPreviewMessages(prev => (append ? [...prev, ...response.messages] : response.messages));
        setPreviewNextCursor(response.nextCursor);
        setPreviewHasNext(response.hasNext);
        setIsPreviewLoadError(false);
      } catch {
        if (requestId !== previewRequestIdRef.current) {
          return;
        }

        if (!append) {
          setPreviewMessages([]);
        }
        setPreviewNextCursor('');
        setPreviewHasNext(false);
        setIsPreviewLoadError(true);
      } finally {
        if (requestId === previewRequestIdRef.current) {
          setIsPreviewLoading(false);
          setIsPreviewLoadingMore(false);
        }
      }
    },
    []
  );

  const handleSelectReport = (chatRoomId: number) => {
    setSelectedReportId(chatRoomId);
  };

  const handleLoadMorePreview = () => {
    if (!selectedReportId || !previewHasNext || !previewNextCursor || isPreviewLoadingMore) {
      return;
    }

    void fetchPreviewMessages({
      chatRoomId: selectedReportId,
      cursor: previewNextCursor,
      append: true,
    });
  };

  const retryPreviewMessages = () => {
    if (!selectedReportId) {
      return;
    }

    void fetchPreviewMessages({ chatRoomId: selectedReportId });
  };

  useEffect(() => {
    void fetchReportRooms();
  }, [fetchReportRooms]);

  useEffect(() => {
    if (!selectedReportId) {
      setPreviewMessages([]);
      setPreviewNextCursor('');
      setPreviewHasNext(false);
      setIsPreviewLoadError(false);
      setIsPreviewLoading(false);
      setIsPreviewLoadingMore(false);
      return;
    }

    void fetchPreviewMessages({ chatRoomId: selectedReportId });
  }, [fetchPreviewMessages, selectedReportId]);

  const handleOpenReportCompleteModal = async () => {
    if (!selectedReport || isGeneratingPdf) {
      return;
    }

    setIsGeneratingPdf(true);

    try {
      const response = await reportsApi.createReportPdf(selectedReport.chatRoomId);

      if (!response.success) {
        showToast('PDF 생성에 실패했어요.', 'error');
        return;
      }

      setGeneratedPdfFileName(response.fileName || defaultReportFileName);
      setGeneratedPdfDownloadUrl(response.downloadUrl || '');
      setIsReportCompleteModalOpen(true);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      showToast(axiosError.response?.data?.message || 'PDF 생성에 실패했어요.', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCloseReportCompleteModal = () => {
    setIsReportCompleteModalOpen(false);
    setIsPdfDownloadErrorVisible(false);
    setIsDownloadingPdf(false);
  };

  const handleDownloadGeneratedPdf = async () => {
    setIsPdfDownloadErrorVisible(false);

    if (!generatedPdfDownloadUrl) {
      setIsPdfDownloadErrorVisible(true);
      return;
    }

    try {
      setIsDownloadingPdf(true);
      await reportDownloadService.downloadPdfFromPresignedUrl(
        generatedPdfDownloadUrl,
        reportFileName || '증빙리포트.pdf'
      );
    } catch {
      setIsPdfDownloadErrorVisible(true);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return {
    reportItems,
    selectedReport,
    selectedReportId,
    isLoading,
    hasListError,
    hasNoData,
    listErrorDisplayMessage,
    isPreviewLoadError,
    isPreviewLoading,
    isPreviewLoadingMore,
    previewMessages,
    previewHasNext,
    isReportCompleteModalOpen,
    isGeneratingPdf,
    reportFileName,
    isDownloadingPdf,
    isPdfDownloadErrorVisible,
    fetchReportRooms,
    handleSelectReport,
    handleLoadMorePreview,
    retryPreviewMessages,
    handleOpenReportCompleteModal,
    handleCloseReportCompleteModal,
    handleDownloadGeneratedPdf,
  };
};
