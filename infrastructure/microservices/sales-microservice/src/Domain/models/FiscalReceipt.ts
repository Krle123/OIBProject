import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { SaleType } from "../enums/SaleType";
import { PaymentMethod } from "../enums/PaymentMethod";

@Entity("fiscal_receipts")
export class FiscalReceipt {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 50 })
    receiptNumber!: string;

    @Column({ type: "enum", enum: SaleType })
    saleType!: SaleType;

    @Column({ type: "enum", enum: PaymentMethod })
    paymentMethod!: PaymentMethod;

    @Column({ type: "json" })
    soldPerfumes!: { perfumeId: number; serialNumber: string; name: string; quantity: number; pricePerUnit: number }[];

    @Column({ type: "decimal", precision: 10, scale: 2 })
    totalAmount!: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    saleDate!: Date;

    @Column({ type: "int", nullable: true })
    sellerId!: number | null;
}
