import { FiscalReceiptDTO } from "../DTOs/FiscalReceiptDTO";

export interface IFiscalReceiptService {
    createFiscalReceipt(saleData: any): Promise<FiscalReceiptDTO>;
    getAllReceipts(): Promise<FiscalReceiptDTO[]>;
    getReceiptById(id: number): Promise<FiscalReceiptDTO | null>;
    getReceiptByNumber(receiptNumber: string): Promise<FiscalReceiptDTO | null>;
}
