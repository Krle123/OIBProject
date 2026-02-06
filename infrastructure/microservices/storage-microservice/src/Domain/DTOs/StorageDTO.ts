import { StorageType } from "../enums/StorageType";

export class StorageDTO {
    id!: number;
    name!: string;
    location!: string;
    maxCapacity!: number;
    currentCapacity!: number;
    type!: StorageType;

    constructor(data: Partial<StorageDTO>) {
        Object.assign(this, data);
    }
}
