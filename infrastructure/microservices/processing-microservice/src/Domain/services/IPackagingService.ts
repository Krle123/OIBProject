import { Packaging } from "../models/Packaging";

export interface IPackagingService {
    packagePerfume(serialNumber: string, numberOfBottles: number): Promise<Packaging>;
    sendPackagingToStoraging(storageId: number): Promise<Packaging>;
}