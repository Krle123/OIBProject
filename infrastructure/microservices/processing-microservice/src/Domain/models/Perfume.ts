import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { PerfumeType } from "../enums/PerfumeType";

@Entity("perfumes")
export class Perfume {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100 })
    serialNumber!: string;

    @Column({ type: "varchar", length: 100 })
    name!: string;

    @Column({ type: "enum", enum: PerfumeType })
    type!: PerfumeType;

    @Column({ type: "number"})
    quantity!: number;

    @Column({ type: "number"})
    plantId!: number;

    @Column({ type: "date"})
    expirationDate!: string;

}