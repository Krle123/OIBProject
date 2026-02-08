import { PerfumeDTO } from "../../models/perfume/PerfumeDTO";

export interface IProcessingAPI {
    getAllPerfumes(token: string): Promise<PerfumeDTO[]>;
    getPerfumeById(id: number, token: string): Promise<PerfumeDTO>;
    createPerfume(perfume: PerfumeDTO, token: string): Promise<PerfumeDTO>;
    updatePerfume(id: number, perfume: PerfumeDTO, token: string): Promise<PerfumeDTO>;
    deletePerfume(id: number, token: string): Promise<void>;
    startProcessing(perfume: PerfumeDTO, token: string): Promise<PerfumeDTO>;
}
