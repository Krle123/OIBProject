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

            // Simplified sale processing - create receipt directly
            // In production, this would validate against inventory/packaging service

            // Calculate price based on sale type (simplified pricing)
            const basePrice = 1000; // Base price per unit in RSD
            const pricePerUnit = saleType === SaleType.WHOLESALE
                ? basePrice * 0.85  // 15% discount for wholesale
                : basePrice;

            const totalAmount = pricePerUnit * quantity;

            // Create fiscal receipt with perfume info
            const soldPerfumes = [{
                perfumeId: 0,
                serialNumber: perfumeSerialNumber,
                name: perfumeSerialNumber,
                quantity: quantity,
                pricePerUnit: pricePerUnit
            }];

            // Generate receipt number
            const receiptNumber = `FR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

            const receipt = this.receiptRepository.create({
                receiptNumber,
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

            // Send sale data to analysis microservice
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
