export interface ISalesAPI {
    getCatalog(token: string): Promise<any[]>;
    getStorages(token: string): Promise<any[]>;
    processSale(token: string, saleData: any): Promise<any>;
    getReceipts(token: string): Promise<any[]>;
}
