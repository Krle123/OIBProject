import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { PlantState } from "../enums/PlantState";

@Entity("fields_plants")
export class FieldPlant {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100 })
    name!: string;

    @Column({ type: "float", default: 1})
    aromaticPower!: number;

    @Column({ type: "varchar", length: 100 })
    latinName!: string;

    @Column({ type: "varchar", length: 100 })
    countryOrigin!: string;

    @Column({ type: "enum", enum: PlantState, default: PlantState.PLANTED })
    state!: PlantState;
}