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

    async sendPackagingFromStorage(numberOfPackages: number, userRole: string): Promise<any[]> {
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
            if (storage.currentCapacity < numberOfPackages) {
                await this.communicationService.logEvent(
                    "WARNING",
                    `Insufficient packages in storage ${storage.id}. Requested: ${numberOfPackages}, Available: ${storage.currentCapacity}`
                );
                throw new Error(`Insufficient packages in storage. Available: ${storage.currentCapacity}, Requested: ${numberOfPackages}`);
            }

            // Determine delivery parameters based on storage type
            const packagesPerDelivery = storageType === StorageType.DISTRIBUTION_CENTER ? 3 : 1;
            const deliveryTime = storageType === StorageType.DISTRIBUTION_CENTER ? 500 : 2500; // milliseconds

            // Calculate number of deliveries needed
            const deliveriesNeeded = Math.ceil(numberOfPackages / packagesPerDelivery);
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
                    numberOfPackages - packages.length
                );

                const retrievedPackages = await this.communicationService.getPackagingsFromStorage(
                    storage.id,
                    packagesInThisDelivery
                );

                packages.push(...retrievedPackages);

                await this.communicationService.logEvent(
                    "INFO",
                    `Delivery ${i + 1}/${deliveriesNeeded} completed. Retrieved ${packagesInThisDelivery} packages`
                );
            }

            // Update storage capacity
            await this.updateStorageCapacity(storage.id, -numberOfPackages);

            await this.communicationService.logEvent(
                "INFO",
                `Successfully retrieved ${packages.length} packages from storage ${storage.id}`
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
}
