import { SaleType } from "../enums/SaleType";
import { PaymentMethod } from "../enums/PaymentMethod";

export class FiscalReceiptDTO {
    id!: number;
    saleType!: SaleType;
    paymentMethod!: PaymentMethod;
    soldPerfumes!: { perfumeId: number; serialNumber: string; name: string; quantity: number; pricePerUnit: number }[];
    totalAmount!: number;
    saleDate!: Date;
    sellerId!: number | null;

    constructor(data: Partial<FiscalReceiptDTO>) {
        Object.assign(this, data);
    }
}
