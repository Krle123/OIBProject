import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { AlgorithmType } from "../enums/AlgorithmType";

@Entity("izvestaji_performanse")
export class PerformanceReport {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "enum", enum: AlgorithmType })
    algorithm!: AlgorithmType;

    @Column({ type: "float" })
    efficiency!: number;

    @Column({ type: "text" })
    conclusions!: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;
}
