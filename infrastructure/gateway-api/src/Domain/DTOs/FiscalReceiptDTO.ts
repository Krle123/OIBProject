import { FiscalReceipt } from "../models/FiscalReceipt";
import { SaleType } from "../enums/SaleType";
import { PaymentMethod } from "../enums/PaymentMethod";

export class FiscalReceiptDTO {
    id: number;
    saleType: SaleType;
    paymentMethod: PaymentMethod;
    soldPerfumes: Array<{
        perfumeId: number;
        serialNumber: string;
        name: string;
        quantity: number;
        pricePerUnit: number;
    }>;
    totalAmount: number;
    sellerId: number | null;
    saleDate: Date;
    receiptNumber: string;

    constructor(receipt: FiscalReceipt) {
        this.id = receipt.id;
        this.saleType = receipt.saleType;
        this.paymentMethod = receipt.paymentMethod;
        this.soldPerfumes = receipt.soldPerfumes;
        this.totalAmount = receipt.totalAmount;
        this.sellerId = receipt.sellerId;
        this.saleDate = receipt.saleDate;
        this.receiptNumber = receipt.receiptNumber;
    }
}
