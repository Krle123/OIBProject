import { IUserAPI } from "../api/users/IUserAPI";
import React from "react";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";

type DashboardPageProps = {
    userAPI: IUserAPI;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ userAPI }) => {
    return (
        <div className="dashboard-root">
          
            <DashboardNavbar userAPI={userAPI} />
            <div className="dashboard-content">
                
                <h1 style={{ color: "black" }}>Dobrodošli!</h1>
            </div>
        </div>
    );
};