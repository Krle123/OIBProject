import { Repository } from "typeorm";
import { FiscalReceipt } from "../Domain/models/FiscalReceipt";
import { FiscalReceiptDTO } from "../Domain/DTOs/FiscalReceiptDTO";
import { IFiscalReceiptService } from "../Domain/services/IFiscalReceiptService";
import { ICommunicationService } from "../Domain/services/ICommunicationService";

export class FiscalReceiptService implements IFiscalReceiptService {
    constructor(
        private readonly receiptRepository: Repository<FiscalReceipt>,
        private readonly communicationService: ICommunicationService
    ) {}

    async createFiscalReceipt(saleData: any): Promise<FiscalReceiptDTO> {
        try {
            await this.communicationService.logEvent(
                "INFO",
                `Creating fiscal receipt for sale data: Receipt from Sales Microservice`
            );

            // Use receiptNumber from sales service if provided, otherwise generate new one
            const receiptNumber = saleData.receiptNumber || this.generateUniqueReceiptNumber();

            const receipt = this.receiptRepository.create({
                saleType: saleData.saleType,
                paymentMethod: saleData.paymentMethod,
                soldPerfumes: saleData.soldPerfumes,
                totalAmount: saleData.totalAmount,
                sellerId: saleData.sellerId,
                saleDate: saleData.saleDate || new Date(),
                receiptNumber: receiptNumber
            });

            const savedReceipt = await this.receiptRepository.save(receipt);

            await this.communicationService.logEvent(
                "INFO",
                `Fiscal receipt created successfully: ${receiptNumber}`
            );

            return new FiscalReceiptDTO(savedReceipt);
        } catch (error: any) {
            await this.communicationService.logEvent(
                "ERROR",
                `Failed to create fiscal receipt: ${error.message}`
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

    async getReceiptByNumber(receiptNumber: string): Promise<FiscalReceiptDTO | null> {
        const receipt = await this.receiptRepository.findOne({ where: { receiptNumber } });
        return receipt ? new FiscalReceiptDTO(receipt) : null;
    }

    private generateUniqueReceiptNumber(): string {
        // Generate unique receipt number with timestamp and random string
        return `FR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }
}
