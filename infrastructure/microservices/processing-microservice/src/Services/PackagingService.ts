import { IPackagingService } from "../Domain/services/IPackagingService";
import { Repository } from "typeorm";
import { Packaging } from "../Domain/models/Packaging";
import { Perfume } from "../Domain/models/Perfume";
import { PackagingStatus } from "../Domain/enums/PackagingStatus";
import { PerfumeState } from "../Domain/enums/PerfumeState";
import { ILogerService } from "../Domain/services/ILogerService";
import { CatalogPerfume } from "../Domain/models/CatalogPerfume";
import { IProcessingService } from "../Domain/services/IProcessingService";

export class PackagingService implements IPackagingService {
    constructor(
        private readonly packagingRepository: Repository<Packaging>,
        private readonly perfumeRepository: Repository<Perfume>,
        private readonly catalogRepository: Repository<CatalogPerfume>,
        private readonly logerService: ILogerService,
        private readonly processingClient: IProcessingService
    ) {}

    async packagePerfume(serialNumber: string, numberOfBottles: number): Promise<Packaging> {
        await this.logerService.logEvent("INFO", `Packaging requested for ${serialNumber} x${numberOfBottles}`);

        const perfumes = await this.perfumeRepository.find({
            where: { serialNumber, state: PerfumeState.PRODUCED },
            take: numberOfBottles,
            order: { id: "ASC" }
        });

        if (!perfumes || perfumes.length === 0) {
            await this.logerService.logEvent("WARNING", `No produced perfumes available for serial ${serialNumber}`);
            throw new Error(`No produced perfumes available for serial ${serialNumber}`);
        }

        const perfumeIds: number[] = [];
        for (const p of perfumes) {
            p.state = PerfumeState.PACKAGED;
            await this.perfumeRepository.save(p);
            perfumeIds.push(p.id);
        }

        const packaging = this.packagingRepository.create({
            name: `${serialNumber}-pkg-${Date.now()}`,
            adress: "",
            storageId: 0,
            perfumeIds,
            status: PackagingStatus.PACKAGED
        });

        const saved = await this.packagingRepository.save(packaging);
        await this.logerService.logEvent("INFO", `Created packaging ${saved.id} for ${perfumeIds.length} perfumes`);
        return saved;
    }

    async sendPackagingToStoraging(storageId: number, numberOfPackages: number, perfumeSerialNumber?: string): Promise<Packaging> {
        await this.logerService.logEvent("INFO", `Request to send packaging to storage ${storageId}`);
        let packaging: Packaging | undefined;

        if (perfumeSerialNumber) {
            // Find any perfumes already packaged with this serial
            const packagedPerfumes = await this.perfumeRepository.find({ where: { serialNumber: perfumeSerialNumber, state: PerfumeState.PACKAGED } });

            if (packagedPerfumes && packagedPerfumes.length > 0) {
                const packagedIds = packagedPerfumes.map(p => p.id);
                const candidates = await this.packagingRepository.find({ where: { status: PackagingStatus.PACKAGED }, order: { id: "ASC" } });
                packaging = candidates.find(pkg => Array.isArray((pkg as any).perfumeIds) && (pkg as any).perfumeIds.some((id: number) => packagedIds.includes(id)));
            }

            if (!packaging) {
                await this.logerService.logEvent("INFO", `No packaged items containing serial ${perfumeSerialNumber} found — creating ${numberOfPackages} package(s)`);
                const createdPackages: Packaging[] = [];
                for (let i = 0; i < numberOfPackages; i++) {
                    const created = await this.packagePerfume(perfumeSerialNumber, 1);
                    createdPackages.push(created);
                }
                packaging = createdPackages[0];
            }
        } else {
            packaging = await this.packagingRepository.findOne({ where: { status: PackagingStatus.PACKAGED }, order: { id: "ASC" } }) || undefined;
        }

        if (!packaging) {
            await this.logerService.logEvent("ERROR", `No packaging available to send to storage ${storageId}`);
            throw new Error(`No packaging available to send`);
        }

        packaging.status = PackagingStatus.SENT;
        packaging.storageId = storageId;
        const updated = await this.packagingRepository.save(packaging);
        await this.logerService.logEvent("INFO", `Packaging ${updated.id} sent to storage ${storageId}`);
        return updated;
    }

    async getCatalogPerfumes(): Promise<CatalogPerfume[]> {
        const perfumes = await this.catalogRepository.find();
        return perfumes.map((p: CatalogPerfume) => ({
            id: p.id,
            name: p.name,
            serialNumber: p.serialNumber,
            plantId: p.plantId
        }));
    }
}