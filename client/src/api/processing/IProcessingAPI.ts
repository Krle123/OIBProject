import { PackagingDTO } from "../../models/packaging/PackagingDTO";
import { CatalogPerfumeDTO } from "../../models/perfume/CatalogPerfumeDTO";
import { PerfumeDTO } from "../../models/perfume/PerfumeDTO";

export interface IProcessingAPI {
  createPerfumeBatch(perfume: PerfumeDTO, numberOfBottles: number, token: string): Promise<PerfumeDTO[]>;
  sendPackagingToStorage(storageId: number, token: string): Promise<any>;
  packagePerfume(serialNumber: string, numberOfBottles: number, token: string): Promise<PackagingDTO>;
  getCatalogPerfumes(token: string): Promise<CatalogPerfumeDTO[]>;
}
