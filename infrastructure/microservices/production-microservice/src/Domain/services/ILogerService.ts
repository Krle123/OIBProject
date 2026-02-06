export interface ILogerService {
    logEvent(type: string, description: string): Promise<void>;
}