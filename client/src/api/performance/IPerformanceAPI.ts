export interface IPerformanceAPI {
    runSimulation(token: string, algorithmType: string, numberOfPackages: number): Promise<any>;
    getAllReports(token: string): Promise<any[]>;
    getReportById(token: string, id: number): Promise<any>;
    getReportsByAlgorithmType(token: string, algorithmType: string): Promise<any[]>;
    downloadReportPDF(token: string, id: number): Promise<Blob>;
}
