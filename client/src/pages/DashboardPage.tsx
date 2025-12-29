import { IUserAPI } from "../api/users/IUserAPI";
import React from "react";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";

type DashboardPageProps = {
    userAPI: IUserAPI;
};

export const DashboardPage : React.FC<DashboardPageProps> = ({ userAPI }) => {
    
    return (
        <>
        <div>
            <DashboardNavbar userAPI={userAPI} />
        </div>
                <h1>Dashboard</h1>
                <p>Welcome to the dashboard!</p>
        </>
    );
}
