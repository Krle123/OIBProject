import { IUserAPI } from "../api/users/IUserAPI";
import React from "react";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";
import { useNavigate } from "react-router-dom";

type DashboardPageProps = {
    userAPI: IUserAPI;
};

export const DashboardPage : React.FC<DashboardPageProps> = ({ userAPI }) => {
    
    const navigate = useNavigate();
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
