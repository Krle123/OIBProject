export interface ICommunicationService {
    logEvent(type: string, description: string): Promise<void>;
}
