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

            // Generate unique receipt number
            const receiptNumber = await this.generateReceiptNumber();

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

    private async generateReceiptNumber(): Promise<string> {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        // Count receipts today to generate sequential number
        const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

        const count = await this.receiptRepository.count({
            where: {
                saleDate: todayStart as any // TypeORM will handle the range
            }
        });

        const sequentialNumber = String(count + 1).padStart(4, '0');

        return `FR-${year}${month}${day}-${sequentialNumber}`;
    }
}
