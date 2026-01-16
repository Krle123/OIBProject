import { Router, Request, Response } from "express";
import { ISalesService } from "../../Domain/services/ISalesService";
import { IStorageService } from "../../Domain/services/IStorageService";
import { SaleType } from "../../Domain/enums/SaleType";
import { PaymentMethod } from "../../Domain/enums/PaymentMethod";

export class SalesController {
    private router: Router;

    constructor(
        private readonly salesService: ISalesService,
        private readonly storageService: IStorageService
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

        // Storage routes
        this.router.get("/storages", this.getAllStorages.bind(this));
        this.router.get("/storages/:id", this.getStorageById.bind(this));
        this.router.post("/storages", this.createStorage.bind(this));
        this.router.put("/storages/:id/capacity", this.updateStorageCapacity.bind(this));
        this.router.post("/storages/send-packaging", this.sendPackagingFromStorage.bind(this));
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

    private async getAllStorages(req: Request, res: Response): Promise<void> {
        try {
            const storages = await this.storageService.getAllStorages();

            res.status(200).json({
                success: true,
                data: storages,
                count: storages.length
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to retrieve storages"
            });
        }
    }

    private async getStorageById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid storage ID"
                });
                return;
            }

            const storage = await this.storageService.getStorageById(id);

            if (!storage) {
                res.status(404).json({
                    success: false,
                    message: `Storage with ID ${id} not found`
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: storage
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to retrieve storage"
            });
        }
    }

    private async createStorage(req: Request, res: Response): Promise<void> {
        try {
            const { name, location, maxCapacity, type } = req.body;

            // Validation
            if (!name || !location || !maxCapacity) {
                res.status(400).json({
                    success: false,
                    message: "Missing required fields: name, location, maxCapacity"
                });
                return;
            }

            if (maxCapacity <= 0) {
                res.status(400).json({
                    success: false,
                    message: "Max capacity must be greater than 0"
                });
                return;
            }

            const storage = await this.storageService.createStorage({
                name,
                location,
                maxCapacity,
                type,
                currentCapacity: 0
            });

            res.status(201).json({
                success: true,
                data: storage,
                message: "Storage created successfully"
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to create storage"
            });
        }
    }

    private async updateStorageCapacity(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { increment } = req.body;

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid storage ID"
                });
                return;
            }

            if (increment === undefined || isNaN(increment)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid increment value"
                });
                return;
            }

            const storage = await this.storageService.updateStorageCapacity(id, increment);

            res.status(200).json({
                success: true,
                data: storage,
                message: "Storage capacity updated successfully"
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to update storage capacity"
            });
        }
    }

    private async sendPackagingFromStorage(req: Request, res: Response): Promise<void> {
        try {
            const { numberOfPackages, userRole } = req.body;

            if (!numberOfPackages || numberOfPackages <= 0) {
                res.status(400).json({
                    success: false,
                    message: "Number of packages must be greater than 0"
                });
                return;
            }

            if (!userRole) {
                res.status(400).json({
                    success: false,
                    message: "User role is required"
                });
                return;
            }

            const packages = await this.storageService.sendPackagingFromStorage(
                numberOfPackages,
                userRole
            );

            res.status(200).json({
                success: true,
                data: packages,
                count: packages.length,
                message: "Packages sent from storage successfully"
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to send packages from storage"
            });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}
