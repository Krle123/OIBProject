import { Route, Routes, Navigate } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { IAuthAPI } from "./api/auth/IAuthAPI";
import { AuthAPI } from "./api/auth/AuthAPI";
import { UserAPI } from "./api/users/UserAPI";
import { IUserAPI } from "./api/users/IUserAPI";
import { ProtectedRoute } from "./components/protected_route/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";

// Pages
import { PregledPage } from "./pages/PregledPage.tsx";
import { ProizvodnjaPage } from "./pages/ProizvodnjaPage.tsx";
import { PreradaPage } from "./pages/PreradaPage.tsx";
import { PakovanjePage } from "./pages/PakovanjePage.tsx";
import { SkladistenjePage } from "./pages/SkladistenjePage.tsx";
import { ProdajaPage } from "./pages/ProdajaPage.tsx";

const auth_api: IAuthAPI = new AuthAPI();
const user_api: IUserAPI = new UserAPI();

function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<AuthPage authAPI={auth_api} />} />

      {/* Dashboard (layout route) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="admin,seller">
            <DashboardPage userAPI={user_api} />
          </ProtectedRoute>
        }
      >
        {/* Default dashboard page */}
        <Route index element={<Navigate to="Pregled" replace />} />

        {/* Dashboard sub-pages */}
        <Route path="Pregled" element={<PregledPage />} />
        <Route path="Proizvodnja" element={<ProizvodnjaPage />} />
        <Route path="Prerada" element={<PreradaPage />} />
        <Route path="Pakovanje" element={<PakovanjePage />} />
        <Route path="Skladistenje" element={<SkladistenjePage />} />
        <Route path="Prodaja" element={<ProdajaPage />} />
        
      </Route>
    </Routes>
  );
}

export default App;