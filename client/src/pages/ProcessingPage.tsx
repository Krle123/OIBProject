import React, { useEffect, useState } from "react";
import { IProcessingAPI } from "../api/processing/IProcessingAPI";
import { IUserAPI } from "../api/users/IUserAPI";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";
import { useAuth } from "../hooks/useAuthHook";
import { PerfumeDTO } from "../models/perfume/PerfumeDTO";
import { PerfumeState } from "../enums/PerfumeState";
import { CatalogPerfumeDTO } from "../models/perfume/CatalogPerfumeDTO";
import { PlantDTO } from "../models/plants/PlantDTO";
import { IPlantAPI } from "../api/plants/IPlantAPI";
import { PerfumeType } from "../enums/PerfumeType";

type ProcessingPageProps = {
    processingAPI: IProcessingAPI;
    plantAPI: IPlantAPI; 
    userAPI: IUserAPI;
};

type ActionMode = "process" | null;

export const ProcessingPage: React.FC<ProcessingPageProps> = ({ processingAPI, plantAPI, userAPI }) => {
    const { token } = useAuth();
    const [perfumes, setPerfumes] = useState<CatalogPerfumeDTO[]>([]);
    const [plants, setPlants] = useState<PlantDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionMode, setActionMode] = useState<ActionMode>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        numberOfBottles: 1,
        selectedPerfumeId: null as number | null,
        quantity: 1,
        type: PerfumeType.COLOGNE,
        expirationDate: new Date().toISOString().split("T")[0] // Default to today's date
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!token) return;

        setIsLoading(true);
        try {
            const perfumesData = await processingAPI.getCatalogPerfumes(token);
            console.log("Loaded perfumes:", perfumesData);
            setPerfumes(perfumesData);
            const plantData = await plantAPI.getAllPlants(token);
            console.log("Loaded plants:", plantData);
            setPlants(plantData);
        } catch (error) {
            console.error("Failed to load perfumes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleActionButtonClick = (mode: ActionMode) => {
        setActionMode(actionMode === mode ? null : mode);
        setFormData({
            numberOfBottles: 1,
            selectedPerfumeId: null,
            quantity: 1,
            type: PerfumeType.COLOGNE,
            expirationDate: new Date().toISOString().split("T")[0] // Set default expiration date to today
        });
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData({
            ...formData,
            [field]: value,
        });
    };

    const handleStartProcessing = async () => {
        if (!token || !formData.selectedPerfumeId) {
            alert("Molimo izaberite parfem!");
            return;
        }

        try {
            const selectedPerfume = perfumes.find(p => p.id === formData.selectedPerfumeId);
            if (!selectedPerfume) return;

            const perfumeToProcess: PerfumeDTO = {
                id: 0,
                name: selectedPerfume.name,
                serialNumber: selectedPerfume.serialNumber,
                type: formData.type,
                quantity: formData.quantity,
                plantId: selectedPerfume.plantId,
                state: PerfumeState.PRODUCED,
                expirationDate: formData.expirationDate
            };

            await processingAPI.createPerfumeBatch(perfumeToProcess, formData.numberOfBottles, token);
            setShowSuccess(true);
            setActionMode(null);
            loadData();
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error: any) {
            console.error("Error processing:", error);
            alert(`Greška pri preradi! ${error?.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className="dashboard-root">
            <DashboardNavbar userAPI={userAPI} />

            <div className="processing-page-content">
                <div className="processing-header">
                    <h1>Prerada biljaka u parfeme</h1>
                </div>

                {showSuccess && (
                    <div className="processing-success-message">
                        Operacija uspešno izvršena!
                    </div>
                )}

                <div className="processing-controls">
                    <button 
                        className={`btn-start-processing ${actionMode === "process" ? "active" : ""}`}
                        onClick={() => handleActionButtonClick("process")}
                    >
                        Započni preradu
                    </button>
                </div>

                {/* Action Forms */}
                {actionMode === "process" && (
                    <div className="processing-action-panel">
                        <div className="processing-form-group">
                            <label>Izaberi parfem:</label>
                            <select
                                value={formData.selectedPerfumeId || ""}
                                onChange={(e) => handleInputChange("selectedPerfumeId", parseInt(e.target.value))}
                            >
                                <option value="">-- Izaberi parfem --</option>
                                {perfumes.map((perfume) => (
                                    <option key={perfume.id} value={perfume.id}>
                                        {perfume.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="processing-form-group">
                            <label>Broj boca:</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.numberOfBottles}
                                onChange={(e) => handleInputChange("numberOfBottles", parseInt(e.target.value))}
                            />
                        </div>
                        <div className="processing-form-group">
                            <label>Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => handleInputChange("type", e.target.value as PerfumeType)}>
                                <option value={PerfumeType.COLOGNE}>Cologne</option>
                                <option value={PerfumeType.PERFUME}>Perfume</option>
                            </select>
                        </div>
                        <div className="processing-form-group">
                            <label>Quantity(ml)</label>
                            <select
                                value={formData.quantity}
                                onChange={(e) => handleInputChange("quantity", parseInt(e.target.value))}>
                                <option value={150}>150ml</option>
                                <option value={250}>250ml</option>
                            </select>
                        </div>
                        <div className="processing-form-group">
                            <label>Expiration Date</label>
                            <input
                                type="date"
                                value={formData.expirationDate}
                                onChange={(e) => handleInputChange("expirationDate", e.target.value)}
                            />
                        </div>
                        <button onClick={handleStartProcessing} className="processing-submit-btn">
                            Preraditi
                        </button>
                    </div>
                )}

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
                                        <th>Id</th>
                                        <th>Naziv parfema</th>
                                        <th>Serijski broj</th>
                                        <th>Biljka</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {perfumes.map((perfume) => (
                                        <tr key={perfume.id}>
                                            <td>{perfume.id}</td>
                                            <td>{perfume.name}</td>
                                            <td>{perfume.serialNumber}</td>
                                            <td>{plants.find(p => p.id === perfume.plantId)?.name || "Nepoznata biljka"}</td>
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
