import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { SaleType } from "../enums/SaleType";
import { PaymentMethod } from "../enums/PaymentMethod";

@Entity("fiscal_receipts")
export class FiscalReceipt {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "enum",
        enum: SaleType
    })
    saleType!: SaleType;

    @Column({
        type: "enum",
        enum: PaymentMethod
    })
    paymentMethod!: PaymentMethod;

    @Column("json")
    soldPerfumes!: Array<{
        perfumeId: number;
        serialNumber: string;
        name: string;
        quantity: number;
        pricePerUnit: number;
    }>;

    @Column("decimal", { precision: 10, scale: 2 })
    totalAmount!: number;

    @Column({ type: "int", nullable: true })
    sellerId!: number | null;

    @CreateDateColumn()
    saleDate!: Date;

    @Column({ type: "varchar", length: 50, unique: true })
    receiptNumber!: string;
}
