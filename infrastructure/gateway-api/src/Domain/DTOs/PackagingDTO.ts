import { PackagingStatus } from "../enums/PackagingStatus";

export class PackagingDTO {
    id!: number
    name!: string;
    adress!: string
    storageId!: number;
    perfumeIds!: number[]
    status!: PackagingStatus;
}