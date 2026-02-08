import React, { useEffect, useState } from "react";
import { IPlantAPI } from "../api/plants/IPlantAPI";
import { IUserAPI } from "../api/users/IUserAPI";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";
import { useAuth } from "../hooks/useAuthHook";
import { PlantDTO } from "../models/plants/PlantDTO";
import { LogDTO } from "../models/log/LogDTO";
import { PlantState } from "../enums/PlantState";

type ProductionPageProps = {
    plantAPI: IPlantAPI;
    userAPI: IUserAPI;
};

type ActionMode = "plant" | "harvest" | null;

export const ProductionPage: React.FC<ProductionPageProps> = ({ plantAPI, userAPI }) => {
    const { token } = useAuth();
    const [fieldPlants, setFieldPlants] = useState<any[]>([]);
    const [plants, setPlants] = useState<PlantDTO[]>([]);
    const [logs, setLogs] = useState<LogDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionMode, setActionMode] = useState<ActionMode>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        quantity: 1,
        strength: 5,
        selectedPlantId: null as number | null,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!token) return;

        setIsLoading(true);
        try {
            const [fieldPlantsData, plantsData, logsData] = await Promise.all([
                plantAPI.getAllFieldPlants(token),
                plantAPI.getAllPlants(token),
                plantAPI.getProductionLogs(token),
            ]);
            setFieldPlants(fieldPlantsData || []);
            setPlants(plantsData || []);
            setLogs(logsData || []);
        } catch (error) {
            console.error("Failed to load plants:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleActionButtonClick = (mode: ActionMode) => {
        setActionMode(actionMode === mode ? null : mode);
        setFormData({
            quantity: 1,
            strength: 5,
            selectedPlantId: null,
        });
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData({
            ...formData,
            [field]: value,
        });
    };

    const handlePlantSeed = async () => {
        if (!token || !formData.selectedPlantId) {
            alert("Molimo izaberite biljku!");
            return;
        }

        try {
            await plantAPI.plantHerb(formData.selectedPlantId, formData.quantity, token);
            setShowSuccess(true);
            setActionMode(null);
            loadData();
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error: any) {
            console.error("Error planting:", error);
            alert(`Greška pri zasadađivanju! ${error?.response?.data?.message || error.message}`);
        }
    };

    const handleHarvest = async () => {
        if (!token || !formData.selectedPlantId) {
            alert("Molimo izaberite biljku!");
            return;
        }

        try {
            const plant = fieldPlants.find(p => p.id === formData.selectedPlantId);
            if (!plant) return;

            await plantAPI.harvestPlant(formData.selectedPlantId, formData.quantity, token);
            setShowSuccess(true);
            setActionMode(null);
            loadData();
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error: any) {
            console.error("Error harvesting:", error);
            alert(`Greška pri žetvi! ${error?.response?.data?.message || error.message}`);
        }
    };

    const getStatusColor = (status: string) => {
        if (status === PlantState.PLANTED) return "#10b981"; // Green
        if (status === PlantState.PROCESSED) return "#f59e0b"; // Yellow
        return "#ef4444"; // Red
    };

    return (

    <div className="dashboard-root">
        <DashboardNavbar userAPI={userAPI} />

        {/* Main production layout – left and right */}
        <div className="production-page-content production-layout">

            {/* LEFT – existing content */}
            <div className="production-main">
                <div className="production-header">
                    <h1>Upravljanje biljkama</h1>
                </div>

                {showSuccess && (
                    <div className="production-success-message">
                        Operacija uspešno izvršena!
                    </div>
                )}

                <div className="production-action-bar">
                    <button
                        onClick={() => handleActionButtonClick("plant")}
                        className={`production-btn production-btn-primary ${actionMode === "plant" ? "active" : ""}`}
                    >
                        + Zasadi biljku
                    </button>
                    <button
                        onClick={() => handleActionButtonClick("harvest")}
                        className={`production-btn ${actionMode === "harvest" ? "active" : ""}`}
                    >
                        ↓ Uberi biljku
                    </button>
                </div>

                {/* Action Forms */}
                {actionMode === "plant" && (
                    <div className="production-action-panel">
                        <div className="production-form-group">
                            <label>Izaberi biljku:</label>
                            <select
                                value={formData.selectedPlantId || ""}
                                onChange={(e) => handleInputChange("selectedPlantId", parseInt(e.target.value))}
                            >
                                <option value="">-- Izaberi biljku --</option>
                                {plants.map((plant) => (
                                    <option key={plant.id} value={plant.id}>
                                        {plant.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="production-form-group">
                            <label>Količina za zasadađivanje:</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.quantity}
                                onChange={(e) => handleInputChange("quantity", parseInt(e.target.value))}
                            />
                        </div>
                        <button onClick={handlePlantSeed} className="production-submit-btn">
                            Zasadi
                        </button>
                    </div>
                )}

                {actionMode === "harvest" && (
                    <div className="production-action-panel">
                        <div className="production-form-group">
                            <label>Izaberi biljku:</label>
                            <select
                                value={formData.selectedPlantId || ""}
                                onChange={(e) => handleInputChange("selectedPlantId", parseInt(e.target.value))}
                            >
                                <option value="">-- Izaberi biljku --</option>
                                {plants.map((plant) => (
                                        <option key={plant.id} value={plant.id}>
                                            {plant.name}
                                        </option>
                                ))}
                            </select>
                        </div>
                        <div className="production-form-group">
                            <label>Količina:</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.quantity}
                                onChange={(e) => handleInputChange("quantity", parseInt(e.target.value))}
                            />
                        </div>
                        <button onClick={handleHarvest} className="production-submit-btn">
                            Uberi
                        </button>
                    </div>
                )}

                {/* Plants Table */}
                <div className="production-table-container">
                    {isLoading ? (
                        <div className="production-loading">Учитавање...</div>
                    ) : fieldPlants.length === 0 ? (
                        <div className="production-empty">Нема биљака</div>
                    ) : (
                        <table className="production-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Naziv</th>
                                    <th>Latinski naziv</th>
                                    <th>Stanje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fieldPlants.map((plant) => {
                                    return (
                                        <tr key={plant.id}>
                                            <td>{plant.id}</td>
                                            <td>{plant.name}</td>
                                            <td><em>{plant.latinName}</em></td>
                                            <td>
                                                <span
                                                    className="production-status-badge"
                                                    style={{ backgroundColor: getStatusColor(plant.state) }}
                                                >
                                                    {plant.state}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* RIGHT – production journal */}
            <div className="production-journal">
                <div className="production-journal-header">
                    <h2>Dnevnik proizvodnje</h2>
                </div>
                    <div className="production-journal-content">
                        {logs.length === 0 ? (
                            <p className="production-journal-empty">Nema zapisa</p>
                        ) : (
                            logs.slice().reverse().map((log) => (
                                <div className="production-journal-item" key={log.id}>
                                    <div className="journal-date">{log.ts ? new Date(log.ts).toLocaleString('sr-RS') : '-'}</div>
                                    <div>
                                        <div className="journal-action">{log.type} — {log.description}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
            </div>

        </div>
    </div>
);
};
