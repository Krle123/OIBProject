import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("catalog")
export class CatalogPerfume {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100 })
    serialNumber!: string;

    @Column({ type: "varchar", length: 100 })
    name!: string;

    @Column({ type: "int"})
    plantId!: number; 
}