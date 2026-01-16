import { Repository } from "typeorm";
import { FiscalReceipt } from "../Domain/models/FiscalReceipt";
import { FiscalReceiptDTO } from "../Domain/DTOs/FiscalReceiptDTO";
import { ISalesService } from "../Domain/services/ISalesService";
import { ICommunicationService } from "../Domain/services/ICommunicationService";
import { IStorageService } from "../Domain/services/IStorageService";
import { SaleType } from "../Domain/enums/SaleType";
import { PaymentMethod } from "../Domain/enums/PaymentMethod";

export class SalesService implements ISalesService {
    constructor(
        private readonly receiptRepository: Repository<FiscalReceipt>,
        private readonly communicationService: ICommunicationService,
        private readonly storageService: IStorageService
    ) {}

    async processSale(
        perfumeSerialNumber: string,
        quantity: number,
        saleType: SaleType,
        paymentMethod: PaymentMethod,
        sellerId: number | null,
        userRole: string
    ): Promise<FiscalReceiptDTO> {
        try {
            await this.communicationService.logEvent(
                "INFO",
                `Processing sale: ${perfumeSerialNumber}, Quantity: ${quantity}, Type: ${saleType}`
            );

            // Step 1: Get available perfumes catalog
            const availablePerfumes = await this.communicationService.getAvailablePerfumes();

            const perfume = availablePerfumes.find(p => p.serialNumber === perfumeSerialNumber);

            if (!perfume) {
                await this.communicationService.logEvent(
                    "ERROR",
                    `Perfume not found: ${perfumeSerialNumber}`
                );
                throw new Error(`Perfume with serial number ${perfumeSerialNumber} not found`);
            }

            if (perfume.quantity < quantity) {
                await this.communicationService.logEvent(
                    "ERROR",
                    `Insufficient quantity for perfume ${perfumeSerialNumber}. Available: ${perfume.quantity}, Requested: ${quantity}`
                );
                throw new Error(`Insufficient quantity. Available: ${perfume.quantity}, Requested: ${quantity}`);
            }

            // Step 2: Calculate packages needed (assuming packages are sent from storage)
            // For simplicity, assume 1 package can contain multiple perfume bottles
            const packagesNeeded = Math.ceil(quantity / 10); // 10 bottles per package

            // Step 3: Request packaging from storage based on user role
            const packages = await this.storageService.sendPackagingFromStorage(packagesNeeded, userRole);

            if (!packages || packages.length === 0) {
                await this.communicationService.logEvent(
                    "ERROR",
                    "No packages retrieved from storage"
                );
                throw new Error("Failed to retrieve packages from storage");
            }

            await this.communicationService.logEvent(
                "INFO",
                `Retrieved ${packages.length} packages from storage`
            );

            // Step 4: Calculate price based on sale type
            const basePrice = this.calculateBasePrice(perfume.type, perfume.quantity);
            const pricePerUnit = saleType === SaleType.WHOLESALE
                ? basePrice * 0.85  // 15% discount for wholesale
                : basePrice;

            const totalAmount = pricePerUnit * quantity;

            // Step 5: Create fiscal receipt
            const soldPerfumes = [{
                perfumeId: perfume.id,
                serialNumber: perfume.serialNumber,
                name: perfume.name,
                quantity: quantity,
                pricePerUnit: pricePerUnit
            }];

            const receipt = this.receiptRepository.create({
                saleType,
                paymentMethod,
                soldPerfumes,
                totalAmount,
                sellerId,
                saleDate: new Date()
            });

            const savedReceipt = await this.receiptRepository.save(receipt);

            await this.communicationService.logEvent(
                "INFO",
                `Sale completed successfully. Receipt ID: ${savedReceipt.id}, Total: ${totalAmount}`
            );

            // Step 6: Send sale data to analysis microservice
            await this.communicationService.sendSaleToAnalysis(savedReceipt);

            return new FiscalReceiptDTO(savedReceipt);
        } catch (error: any) {
            await this.communicationService.logEvent(
                "ERROR",
                `Sale processing failed: ${error.message}`
            );
            throw error;
        }
    }

    async getAllReceipts(): Promise<FiscalReceiptDTO[]> {
        const receipts = await this.receiptRepository.find({
            order: { saleDate: "DESC" }
        });
        return receipts.map(receipt => new FiscalReceiptDTO(receipt));
    }

    async getReceiptById(id: number): Promise<FiscalReceiptDTO | null> {
        const receipt = await this.receiptRepository.findOne({ where: { id } });
        return receipt ? new FiscalReceiptDTO(receipt) : null;
    }

    async getAvailablePerfumesCatalog(): Promise<any[]> {
        try {
            const perfumes = await this.communicationService.getAvailablePerfumes();

            await this.communicationService.logEvent(
                "INFO",
                `Retrieved catalog with ${perfumes.length} available perfumes`
            );

            return perfumes;
        } catch (error: any) {
            await this.communicationService.logEvent(
                "ERROR",
                `Failed to retrieve perfume catalog: ${error.message}`
            );
            throw error;
        }
    }

    private calculateBasePrice(perfumeType: string, bottleSize: number): number {
        // Base price calculation logic
        // PERFUME is more expensive than COLOGNE
        const typeMultiplier = perfumeType === "PERFUME" ? 1.5 : 1.0;
        const sizeMultiplier = bottleSize / 100; // Price scales with bottle size

        const basePrice = 50; // Base price in currency units
        return basePrice * typeMultiplier * sizeMultiplier;
    }
}
