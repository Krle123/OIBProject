export interface ICommunicationService {
    /**
     * Get packagings from storage
     * @param storageId Storage ID
     * @param numberOfPackages Number of packages to retrieve
     * @returns Array of packaging
     */
    getPackagingsFromStorage(storageId: number, numberOfPackages: number, perfumeSerialNumber?: string): Promise<any[]>;

    /**
     * Log event to log microservice
     * @param type Log type (INFO, WARNING, ERROR)
     * @param description Event description
     */
    logEvent(type: string, description: string): Promise<void>;
}
