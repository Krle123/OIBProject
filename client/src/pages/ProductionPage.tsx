import React, { useEffect, useState } from "react";
import { IPlantAPI } from "../api/plants/IPlantAPI";
import { IUserAPI } from "../api/users/IUserAPI";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";
import { useAuth } from "../hooks/useAuthHook";

type ProductionPageProps = {
    plantAPI: IPlantAPI;
    userAPI: IUserAPI;
};

type ActionMode = "plant" | "harvest" | "strength" | null;

export const ProductionPage: React.FC<ProductionPageProps> = ({ plantAPI, userAPI }) => {
    const { token } = useAuth();
    const [plants, setPlants] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionMode, setActionMode] = useState<ActionMode>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        plantName: "",
        latinName: "",
        countryOrigin: "",
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
            plantName: "",
            latinName: "",
            countryOrigin: "",
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
        if (!token || !formData.plantName || !formData.latinName || !formData.countryOrigin) {
            alert("Molimo popunite sve podatke!");
            return;
        }

        try {
            

            //await plantAPI.createPlant(); messed up here
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
            // Assuming harvest reduces quantity or marks as harvested
            const plant = plants.find(p => p.id === formData.selectedPlantId);
            if (!plant) return;

            const updatedPlant = {
                ...plant,
                quantity: Math.max(0, (plant.quantity || 1) - (formData.quantity || 1)),
            };

            await plantAPI.updatePlant(formData.selectedPlantId, updatedPlant, token);
            setShowSuccess(true);
            setActionMode(null);
            loadData();
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error: any) {
            console.error("Error harvesting:", error);
            alert(`Greška при жетви! ${error?.response?.data?.message || error.message}`);
        }
    };

    const handleChangeStrength = async () => {
        if (!token || !formData.selectedPlantId) {
            alert("Molimo izaberite биљку!");
            return;
        }

        try {
            const plant = plants.find(p => p.id === formData.selectedPlantId);
            if (!plant) return;

            const updatedPlant = {
                ...plant,
                strength: formData.strength,
            };

            await plantAPI.updatePlant(formData.selectedPlantId, updatedPlant, token);
            setShowSuccess(true);
            setActionMode(null);
            loadData();
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error: any) {
            console.error("Error updating strength:", error);
            alert(`Greška при промени јачине! ${error?.response?.data?.message || error.message}`);
        }
    };

    const getStatusBadge = (strength: number) => {
        if (strength >= 8) return "Позитивна";
        if (strength >= 5) return "Обична";
        return "Преболна";
    };

    const getStatusColor = (status: string) => {
        if (status === "Позитивна") return "#10b981"; // Green
        if (status === "Обична") return "#f59e0b"; // Yellow
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
                    <button
                        onClick={() => handleActionButtonClick("strength")}
                        className={`production-btn ${actionMode === "strength" ? "active" : ""}`}
                    >
                        ≈ Промени јачину
                    </button>
                </div>

                {/* Action Forms */}
                {actionMode === "plant" && (
                    <div className="production-action-panel">
                        <div className="production-form-group">
                            <label>Назив:</label>
                            <input
                                type="text"
                                placeholder="Назив биљке"
                                value={formData.plantName}
                                onChange={(e) => handleInputChange("plantName", e.target.value)}
                            />
                        </div>
                        <div className="production-form-group">
                            <label>Латински назив:</label>
                            <input
                                type="text"
                                placeholder="Латински назив"
                                value={formData.latinName}
                                onChange={(e) => handleInputChange("latinName", e.target.value)}
                            />
                        </div>
                        <div className="production-form-group">
                            <label>Земља:</label>
                            <input
                                type="text"
                                placeholder="Земља порекла"
                                value={formData.countryOrigin}
                                onChange={(e) => handleInputChange("countryOrigin", e.target.value)}
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

                {actionMode === "strength" && (
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
                            <label>Јачина (1-10):</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={formData.strength}
                                onChange={(e) => handleInputChange("strength", parseInt(e.target.value))}
                            />
                        </div>
                        <button onClick={handleChangeStrength} className="production-submit-btn">
                            Промени јачину
                        </button>
                    </div>
                )}

                {/* Plants Table */}
                <div className="production-table-container">
                    {isLoading ? (
                        <div className="production-loading">Учитавање...</div>
                    ) : plants.length === 0 ? (
                        <div className="production-empty">Нема биљака</div>
                    ) : (
                        <table className="production-table">
                            <thead>
                                <tr>
                                    <th>Назив</th>
                                    <th>Латински назив</th>
                                    <th>Јачина</th>
                                    <th>Количина</th>
                                    <th>Стање</th>
                                </tr>
                            </thead>
                            <tbody>
                                {plants.map((plant) => {
                                    const strength = plant.strength || 5;
                                    const status = getStatusBadge(strength);
                                    return (
                                        <tr key={plant.id}>
                                            <td>{plant.name}</td>
                                            <td><em>{plant.latinName}</em></td>
                                            <td>{strength}</td>
                                            <td>{plant.quantity || 1}</td>
                                            <td>
                                                <span
                                                    className="production-status-badge"
                                                    style={{ backgroundColor: getStatusColor(status) }}
                                                >
                                                    {status}
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
