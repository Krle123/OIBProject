import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IUserAPI } from "../../../api/users/IUserAPI";
import { useAuth } from "../../../hooks/useAuthHook";
import { UserDTO } from "../../../models/users/UserDTO";

type DashboardNavbarProps = {
  userAPI: IUserAPI;
};

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ userAPI }) => {
  const { user: authUser, logout, token } = useAuth();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      if (authUser?.id) {
        try {
          const userData = await userAPI.getUserById(token ?? "", authUser.id);
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUser();
  }, [authUser, userAPI, token]);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  // Helper component for navbar buttons
  const NavButton = ({ label, path }: { label: string; path: string }) => {
    const fullPath = `/dashboard/${path}`; // prepend /dashboard
    const isActive = location.pathname === fullPath;

    return (
      <button
        onClick={() => navigate(fullPath)}
        className="btn btn-ghost"
        style={{
          padding: "8px 14px",
          borderRadius: "6px",
          fontWeight: 500,
          transition: "background 0.2s ease, color 0.2s ease",
          background: isActive ? "var(--win11-accent)" : "transparent",
          color: isActive ? "#000" : "var(--win11-text-primary)",
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.background = "var(--win11-hover)";
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.background = "transparent";
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <nav
      className="titlebar"
      style={{
        height: "60px",
        borderRadius: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
      }}
    >
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <NavButton label="Pregled" path="Pregled" />
        <NavButton label="Proizvodnja" path="Proizvodnja" />
        <NavButton label="Prerada" path="Prerada" />
        <NavButton label="Pakovanje" path="Pakovanje" />
        <NavButton label="Skladistenje" path="Skladistenje" />
        <NavButton label="Prodaja" path="Prodaja" />
      </div>

      {/* Profile */}
      <div className="flex items-center gap-3">
        {isLoading ? (
          <div
            className="spinner"
            style={{ width: "20px", height: "20px", borderWidth: "2px" }}
          />
        ) : user ? (
          <>
            {/* Profile image */}
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.username}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid var(--win11-divider)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "var(--win11-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#000",
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}

            {/* User info */}
            <div className="flex flex-col" style={{ gap: 0 }}>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--win11-text-primary)",
                }}
              >
                {user.email}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--win11-text-tertiary)",
                }}
              >
                {user.role}
              </span>
            </div>

            {/* Logout */}
            <button
              className="btn btn-ghost"
              onClick={handleLogout}
              style={{ padding: "8px 16px" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 2v2H3v8h3v2H2V2h4zm4 3l4 3-4 3V9H6V7h4V5z" />
              </svg>
              Logout
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
};
