import { PerfumeState } from "../enums/PerfumeState";
import { PerfumeType } from "../enums/PerfumeType";

export class PerfumeDTO {
    id!: number
    name!: string;
    serialNumber!: string;
    type!: PerfumeType;
    quantity!: number;
    plantId!: number;
    state!: PerfumeState;
    expirationDate!: string;
}