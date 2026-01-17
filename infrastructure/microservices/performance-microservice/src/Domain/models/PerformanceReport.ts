import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { PerformanceAlgorithmType } from "../enums/PerformanceAlgorithmType";

@Entity("performance_reports")
export class PerformanceReport {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "enum",
        enum: PerformanceAlgorithmType
    })
    algorithmType!: PerformanceAlgorithmType;

    @Column({ type: "varchar", length: 255 })
    title!: string;

    @Column("json")
    simulationData!: any;

    @Column("json")
    efficiencyMetrics!: any;

    @Column({ type: "text", nullable: true })
    conclusions!: string | null;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ type: "int", nullable: true })
    createdBy!: number | null;

    @Column({ type: "int", default: 0 })
    packagesProcessed!: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    averageProcessingTime!: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    totalSimulationTime!: number;
}
