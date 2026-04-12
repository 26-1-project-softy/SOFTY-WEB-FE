import React from 'react';
import AdminSidebar from '../components/layout/AdminSidebar';
import './AdminDashboard.css';

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="admin-layout">
      {/* 1. 좌측 공통 사이드바 */}
      <AdminSidebar />
      
      {/* 2. 우측 메인 콘텐츠 영역 (현재는 빈 껍데기) */}
      <div className="admin-main-content">
        <h2 className="dashboard-title">대시보드</h2>
        <div className="dashboard-content-placeholder">
          <p>이곳에 이미지 속 차트 및 대시보드 내용이 구현될 예정입니다.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
