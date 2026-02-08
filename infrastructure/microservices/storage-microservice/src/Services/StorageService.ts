import { Repository } from "typeorm";
import { Storage } from "../Domain/models/Storage";
import { StorageDTO } from "../Domain/DTOs/StorageDTO";
import { IStorageService } from "../Domain/services/IStorageService";
import { ICommunicationService } from "../Domain/services/ICommunicationService";
import { StorageType } from "../Domain/enums/StorageType";

export class StorageService implements IStorageService {
    constructor(
        private readonly storageRepository: Repository<Storage>,
        private readonly communicationService: ICommunicationService
    ) {}

    async sendPackagingFromStorage(perfumeSerialNumber: string, quantity: number, userRole: string): Promise<any[]> {
        try {
            // Determine storage type based on user role
            const storageType = userRole === "MANAGER"
                ? StorageType.DISTRIBUTION_CENTER
                : StorageType.WAREHOUSE_CENTER;

            // Get storage of the appropriate type
            const storage = await this.storageRepository.findOne({
                where: { type: storageType }
            });

            if (!storage) {
                await this.communicationService.logEvent(
                    "ERROR",
                    `No storage found for type: ${storageType}`
                );
                throw new Error(`No storage available for user role: ${userRole}`);
            }

            // Check capacity
            if (storage.currentCapacity < quantity) {
                await this.communicationService.logEvent(
                    "WARNING",
                    `Insufficient packages in storage ${storage.id}. Requested: ${quantity}, Available: ${storage.currentCapacity}`
                );
                // Try to retrieve remaining packages and ensure they contain the requested perfume.
                const remaining = storage.currentCapacity;
                let retrieved = await this.communicationService.getPackagingsFromStorage(storage.id, remaining);
                if (!this.packagesContainPerfume(retrieved, perfumeSerialNumber)) {
                    // Retry asking for packages that specifically contain the perfume serial
                    retrieved = await this.communicationService.getPackagingsFromStorage(storage.id, remaining, perfumeSerialNumber);
                }
                await this.updateStorageCapacity(storage.id, -storage.currentCapacity);
            }

            // Log perfume being requested
            await this.communicationService.logEvent(
                "INFO",
                `Processing package delivery for sales: ${perfumeSerialNumber} (qty: ${quantity}). Storage type: ${storageType}`
            );

            // Determine delivery parameters based on storage type
            const packagesPerDelivery = storageType === StorageType.DISTRIBUTION_CENTER ? 3 : 1;
            const deliveryTime = storageType === StorageType.DISTRIBUTION_CENTER ? 500 : 2500; // milliseconds

            // Calculate number of deliveries needed
            const deliveriesNeeded = Math.ceil(quantity / packagesPerDelivery);
            const packages: any[] = [];

            await this.communicationService.logEvent(
                "INFO",
                `Starting package retrieval from ${storageType}. Deliveries needed: ${deliveriesNeeded}`
            );

            // Simulate package retrieval with delay
            for (let i = 0; i < deliveriesNeeded; i++) {
                await this.delay(deliveryTime);

                const packagesInThisDelivery = Math.min(
                    packagesPerDelivery,
                    quantity - packages.length
                );

                let retrievedPackages = await this.communicationService.getPackagingsFromStorage(
                    storage.id,
                    packagesInThisDelivery
                );

                // If retrieved packages do not contain the requested perfume, ask for targeted packages
                if (!this.packagesContainPerfume(retrievedPackages, perfumeSerialNumber)) {
                    const targeted = await this.communicationService.getPackagingsFromStorage(
                        storage.id,
                        packagesInThisDelivery,
                        perfumeSerialNumber
                    );
                    if (Array.isArray(targeted) && targeted.length > 0) {
                        retrievedPackages = targeted;
                    }
                }

                packages.push(...retrievedPackages);

                await this.communicationService.logEvent(
                    "INFO",
                    `Delivery ${i + 1}/${deliveriesNeeded} completed. Retrieved ${packagesInThisDelivery} packages`
                );
            }

            // Update storage capacity
            await this.updateStorageCapacity(storage.id, -quantity);

            await this.communicationService.logEvent(
                "INFO",
                `Successfully retrieved ${packages.length} packages from storage ${storage.id} for sale of ${perfumeSerialNumber}`
            );

            return packages;
        } catch (error: any) {
            await this.communicationService.logEvent(
                "ERROR",
                `Failed to send packaging from storage: ${error.message}`
            );
            throw error;
        }
    }

    async getAllStorages(): Promise<StorageDTO[]> {
        const storages = await this.storageRepository.find();
        return storages.map(storage => new StorageDTO(storage));
    }

    async getStorageById(id: number): Promise<StorageDTO | null> {
        const storage = await this.storageRepository.findOne({ where: { id } });
        return storage ? new StorageDTO(storage) : null;
    }

    async createStorage(storageData: Partial<StorageDTO>): Promise<StorageDTO> {
        const storage = this.storageRepository.create(storageData);
        const savedStorage = await this.storageRepository.save(storage);

        await this.communicationService.logEvent(
            "INFO",
            `Storage created: ${savedStorage.name} (ID: ${savedStorage.id})`
        );

        return new StorageDTO(savedStorage);
    }

    async updateStorageCapacity(storageId: number, increment: number): Promise<StorageDTO> {
        const storage = await this.storageRepository.findOne({ where: { id: storageId } });

        if (!storage) {
            throw new Error(`Storage with ID ${storageId} not found`);
        }

        storage.currentCapacity += increment;

        // Validate capacity constraints
        if (storage.currentCapacity < 0) {
            storage.currentCapacity = 0;
        }

        if (storage.currentCapacity > storage.maxCapacity) {
            await this.communicationService.logEvent(
                "WARNING",
                `Storage ${storageId} exceeded max capacity. Current: ${storage.currentCapacity}, Max: ${storage.maxCapacity}`
            );
        }

        const updatedStorage = await this.storageRepository.save(storage);

        await this.communicationService.logEvent(
            "INFO",
            `Storage ${storageId} capacity updated. New capacity: ${updatedStorage.currentCapacity}/${updatedStorage.maxCapacity}`
        );

        return new StorageDTO(updatedStorage);
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private packageContainsPerfume(pkg: any, perfumeSerialNumber: string): boolean {
        if (!pkg) return false;
        // Try numeric id match if serial is numeric and package exposes perfumeIds
        const maybeId = Number(perfumeSerialNumber);
        if (!Number.isNaN(maybeId) && Array.isArray(pkg.perfumeIds)) {
            if (pkg.perfumeIds.includes(maybeId)) return true;
        }

        // Fallback: check string serial properties
        if (typeof pkg.perfumeSerial === 'string' && pkg.perfumeSerial === perfumeSerialNumber) return true;
        if (typeof pkg.perfumeSerialNumber === 'string' && pkg.perfumeSerialNumber === perfumeSerialNumber) return true;

        // Some DTOs may store perfumes as objects
        if (Array.isArray(pkg.perfumes)) {
            if (pkg.perfumes.some((p: any) => p.serialNumber === perfumeSerialNumber || p.serial === perfumeSerialNumber)) return true;
        }

        return false;
    }

    private packagesContainPerfume(pkgs: any[] | undefined, perfumeSerialNumber: string): boolean {
        if (!Array.isArray(pkgs) || pkgs.length === 0) return false;
        return pkgs.some(p => this.packageContainsPerfume(p, perfumeSerialNumber));
    }
}
