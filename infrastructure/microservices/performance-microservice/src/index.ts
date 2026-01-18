import "reflect-metadata";
import dotenv from "dotenv";
import { initializeApp } from "./app";

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 3006;

const startServer = async () => {
    try {
        const app = await initializeApp();

        app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════════════════╗
║   Performance Microservice - O'Sinjel De Or      ║
╚════════════════════════════════════════════════════╝

✓ Server running on port ${PORT}
✓ Environment: ${process.env.NODE_ENV || 'development'}
✓ API Base URL: http://localhost:${PORT}/api/v1
✓ Health Check: http://localhost:${PORT}/health

Available Endpoints:

Performance Simulation:
  POST   /api/v1/performance/simulate

Reports:
  GET    /api/v1/performance/reports
  GET    /api/v1/performance/reports/:id
  GET    /api/v1/performance/reports/algorithm/:algorithmType
  GET    /api/v1/performance/reports/:id/pdf
            `);
        });
    } catch (error: any) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();
