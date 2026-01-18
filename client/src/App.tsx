import { Route, Routes } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { IAuthAPI } from "./api/auth/IAuthAPI";
import { AuthAPI } from "./api/auth/AuthAPI";
import { UserAPI } from "./api/users/UserAPI";
import { IUserAPI } from "./api/users/IUserAPI";
import { ProtectedRoute } from "./components/protected_route/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { SalesPage } from "./pages/SalesPage";
import { SalesAPI } from "./api/sales/SalesAPI";
import { ISalesAPI } from "./api/sales/ISalesAPI";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AnalyticsAPI } from "./api/analytics/AnalyticsAPI";
import { IAnalyticsAPI } from "./api/analytics/IAnalyticsAPI";
import { PerformancePage } from "./pages/PerformancePage";
import { PerformanceAPI } from "./api/performance/PerformanceAPI";
import { IPerformanceAPI } from "./api/performance/IPerformanceAPI";

const auth_api: IAuthAPI = new AuthAPI();
const user_api: IUserAPI = new UserAPI();
const sales_api: ISalesAPI = new SalesAPI();
const analytics_api: IAnalyticsAPI = new AnalyticsAPI();
const performance_api: IPerformanceAPI = new PerformanceAPI();

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="admin,seller,manager">
              <DashboardPage userAPI={user_api}/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Prodaja"
          element={
            <ProtectedRoute requiredRole="seller,manager">
              <SalesPage salesAPI={sales_api} userAPI={user_api}/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <ProtectedRoute requiredRole="seller,manager">
              <SalesPage salesAPI={sales_api} userAPI={user_api}/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Analiza"
          element={
            <ProtectedRoute requiredRole="seller,manager">
              <AnalyticsPage analyticsAPI={analytics_api} userAPI={user_api}/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute requiredRole="seller,manager">
              <AnalyticsPage analyticsAPI={analytics_api} userAPI={user_api}/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/performance"
          element={
            <ProtectedRoute requiredRole="admin">
              <PerformancePage performanceAPI={performance_api} userAPI={user_api}/>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<AuthPage authAPI={auth_api} />} />
      </Routes>
    </>
  );
}

export default App;
