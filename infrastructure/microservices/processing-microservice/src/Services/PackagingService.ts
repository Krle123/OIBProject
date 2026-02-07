import { IPackagingService } from "../Domain/services/IPackagingService";
import { Repository } from "typeorm";
import { Packaging } from "../Domain/models/Packaging";
import { Perfume } from "../Domain/models/Perfume";
import { PackagingStatus } from "../Domain/enums/PackagingStatus";
import { PerfumeState } from "../Domain/enums/PerfumeState";
import { ILogerService } from "../Domain/services/ILogerService";

export class PackagingService implements IPackagingService {
    constructor(
        private readonly packagingRepository: Repository<Packaging>,
        private readonly perfumeRepository: Repository<Perfume>,
        private readonly logerService: ILogerService
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

    async sendPackagingToStoraging(storageId: number): Promise<Packaging> {
        await this.logerService.logEvent("INFO", `Request to send packaging to storage ${storageId}`);

        let packaging = await this.packagingRepository.findOne({ where: { status: PackagingStatus.PACKAGED }, order: { id: "ASC" } });

        if (!packaging) {
            await this.logerService.logEvent("INFO", `No packaged items available, attempting to create one`);
            const produced = await this.perfumeRepository.find({ where: { state: PerfumeState.PRODUCED }, order: { id: "ASC" }, take: 1 });
            if (!produced || produced.length === 0) {
                await this.logerService.logEvent("ERROR", `No produced perfumes available to package and send`);
                throw new Error("No produced perfumes available to package and send");
            }

            // Package the first produced perfume
            packaging = await this.packagePerfume(produced[0].serialNumber, 1);
        }

        // Mark as sent and assign storage
        packaging.status = PackagingStatus.SENT;
        packaging.storageId = storageId;
        const updated = await this.packagingRepository.save(packaging);
        await this.logerService.logEvent("INFO", `Packaging ${updated.id} sent to storage ${storageId}`);
        return updated;
    }
}