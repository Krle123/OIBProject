export interface ICommunicationService {
    /**
     * Get available perfumes from processing microservice
     * @returns Array of available perfumes
     */
    getAvailablePerfumes(): Promise<any[]>;

    /**
     * Request packaging from processing microservice
     * @param perfumeSerialNumber Serial number of perfume
     * @param quantity Quantity needed
     * @returns Packaging response
     */
    requestPackaging(perfumeSerialNumber: string, quantity: number): Promise<any>;

    /**
     * Send packaging to storage (processing microservice)
     * @param storageId Storage ID
     * @returns Packaging sent to storage
     */
    sendPackagingToStorage(storageId: number): Promise<any>;

    /**
     * Get packagings from storage
     * @param storageId Storage ID
     * @param numberOfPackages Number of packages to retrieve
     * @returns Array of packaging
     */
    getPackagingsFromStorage(storageId: number, numberOfPackages: number): Promise<any[]>;

    /**
     * Log event to log microservice
     * @param type Log type (INFO, WARNING, ERROR)
     * @param description Event description
     */
    logEvent(type: string, description: string): Promise<void>;

    /**
     * Send sale data to analysis microservice
     * @param receiptData Fiscal receipt data
     */
    sendSaleToAnalysis(receiptData: any): Promise<void>;
}
