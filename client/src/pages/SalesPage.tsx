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
    const [catalog, setCatalog] = useState<any[]>([]);
    const [storages, setStorages] = useState<any[]>([]);
    const [receipts, setReceipts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPerfumes, setSelectedPerfumes] = useState<{ perfumeId: string; serialNumber: string; name: string; price: number; quantity: number }[]>([]);
    const [saleType, setSaleType] = useState<"RETAIL" | "WHOLESALE">("RETAIL");
    const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "BANK_TRANSFER">("CASH");
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!token) return;

        setIsLoading(true);
        setError("");
        try {
            const [catalogData, storagesData, receiptsData] = await Promise.all([
                salesAPI.getCatalog(token),
                salesAPI.getStorages(token),
                salesAPI.getReceipts(token)
            ]);
            console.log("Učitan katalog:", catalogData);
            console.log("Učitana skladišta:", storagesData);
            setCatalog(catalogData);
            setStorages(storagesData);
            setReceipts(receiptsData);
        } catch (error) {
            console.error("Failed to load data:", error);
            setError("Greška pri učitavanju podataka");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPerfume = (perfume: any) => {
        if (!perfume || !perfume.id) {
            alert("Molimo izaberite parfem");
            return;
        }
        const newPerfume = {
            perfumeId: perfume.id,
            serialNumber: perfume.serialNumber || perfume.id,
            name: perfume.name || "Unknown",
            price: perfume.price || 0,
            quantity: 1
        };
        setSelectedPerfumes([...selectedPerfumes, newPerfume]);
    };

    const handleRemovePerfume = (index: number) => {
        setSelectedPerfumes(selectedPerfumes.filter((_, i) => i !== index));
    };

    const handlePerfumeChange = (index: number, field: string, value: any) => {
        const updated = [...selectedPerfumes];
        if (field === "quantity") {
            const qty = parseInt(value) || 1;
            updated[index] = { ...updated[index], [field]: qty > 0 ? qty : 1 };
        } else {
            updated[index] = { ...updated[index], [field]: value };
        }
        setSelectedPerfumes(updated);
    };

    const handleCreateSale = async () => {
        if (!token || selectedPerfumes.length === 0) {
            setError("Molimo dodajte barem jedan parfem!");
            return;
        }

        const invalidPerfumes = selectedPerfumes.filter(p => !p.serialNumber || p.quantity <= 0);
        if (invalidPerfumes.length > 0) {
            setError("Molimo popunite sve podatke o parfemima!");
            return;
        }

        try {
            setError("");
            // Process each perfume as a separate sale
            for (const perfume of selectedPerfumes) {
                const saleData = {
                    perfumeSerialNumber: perfume.serialNumber,
                    quantity: perfume.quantity,
                    saleType,
                    paymentMethod,
                    sellerId: null,
                    userRole: "SELLER"
                };

                console.log("Šaljem podatke o prodaji:", saleData);
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
            const errorMessage = error?.response?.data?.message || error.message || "Nepoznata greška";
            setError(`Greška pri kreiranju prodaje! ${errorMessage}`);
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

                {error && (
                    <div className="sales-error-message">
                        {error}
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
                                <label>Dodaj parfeme:</label>
                                
                                {/* Perfume selector dropdown */}
                                <div className="sales-perfume-selector">
                                    <select 
                                        defaultValue=""
                                        onChange={(e) => {
                                            const selectedPerfumeId = e.target.value;
                                            if (selectedPerfumeId) {
                                                const perfume = catalog.find(p => p.id === selectedPerfumeId);
                                                if (perfume) {
                                                    handleAddPerfume(perfume);
                                                    e.target.value = "";
                                                }
                                            }
                                        }}
                                    >
                                        <option value="">-- Izaberite parfem --</option>
                                        {isLoading ? (
                                            <option disabled>Učitavanje...</option>
                                        ) : catalog.length === 0 ? (
                                            <option disabled>Nema dostupnih parfema</option>
                                        ) : (
                                            catalog.map((perfume) => (
                                                <option key={perfume.id} value={perfume.id}>
                                                    {perfume.name} - {perfume.price || 0} RSD
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>

                                {/* Selected perfumes list */}
                                {selectedPerfumes.map((perfume, index) => (
                                    <div key={index} className="sales-perfume-row">
                                        <div className="sales-perfume-info">
                                            <div className="sales-perfume-name">{perfume.name}</div>
                                            <div className="sales-perfume-price">{perfume.price} RSD/kom</div>
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="Količina"
                                            min="1"
                                            value={perfume.quantity}
                                            onChange={(e) => handlePerfumeChange(index, "quantity", e.target.value)}
                                            className="sales-perfume-quantity"
                                        />
                                        <div className="sales-perfume-subtotal">
                                            {(perfume.price * perfume.quantity).toLocaleString()} RSD
                                        </div>
                                        <button
                                            onClick={() => handleRemovePerfume(index)}
                                            className="sales-remove-btn"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Ukupan iznos */}
                            {selectedPerfumes.length > 0 && (
                                <div className="sales-total-box">
                                    <strong>Ukupan iznos: </strong>
                                    {selectedPerfumes.reduce((sum, p) => sum + (p.quantity * p.price), 0).toLocaleString()} RSD
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
