import { IUserAPI } from "../api/users/IUserAPI";
import React from "react";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";
import { Outlet } from "react-router-dom";

type DashboardPageProps = {
  userAPI: IUserAPI;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ userAPI }) => {
  return (
    <div className="dashboard-root">
      {/* Top navbar */}
      <DashboardNavbar userAPI={userAPI} />

      {/* Routed content goes here */}
      <div className="dashboard-content">
        <Outlet />
      </div>
    </div>
  );
};