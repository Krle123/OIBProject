import React, { useEffect, useState } from "react";
import { ISalesAPI } from "../api/sales/ISalesAPI";
import { IUserAPI } from "../api/users/IUserAPI";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";
import { useAuth } from "../hooks/useAuthHook";

type SalesPageProps = {
    salesAPI: ISalesAPI;
    userAPI: IUserAPI;
};

export const SalesPage: React.FC<SalesPageProps> = ({ salesAPI, userAPI }) => {
    const { token } = useAuth();
    const [storages, setStorages] = useState<any[]>([]);
    const [receipts, setReceipts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPerfumes, setSelectedPerfumes] = useState<{ name: string; quantity: number }[]>([]);
    const [saleType, setSaleType] = useState<"RETAIL" | "WHOLESALE">("RETAIL");
    const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "BANK_TRANSFER">("CASH");
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!token) return;

        setIsLoading(true);
        try {
            const [storagesData, receiptsData] = await Promise.all([
                salesAPI.getStorages(token),
                salesAPI.getReceipts(token)
            ]);
            setStorages(storagesData);
            setReceipts(receiptsData);
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPerfume = () => {
        setSelectedPerfumes([...selectedPerfumes, { name: "", quantity: 1 }]);
    };

    const handleRemovePerfume = (index: number) => {
        setSelectedPerfumes(selectedPerfumes.filter((_, i) => i !== index));
    };

    const handlePerfumeChange = (index: number, field: string, value: any) => {
        const updated = [...selectedPerfumes];
        updated[index] = { ...updated[index], [field]: value };
        setSelectedPerfumes(updated);
    };

    const handleCreateSale = async () => {
        if (!token || selectedPerfumes.length === 0) {
            alert("Molimo dodajte barem jedan parfem!");
            return;
        }

        const invalidPerfumes = selectedPerfumes.filter(p => !p.name || p.quantity <= 0);
        if (invalidPerfumes.length > 0) {
            alert("Molimo popunite sve podatke o parfemima!");
            return;
        }

        try {
            console.log("Token:", token);
            console.log("Selected perfumes:", selectedPerfumes);
            console.log("Sale type:", saleType);
            console.log("Payment method:", paymentMethod);

            // Process each perfume as a separate sale
            for (const perfume of selectedPerfumes) {
                const saleData = {
                    perfumeSerialNumber: perfume.name, // Using name as serial number for now
                    quantity: perfume.quantity,
                    saleType,
                    paymentMethod,
                    sellerId: null,
                    userRole: "SELLER"
                };

                console.log("Šaljem podatke o prodaji:", saleData);
                console.log("URL koji se poziva:", `${import.meta.env.VITE_GATEWAY_URL || "http://localhost:4000/api/v1"}/sales/process`);
                const response = await salesAPI.processSale(token, saleData);
                console.log("Odgovor sa servera:", response);
            }

            setShowSuccess(true);
            setSelectedPerfumes([]);

            // Reload receipts
            const receiptsData = await salesAPI.getReceipts(token);
            setReceipts(receiptsData);

            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error: any) {
            console.error("Detaljna greška:", error);
            console.error("Response data:", error?.response?.data);
            console.error("Status:", error?.response?.status);
            alert(`Greška pri kreiranju prodaje! ${error?.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className="dashboard-root">
            <DashboardNavbar userAPI={userAPI} />

            <div className="sales-page-content">
                <h1>Prodaja Parfema</h1>

                {showSuccess && (
                    <div className="sales-success-message">
                        Prodaja uspešno kreirana!
                    </div>
                )}

                <div className="sales-grid">
                    {/* Leva strana - Kreiranje prodaje */}
                    <div className="sales-form-panel">
                        <div className="panel-header">
                            Nova Prodaja
                        </div>

                        <div className="sales-form-content">
                            {/* Tip prodaje */}
                            <div className="sales-form-group">
                                <label>Tip prodaje:</label>
                                <select
                                    value={saleType}
                                    onChange={(e) => setSaleType(e.target.value as any)}
                                >
                                    <option value="RETAIL">Maloprodaja</option>
                                    <option value="WHOLESALE">Veleprodaja</option>
                                </select>
                            </div>

                            {/* Način plaćanja */}
                            <div className="sales-form-group">
                                <label>Način plaćanja:</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                                >
                                    <option value="CASH">Gotovina</option>
                                    <option value="CARD">Kartica</option>
                                    <option value="BANK_TRANSFER">Uplata na račun</option>
                                </select>
                            </div>

                            {/* Parfemi */}
                            <div className="sales-form-group">
                                <label>Parfemi:</label>

                                {selectedPerfumes.map((perfume, index) => (
                                    <div key={index} className="sales-perfume-row">
                                        <input
                                            type="text"
                                            placeholder="Naziv parfema"
                                            value={perfume.name}
                                            onChange={(e) => handlePerfumeChange(index, "name", e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Količina"
                                            min="1"
                                            value={perfume.quantity}
                                            onChange={(e) => handlePerfumeChange(index, "quantity", parseInt(e.target.value))}
                                        />
                                        <button
                                            onClick={() => handleRemovePerfume(index)}
                                            className="sales-remove-btn"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}

                                <button onClick={handleAddPerfume} className="sales-add-btn">
                                    + Dodaj parfem
                                </button>
                            </div>

                            {/* Ukupan iznos */}
                            {selectedPerfumes.length > 0 && (
                                <div className="sales-total-box">
                                    <strong>Ukupan iznos: </strong>
                                    {selectedPerfumes.reduce((sum, p) => sum + (p.quantity * 1000), 0)} RSD
                                </div>
                            )}

                            {/* Dugme za kreiranje */}
                            <button
                                onClick={handleCreateSale}
                                disabled={selectedPerfumes.length === 0}
                                className="sales-submit-btn"
                            >
                                Kreiraj Prodaju
                            </button>
                        </div>
                    </div>

                    {/* Desna strana - Skladišta i računi */}
                    <div className="sales-sidebar">
                        {/* Skladišta */}
                        <div className="sales-sidebar-panel">
                            <div className="panel-header">
                                Skladišta ({storages.length})
                            </div>
                            <div className="sales-sidebar-content">
                                {isLoading ? (
                                    <div className="sales-empty-state">Učitavanje...</div>
                                ) : storages.length === 0 ? (
                                    <div className="sales-empty-state">Nema skladišta</div>
                                ) : (
                                    storages.map((storage) => (
                                        <div key={storage.id} className="sales-storage-item">
                                            <div className="sales-storage-name">{storage.name}</div>
                                            <div className="sales-storage-location">{storage.location}</div>
                                            <div className="sales-storage-capacity">
                                                Kapacitet: {storage.currentCapacity}/{storage.maxCapacity}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Fiskalni računi */}
                        <div className="sales-sidebar-panel">
                            <div className="panel-header">
                                Fiskalni Računi ({receipts.length})
                            </div>
                            <div className="sales-sidebar-content">
                                {receipts.length === 0 ? (
                                    <div className="sales-empty-state">Nema fiskalnih računa</div>
                                ) : (
                                    receipts.map((receipt) => (
                                        <div key={receipt.id} className="sales-receipt-item">
                                            <div className="sales-receipt-id">Račun #{receipt.id}</div>
                                            <div className="sales-receipt-details">
                                                {receipt.saleType} - {receipt.paymentMethod}
                                            </div>
                                            <div className="sales-receipt-amount">
                                                {receipt.totalAmount} RSD
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
