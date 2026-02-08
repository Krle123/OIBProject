import { IPackagingService } from "../Domain/services/IPackagingService";
import { Repository } from "typeorm";
import { Packaging } from "../Domain/models/Packaging";
import { Perfume } from "../Domain/models/Perfume";
import { PackagingStatus } from "../Domain/enums/PackagingStatus";
import { PerfumeState } from "../Domain/enums/PerfumeState";
import { ILogerService } from "../Domain/services/ILogerService";
import { CatalogPerfume } from "../Domain/models/CatalogPerfume";
import { IProcessingService } from "../Domain/services/IProcessingService";
import { PerfumeType } from "../Domain/enums/PerfumeType";

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
            const perfume = await this.catalogRepository.findOne({ where: { serialNumber } });
            const perfumeData = new Perfume();
            perfumeData.name = perfume?.name || `Perfume ${serialNumber}`;
            perfumeData.serialNumber = serialNumber;
            perfumeData.type = PerfumeType.COLOGNE;
            perfumeData.quantity = numberOfBottles;
            perfumeData.plantId = perfume?.plantId || 0;
            perfumeData.state = PerfumeState.PRODUCED;
            perfumeData.expirationDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 1 year from now
                
                
            if (!perfume) {
                await this.logerService.logEvent("ERROR", `No catalog entry found for serial ${serialNumber}`);
                throw new Error(`No catalog entry found for serial number: ${serialNumber}`);
            }
            this.processingClient.createPerfumeBatch(perfumeData, numberOfBottles);
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
        await this.logerService.logEvent("INFO", `Request to send ${numberOfPackages} packaging(s) to storage ${storageId}`);

        if (perfumeSerialNumber) {
            console.log(`[PackagingService.sendPackagingToStoraging] Checking for packaged items containing perfume serial ${perfumeSerialNumber}`);
            
            // Find all packagings in PACKAGED status
            const allPackagings = await this.packagingRepository.find({
                where: { status: PackagingStatus.PACKAGED },
                order: { id: "ASC" }
            });

            // Get perfumes with the requested serial number
            const requestedPerfumes = await this.perfumeRepository.find({
                where: { serialNumber: perfumeSerialNumber, state: PerfumeState.PACKAGED }
            });

            // Find packagings that contain perfumes with the requested serial
            const matchingPackagings = allPackagings.filter(pkg => 
                pkg.perfumeIds.some(id => requestedPerfumes.some(p => p.id === id))
            );

            const availableCount = matchingPackagings.length;
            console.log(`[PackagingService.sendPackagingToStoraging] Found ${availableCount} packagings containing perfume serial ${perfumeSerialNumber}`);

            if (availableCount < numberOfPackages) {
                const packagesToCreate = numberOfPackages - availableCount;
                await this.logerService.logEvent("INFO", `Found ${availableCount} packaged items, creating ${packagesToCreate} more package(s)`);
                
                for (let i = 0; i < packagesToCreate; i++) {
                    await this.packagePerfume(perfumeSerialNumber, 1);
                }
            } else {
                await this.logerService.logEvent("INFO", `Found ${availableCount} packaged items, which is enough for the request`);
            }
        }

        // Now fetch the packages to send
        let packagingsToSend: Packaging[];
        if (perfumeSerialNumber) {
            const allPackagings = await this.packagingRepository.find({
                where: { status: PackagingStatus.PACKAGED },
                order: { id: "ASC" }
            });
            const requestedPerfumes = await this.perfumeRepository.find({
                where: { serialNumber: perfumeSerialNumber, state: PerfumeState.PACKAGED }
            });
            packagingsToSend = allPackagings.filter(pkg => 
                pkg.perfumeIds.some(id => requestedPerfumes.some(p => p.id === id))
            ).slice(0, numberOfPackages);
        } else {
            packagingsToSend = await this.packagingRepository.find({
                where: { status: PackagingStatus.PACKAGED },
                order: { id: "ASC" },
                take: numberOfPackages
            });
        }

        if (packagingsToSend.length === 0) {
            if (perfumeSerialNumber) {
                await this.logerService.logEvent("INFO", `No packages found, creating ${numberOfPackages} new package(s) for ${perfumeSerialNumber}`);
                for (let i = 0; i < numberOfPackages; i++) {
                    await this.packagePerfume(perfumeSerialNumber, 1);
                }
                // Fetch the newly created packages
                const allPackagings = await this.packagingRepository.find({
                    where: { status: PackagingStatus.PACKAGED },
                    order: { id: "ASC" }
                });
                const requestedPerfumes = await this.perfumeRepository.find({
                    where: { serialNumber: perfumeSerialNumber, state: PerfumeState.PACKAGED }
                });
                packagingsToSend = allPackagings.filter(pkg => 
                    pkg.perfumeIds.some(id => requestedPerfumes.some(p => p.id === id))
                ).slice(0, numberOfPackages);
            } else {
                await this.logerService.logEvent("ERROR", `No packaging available to send to storage ${storageId}`);
                throw new Error(`No packaging available to send`);
            }
        }

        // Update all packages to sent status
        for (const pkg of packagingsToSend) {
            pkg.status = PackagingStatus.SENT;
            pkg.storageId = storageId;
            await this.packagingRepository.save(pkg);
        }

        await this.logerService.logEvent("INFO", `Sent ${packagingsToSend.length} packaging(s) to storage ${storageId}`);
        return packagingsToSend[0];
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