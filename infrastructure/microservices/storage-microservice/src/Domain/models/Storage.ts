import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { StorageType } from "../enums/StorageType";

@Entity("storages")
export class Storage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100 })
    name!: string;

    @Column({ type: "varchar", length: 255 })
    location!: string;

    @Column({ type: "int" })
    maxCapacity!: number;

    @Column({ type: "int", default: 0 })
    currentCapacity!: number;

    @Column({ type: "enum", enum: StorageType, default: StorageType.WAREHOUSE_CENTER })
    type!: StorageType;
}
