import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { PackagingStatus } from "../enums/PackagingStatus";

@Entity("packagings")
export class Packaging {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100 })
    name!: string;

    @Column({ type: "varchar", length: 255 })
    adress!: string;

    @Column({ type: "number"})
    storageId!: number;

    @Column({ type: "json"})
    perfumeIds!: number[];

    @Column({ type: "enum", enum: PackagingStatus })
    status!: PackagingStatus;
}