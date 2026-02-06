import { Router, Request, Response } from "express";
import { ISalesService } from "../../Domain/services/ISalesService";
import { SaleType } from "../../Domain/enums/SaleType";
import { PaymentMethod } from "../../Domain/enums/PaymentMethod";

export class SalesController {
    private router: Router;

    constructor(
        private readonly salesService: ISalesService
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // Sales routes
        this.router.post("/sales/process", this.processSale.bind(this));
        this.router.get("/sales/receipts", this.getAllReceipts.bind(this));
        this.router.get("/sales/receipts/:id", this.getReceiptById.bind(this));
        this.router.get("/sales/catalog", this.getCatalog.bind(this));
    }

    private async processSale(req: Request, res: Response): Promise<void> {
        try {
            const { perfumeSerialNumber, quantity, saleType, paymentMethod, sellerId, userRole } = req.body;

            // Validation
            if (!perfumeSerialNumber || !quantity || !saleType || !paymentMethod) {
                res.status(400).json({
                    success: false,
                    message: "Missing required fields: perfumeSerialNumber, quantity, saleType, paymentMethod"
                });
                return;
            }

            if (!Object.values(SaleType).includes(saleType)) {
                res.status(400).json({
                    success: false,
                    message: `Invalid sale type. Must be one of: ${Object.values(SaleType).join(", ")}`
                });
                return;
            }

            if (!Object.values(PaymentMethod).includes(paymentMethod)) {
                res.status(400).json({
                    success: false,
                    message: `Invalid payment method. Must be one of: ${Object.values(PaymentMethod).join(", ")}`
                });
                return;
            }

            if (quantity <= 0) {
                res.status(400).json({
                    success: false,
                    message: "Quantity must be greater than 0"
                });
                return;
            }

            const receipt = await this.salesService.processSale(
                perfumeSerialNumber,
                quantity,
                saleType as SaleType,
                paymentMethod as PaymentMethod,
                sellerId || null,
                userRole || "SELLER"
            );

            res.status(201).json({
                success: true,
                data: receipt,
                message: "Sale processed successfully"
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to process sale"
            });
        }
    }

    private async getAllReceipts(req: Request, res: Response): Promise<void> {
        try {
            const receipts = await this.salesService.getAllReceipts();

            res.status(200).json({
                success: true,
                data: receipts,
                count: receipts.length
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to retrieve receipts"
            });
        }
    }

    private async getReceiptById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid receipt ID"
                });
                return;
            }

            const receipt = await this.salesService.getReceiptById(id);

            if (!receipt) {
                res.status(404).json({
                    success: false,
                    message: `Receipt with ID ${id} not found`
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: receipt
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to retrieve receipt"
            });
        }
    }

    private async getCatalog(req: Request, res: Response): Promise<void> {
        try {
            const catalog = await this.salesService.getAvailablePerfumesCatalog();

            res.status(200).json({
                success: true,
                data: catalog,
                count: catalog.length
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to retrieve catalog"
            });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}
