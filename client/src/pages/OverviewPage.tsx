import React, { useEffect, useState } from "react";
import { IPlantAPI } from "../api/plants/IPlantAPI";
import { ISalesAPI } from "../api/sales/ISalesAPI";
import { IUserAPI } from "../api/users/IUserAPI";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";
import { useAuth } from "../hooks/useAuthHook";

type OverviewPageProps = {
    plantAPI: IPlantAPI;
    salesAPI: ISalesAPI;
    userAPI: IUserAPI;
};

export const OverviewPage: React.FC<OverviewPageProps> = ({ plantAPI, salesAPI, userAPI }) => {
    const { token } = useAuth();
    const [plants, setPlants] = useState<any[]>([]);
    const [receipts, setReceipts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!token) return;

        setIsLoading(true);
        try {
            const [plantsData, receiptsData] = await Promise.all([
                plantAPI.getAllPlants(token),
                salesAPI.getReceipts(token)
            ]);
            setPlants(plantsData);
            setReceipts(receiptsData);
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dashboard-root">
            <DashboardNavbar userAPI={userAPI} />

            <div className="overview-page-content">
                <h1>Pregled</h1>

                <div className="overview-grid">
                    {/* Leva strana - Lista biljaka */}
                    <div className="overview-panel">
                        <div className="panel-header">
                            Lista bilijaka ({plants.length})
                        </div>
                        <div className="overview-table-container">
                            {isLoading ? (
                                <div className="overview-empty-state">Učitavanje...</div>
                            ) : plants.length === 0 ? (
                                <div className="overview-empty-state">Nema bilijaka</div>
                            ) : (
                                <table className="overview-table">
                                    <thead>
                                        <tr>
                                            <th>Naziv</th>
                                            <th>Latinski naziv</th>
                                            <th>Zemlja</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {plants.map((plant) => (
                                            <tr key={plant.id}>
                                                <td>{plant.name}</td>
                                                <td><em>{plant.latinName}</em></td>
                                                <td>{plant.countryOrigin}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        {!isLoading && plants.length > 0 && (
                            <div className="overview-footer">
                                Ukupno: {plants.length}
                            </div>
                        )}
                    </div>

                    {/* Desna strana - Fiskalni računi */}
                    <div className="overview-panel">
                        <div className="panel-header">
                            Fiskalni Računi ({receipts.length})
                        </div>
                        <div className="overview-table-container">
                            {isLoading ? (
                                <div className="overview-empty-state">Učitavanje...</div>
                            ) : receipts.length === 0 ? (
                                <div className="overview-empty-state">Nema fiskalnih računa</div>
                            ) : (
                                <table className="overview-table">
                                    <thead>
                                        <tr>
                                            <th>Broj računa</th>
                                            <th>Tip prodaje</th>
                                            <th>Nacin placanja</th>
                                            <th>Iznos (RSD)</th>
                                            <th>Datum</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {receipts.map((receipt) => (
                                            <tr key={receipt.id}>
                                                <td>{receipt.id}</td>
                                                <td>{receipt.saleType}</td>
                                                <td>{receipt.paymentMethod}</td>
                                                <td>{receipt.totalAmount}</td>
                                                <td>{receipt.dateCreated ? new Date(receipt.dateCreated).toLocaleDateString('sr-RS') : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        {!isLoading && receipts.length > 0 && (
                            <div className="overview-footer">
                                Ukupan iznos: {receipts.reduce((sum, r) => sum + (r.totalAmount || 0), 0)} РСД
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
