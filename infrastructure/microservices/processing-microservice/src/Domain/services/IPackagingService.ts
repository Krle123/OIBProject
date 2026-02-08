import { CatalogPerfume } from "../models/CatalogPerfume";
import { Packaging } from "../models/Packaging";

export interface IPackagingService {
    packagePerfume(serialNumber: string, numberOfBottles: number): Promise<Packaging>;
    sendPackagingToStoraging(storageId: number, numberOfPackages: number, perfumeSerialNumber?: string): Promise<Packaging>;
    getCatalogPerfumes(): Promise<CatalogPerfume[]>;
}