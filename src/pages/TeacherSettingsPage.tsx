import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherSidebar from '../components/layout/TeacherSidebar';
import { withdrawUserApi } from '../services/api/auth';
import './TeacherSettingsPage.css';

const TeacherSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  useEffect(() => {
    document.title = '설정 - 소프티 교사웹';
  }, []);

  const handleLogout = () => {
    // 실제 로그아웃 API 연동 전이므로 프론트 토큰만 지웁니다.
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('pendingKakaoAccessToken');
    navigate('/');
  };

  const handleWithdrawClick = () => {
    setIsWithdrawModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsWithdrawModalOpen(false);
  };

  const handleConfirmWithdraw = async () => {
    try {
      const response = await withdrawUserApi();
      if (response.success) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('pendingKakaoAccessToken');
        navigate('/');
      } else {
        alert('회원 탈퇴 처리 중 문제가 발생했습니다.');
      }
    } catch (error) {
      console.error('Withdraw error:', error);
      // 서버 미연결 에러가 날 경우 시연을 위해 탈퇴 효과 처리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('pendingKakaoAccessToken');
      navigate('/');
    }
  };

  return (
    <div className="teacher-layout">
      <TeacherSidebar />
      
      <div className="teacher-main-content">
        <div className="page-header settings-header">
          <h2 className="page-title">설정</h2>
          <div className="header-actions">
            <button className="btn btn-settings-cancel">취소</button>
            <button className="btn btn-settings-save">변경사항 저장</button>
          </div>
        </div>
        
        <div className="settings-content">
          
          {/* 에러 배너 시안 UI */}
          <div className="error-banner">
            <div className="error-banner-left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-3">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <div>
                <div className="error-banner-title">사용자 정보를 불러오지 못했어요</div>
                <div className="error-banner-subtitle">잠시 후 다시 시도해 주세요.</div>
              </div>
            </div>
            <button className="error-banner-retry">다시 시도</button>
          </div>

          {/* 계정 관리 카드 */}
          <div className="settings-block">
            <h3 className="settings-block-title">계정 관리</h3>
            <div className="settings-list">
              <div className="settings-list-item" onClick={handleLogout}>
                로그아웃
              </div>
              <div className="settings-list-item text-danger mt-1" onClick={handleWithdrawClick} style={{ color: '#ef4444' }}>
                회원 탈퇴
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* 회원 탈퇴 모달 UI */}
      {isWithdrawModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-icon text-center mb-4">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h4 className="modal-title text-center">정말 탈퇴하시겠어요?</h4>
            <p className="modal-subtitle text-center mb-4">
              탈퇴하면 학급 정보와 대화 내역이 모두 삭제되고,<br/>
              다시 복구할 수 없어요.
            </p>
            <div className="modal-actions-wrapper">
              <button className="btn btn-modal-cancel" onClick={handleCloseModal}>취소</button>
              <button className="btn btn-modal-danger" onClick={handleConfirmWithdraw}>탈퇴하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSettingsPage;
