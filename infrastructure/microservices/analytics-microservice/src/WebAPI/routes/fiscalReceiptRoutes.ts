import { Router } from "express";
import { FiscalReceiptController } from "../controllers/FiscalReceiptController";

export const createFiscalReceiptRoutes = (controller: FiscalReceiptController): Router => {
    const router = Router();

    router.post("/receipts", controller.createFiscalReceipt);
    router.get("/receipts", controller.getAllReceipts);
    router.get("/receipts/:id", controller.getReceiptById);
    router.get("/receipts/number/:number", controller.getReceiptByNumber);
    router.get("/receipts/:id/pdf", controller.downloadReceiptPDF);

    return router;
};
