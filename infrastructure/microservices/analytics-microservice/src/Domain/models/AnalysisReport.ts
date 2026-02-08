import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { AnalysisType } from "../enums/AnalysisType";

@Entity("analysis_reports")
export class AnalysisReport {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "enum",
        enum: AnalysisType
    })
    analysisType!: AnalysisType;

    @Column({ type: "varchar", length: 255 })
    title!: string;

    @Column({ type: "text", nullable: true })
    description!: string | null;

    @Column({ type: "double", nullable: true })
    total!: number | null;

    @Column({ type: "json", nullable: true })
    receipts!: any[] | null;

    @Column({ type: "json", nullable: true })
    perfumes!: any[] | null;

    @Column({ type: "json", nullable: true })
    trend!: { date: string; value: number }[] | null;

    @Column({ type: "double", nullable: true })
    extraData!: number | null;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ type: "int", nullable: true })
    createdBy!: number | null;

    @Column({ type: "date", nullable: true })
    periodStart!: Date | null;

    @Column({ type: "date", nullable: true })
    periodEnd!: Date | null;
}
