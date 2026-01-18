export interface IAnalyticsAPI {
    getSalesByMonth(token: string, month: number, year: number): Promise<any>;
    getSalesByWeek(token: string, week: number, year: number): Promise<any>;
    getSalesByYear(token: string, year: number): Promise<any>;
    getTotalSales(token: string): Promise<any>;
    getSalesTrend(token: string, startDate: string, endDate: string): Promise<any>;
    getTop10BestSelling(token: string): Promise<any>;
    getTop10Revenue(token: string): Promise<any>;
    getAllReports(token: string): Promise<any[]>;
    getReportById(token: string, id: number): Promise<any>;
    downloadReportPDF(token: string, id: number): Promise<Blob>;
    getReceipts(token: string): Promise<any[]>;
    downloadReceiptPDF(token: string, id: number): Promise<Blob>;
}
