import { PerfumeType } from "../enums/PerfumeType";

export class PerfumeDTO {
    id!: number
    name!: string;
    serialNumber!: string;
    type!: PerfumeType;
    quantity!: number;
    plantId!: number
    expirationDate!: string;
}