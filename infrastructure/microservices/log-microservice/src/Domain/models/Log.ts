import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { LogType } from "../enums/LogType";

@Entity("audit_logs")
export class Log {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    ts!: string;

    @Column({ type: "enum", enum: LogType })
    type!: LogType;

    @Column({ type: "varchar", length: 255 })
    description!: string;
}
