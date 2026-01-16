import { StorageDTO } from "../DTOs/StorageDTO";

export interface IStorageService {
    /**
     * Send packaging from storage based on user role
     * @param numberOfPackages Number of packages to send
     * @param userRole User role (MANAGER or SELLER)
     * @returns Array of packaging DTOs
     */
    sendPackagingFromStorage(numberOfPackages: number, userRole: string): Promise<any[]>;

    /**
     * Get all storages
     * @returns Array of storage DTOs
     */
    getAllStorages(): Promise<StorageDTO[]>;

    /**
     * Get storage by ID
     * @param id Storage ID
     * @returns Storage DTO
     */
    getStorageById(id: number): Promise<StorageDTO | null>;

    /**
     * Create new storage
     * @param storageData Storage data
     * @returns Created storage DTO
     */
    createStorage(storageData: Partial<StorageDTO>): Promise<StorageDTO>;

    /**
     * Update storage capacity
     * @param storageId Storage ID
     * @param increment Number to add/subtract from current capacity
     * @returns Updated storage DTO
     */
    updateStorageCapacity(storageId: number, increment: number): Promise<StorageDTO>;
}
