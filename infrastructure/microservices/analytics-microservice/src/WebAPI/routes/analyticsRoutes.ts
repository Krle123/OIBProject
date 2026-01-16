import { Router } from "express";
import { AnalyticsController } from "../controllers/AnalyticsController";

export const createAnalyticsRoutes = (controller: AnalyticsController): Router => {
    const router = Router();

    // Sales calculations
    router.get("/sales/by-month", controller.calculateSalesByMonth);
    router.get("/sales/by-week", controller.calculateSalesByWeek);
    router.get("/sales/by-year", controller.calculateSalesByYear);
    router.get("/sales/total", controller.calculateTotalSales);
    router.get("/sales/trend", controller.analyzeSalesTrend);

    // Top performers
    router.get("/top-10/best-selling", controller.getTop10BestSellingPerfumes);
    router.get("/top-10/revenue", controller.getTop10RevenueByPerfume);

    // Reports management
    router.get("/reports", controller.getAllReports);
    router.get("/reports/:id", controller.getReportById);
    router.get("/reports/type/:type", controller.getReportsByType);
    router.get("/reports/:id/pdf", controller.downloadReportPDF);

    return router;
};
