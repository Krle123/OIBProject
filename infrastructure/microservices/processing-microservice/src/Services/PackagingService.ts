import { IPackagingService } from "../Domain/services/IPackagingService";

export class PackagingService implements IPackagingService {
    async packagePerfume(serialNumber: string, numberOfBottles: number) {
        // Implementation for packaging perfume
        return {} as any;
    }

    async sendPackagingToStoraging(storageId: number) {
        // Implementation for sending packaging to storage
        return {} as any;
    }
}