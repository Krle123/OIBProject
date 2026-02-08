import React, { useEffect, useState } from "react";
import { IPlantAPI } from "../api/plants/IPlantAPI";
import { IUserAPI } from "../api/users/IUserAPI";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";
import { useAuth } from "../hooks/useAuthHook";
import { PlantDTO } from "../models/plants/PlantDTO";
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
            const fieldPlantsData = await plantAPI.getAllFieldPlants(token);
            setFieldPlants(fieldPlantsData);
            const plantsData = await plantAPI.getAllPlants(token);
            setPlants(plantsData);
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
            alert("Molimo izaberite биљку!");
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
            alert(`Greška pri zasađivању! ${error?.response?.data?.message || error.message}`);
        }
    };

    const handleHarvest = async () => {
        if (!token || !formData.selectedPlantId) {
            alert("Molimo izaberite биљку!");
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
            alert(`Greška при жетви! ${error?.response?.data?.message || error.message}`);
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

            <div className="production-page-content">
                <div className="production-header">
                    <h1>Управљање биљакама</h1>
                </div>

                {showSuccess && (
                    <div className="production-success-message">
                        Операција успешно извршена!
                    </div>
                )}

                <div className="production-action-bar">
                    <button
                        onClick={() => handleActionButtonClick("plant")}
                        className={`production-btn production-btn-primary ${actionMode === "plant" ? "active" : ""}`}
                    >
                        + Засади биљку
                    </button>
                    <button
                        onClick={() => handleActionButtonClick("harvest")}
                        className={`production-btn ${actionMode === "harvest" ? "active" : ""}`}
                    >
                        ↓ Убери биљку
                    </button>
                </div>

                {/* Action Forms */}
                {actionMode === "plant" && (
                    <div className="production-action-panel">
                        <div className="production-form-group">
                            <label>Изаберите биљку:</label>
                            <select
                                value={formData.selectedPlantId || ""}
                                onChange={(e) => handleInputChange("selectedPlantId", parseInt(e.target.value))}
                            >
                                <option value="">-- Изаберите биљку --</option>
                                {plants.map((plant) => (
                                    <option key={plant.id} value={plant.id}>
                                        {plant.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="production-form-group">
                            <label>Количина за засађивање:</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.quantity}
                                onChange={(e) => handleInputChange("quantity", parseInt(e.target.value))}
                            />
                        </div>
                        <button onClick={handlePlantSeed} className="production-submit-btn">
                            Засади
                        </button>
                    </div>
                )}

                {actionMode === "harvest" && (
                    <div className="production-action-panel">
                        <div className="production-form-group">
                            <label>Изаберите биљку:</label>
                            <select
                                value={formData.selectedPlantId || ""}
                                onChange={(e) => handleInputChange("selectedPlantId", parseInt(e.target.value))}
                            >
                                <option value="">-- Изаберите биљку --</option>
                                {plants.map((plant) => (
                                        <option key={plant.id} value={plant.id}>
                                            {plant.name}
                                        </option>
                                ))}
                            </select>
                        </div>
                        <div className="production-form-group">
                            <label>Количина:</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.quantity}
                                onChange={(e) => handleInputChange("quantity", parseInt(e.target.value))}
                            />
                        </div>
                        <button onClick={handleHarvest} className="production-submit-btn">
                            Убери
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
                                    <th>Назив</th>
                                    <th>Латински назив</th>
                                    <th>Стање</th>
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
        </div>
    );
};
