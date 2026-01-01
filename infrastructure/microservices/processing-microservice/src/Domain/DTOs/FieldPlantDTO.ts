import { PlantState } from "../enums/PlantState"

export interface FieldPlantDTO {
    id: number;
    name: string;
    aromaticPower: number;
    latinName: string;
    countryOrigin: string;
    state: PlantState;
}