import app from "./app";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║   Sales Microservice - O'Sinjel De Or Parfumerie ║
╚═══════════════════════════════════════════════════╝

✓ Server running on port ${PORT}
✓ Environment: ${process.env.NODE_ENV || 'development'}
✓ API Base URL: http://localhost:${PORT}/api/v1
✓ Health Check: http://localhost:${PORT}/health

Available Endpoints:
  POST   /api/v1/sales/process
  GET    /api/v1/sales/receipts
  GET    /api/v1/sales/receipts/:id
  GET    /api/v1/sales/catalog
  GET    /api/v1/storages
  GET    /api/v1/storages/:id
  POST   /api/v1/storages
  PUT    /api/v1/storages/:id/capacity
  POST   /api/v1/storages/send-packaging
    `);
});
