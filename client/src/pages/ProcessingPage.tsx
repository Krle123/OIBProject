import React, { useEffect, useState } from "react";
import { IProcessingAPI } from "../api/processing/IProcessingAPI";
import { IUserAPI } from "../api/users/IUserAPI";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";
import { useAuth } from "../hooks/useAuthHook";
import { PerfumeDTO } from "../models/perfume/PerfumeDTO";
import { PerfumeState } from "../enums/PerfumeState";
import { CatalogPerfumeDTO } from "../models/perfume/CatalogPerfumeDTO";

type ProcessingPageProps = {
    processingAPI: IProcessingAPI;
    userAPI: IUserAPI;
};

export const ProcessingPage: React.FC<ProcessingPageProps> = ({ processingAPI, userAPI }) => {
    const { token } = useAuth();
    const [perfumes, setPerfumes] = useState<CatalogPerfumeDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!token) return;

        setIsLoading(true);
        try {
            const perfumesData = await processingAPI.getCatalogPerfumes(token);
            console.log("Fetched perfumes:", perfumesData);
            setPerfumes(perfumesData);
        } catch (error) {
            console.error("Failed to load perfumes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartProcessing = async () => {
        if (!token || perfumes.length === 0) return;

        try {
            // You can implement logic to start processing for selected perfume
            console.log("Starting processing...");
            // Example: await processingAPI.startProcessing(perfumes[0], token);
            // Then refresh the data
            // await loadData();
        } catch (error) {
            console.error("Error starting processing:", error);
        }
    };

    const getStatusBadge = (state: PerfumeState) => {
        const statusClass = state === PerfumeState.PACKAGED ? "badge-packaged" : "badge-produced";
        const statusText = state === PerfumeState.PACKAGED ? "Сакован" : "Слождиштен";
        return <span className={`status-badge ${statusClass}`}>{statusText}</span>;
    };

    return (
        <div className="dashboard-root">
            <DashboardNavbar userAPI={userAPI} />

            <div className="processing-page-content">
                <div className="processing-header">
                    <h1>Prerada biljaka u parfeme</h1>
                </div>

                <div className="processing-controls">
                    <button className="btn-start-processing" onClick={handleStartProcessing}>
                        Započni preradu
                    </button>
                </div>

                <div className="processing-panel">
                    <div className="panel-header">
                        Parfemi ({perfumes.length})
                    </div>
                    <div className="processing-table-container">
                        {isLoading ? (
                            <div className="processing-empty-state">Учитување...</div>
                        ) : perfumes.length === 0 ? (
                            <div className="processing-empty-state">Нема парфема</div>
                        ) : (
                            <table className="processing-table">
                                <thead>
                                    <tr>
                                        <th>Naziv parfema</th>
                                        <th>Tip</th>
                                        <th>Zapremina</th>
                                        <th>Serijski broj</th>
                                        <th>Rok trajanja</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {perfumes.map((perfume) => (
                                        <tr key={perfume.id}>
                                            <td>{perfume.name}</td>
                                            <td>{perfume.serialNumber}</td>
                                            <td>{perfume.plantId}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    {!isLoading && perfumes.length > 0 && (
                        <div className="processing-footer">
                            Ukupno parfema: {perfumes.length}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
