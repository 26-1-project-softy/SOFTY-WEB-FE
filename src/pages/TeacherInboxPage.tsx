import React, { useEffect } from 'react';
import TeacherSidebar from '../components/layout/TeacherSidebar';
import './TeacherInboxPage.css';

const TeacherInboxPage: React.FC = () => {
  useEffect(() => {
    document.title = '수신함 - 소프티 교사웹';
  }, []);

  return (
    <div className="teacher-layout">
      <TeacherSidebar />
      
      <div className="teacher-main-content">
        {/* 상단 헤더 요소 */}
        <div className="page-header">
          <h2 className="page-title">수신함</h2>
        </div>
        
        {/* 본문 영역 - 시안의 에러 상태 */}
        <div className="inbox-content">
          <div className="empty-state-wrapper">
            <div className="empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            
            <h3 className="empty-title">대화 목록을 불러올 수 없어요</h3>
            <p className="empty-subtitle">잠시 후 다시 시도해주세요.</p>
            
            <button className="btn focus-btn mt-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
              다시 시도
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherInboxPage;
