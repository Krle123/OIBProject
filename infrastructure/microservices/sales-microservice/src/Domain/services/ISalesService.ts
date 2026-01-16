import { FiscalReceiptDTO } from "../DTOs/FiscalReceiptDTO";
import { SaleType } from "../enums/SaleType";
import { PaymentMethod } from "../enums/PaymentMethod";

export interface ISalesService {
    /**
     * Process a sale transaction
     * @param perfumeSerialNumber Serial number of perfume to sell
     * @param quantity Quantity to sell
     * @param saleType Type of sale (RETAIL/WHOLESALE)
     * @param paymentMethod Payment method
     * @param sellerId ID of the seller
     * @param userRole Role of the user making the sale
     * @returns Created fiscal receipt DTO
     */
    processSale(
        perfumeSerialNumber: string,
        quantity: number,
        saleType: SaleType,
        paymentMethod: PaymentMethod,
        sellerId: number | null,
        userRole: string
    ): Promise<FiscalReceiptDTO>;

    /**
     * Get all fiscal receipts
     * @returns Array of fiscal receipt DTOs
     */
    getAllReceipts(): Promise<FiscalReceiptDTO[]>;

    /**
     * Get fiscal receipt by ID
     * @param id Receipt ID
     * @returns Fiscal receipt DTO
     */
    getReceiptById(id: number): Promise<FiscalReceiptDTO | null>;

    /**
     * Get available perfumes catalog
     * @returns Array of available perfumes
     */
    getAvailablePerfumesCatalog(): Promise<any[]>;
}
