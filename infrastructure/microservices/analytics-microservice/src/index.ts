import { initializeApp } from "./app";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 3005;

const startServer = async () => {
    try {
        const app = await initializeApp();

        app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════════════════╗
║   Analytics Microservice - O'Sinjel De Or        ║
╚════════════════════════════════════════════════════╝

✓ Server running on port ${PORT}
✓ Environment: ${process.env.NODE_ENV || 'development'}
✓ API Base URL: http://localhost:${PORT}/api/v1
✓ Health Check: http://localhost:${PORT}/health

Available Endpoints:

Fiscal Receipts:
  POST   /api/v1/analysis/sales (Public - for sales microservice)
  GET    /api/v1/receipts
  GET    /api/v1/receipts/:id
  GET    /api/v1/receipts/number/:number
  GET    /api/v1/receipts/:id/pdf

Analytics:
  GET    /api/v1/analytics/sales/by-month?month=X&year=Y
  GET    /api/v1/analytics/sales/by-week?week=X&year=Y
  GET    /api/v1/analytics/sales/by-year?year=Y
  GET    /api/v1/analytics/sales/total
  GET    /api/v1/analytics/sales/trend?startDate=X&endDate=Y
  GET    /api/v1/analytics/top-10/best-selling
  GET    /api/v1/analytics/top-10/revenue

Reports:
  GET    /api/v1/analytics/reports
  GET    /api/v1/analytics/reports/:id
  GET    /api/v1/analytics/reports/type/:type
  GET    /api/v1/analytics/reports/:id/pdf
            `);
        });
    } catch (error: any) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();
