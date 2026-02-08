import React, { useEffect, useState } from "react";
import { ISalesAPI } from "../api/sales/ISalesAPI";
import { IUserAPI } from "../api/users/IUserAPI";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";
import { useAuth } from "../hooks/useAuthHook";
import { CatalogPerfumeDTO } from "../models/perfume/CatalogPerfumeDTO";
import { FiscalReceiptDTO } from "../models/analysis/FiscalReceiptDTO";
import { IProcessingAPI } from "../api/processing/IProcessingAPI";

type SalesPageProps = {
    salesAPI: ISalesAPI;
    userAPI: IUserAPI;
    processingAPI: IProcessingAPI;
};

export const SalesPage: React.FC<SalesPageProps> = ({ salesAPI, userAPI, processingAPI }) => {
    const { token } = useAuth();
    const [catalog, setCatalog] = useState<CatalogPerfumeDTO[]>([]);
    const [storages, setStorages] = useState<any[]>([]);
    const [receipts, setReceipts] = useState<FiscalReceiptDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPerfume, setSelectedPerfume] = useState<{ perfumeId: number; serialNumber: string; name: string; price: number } | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
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
                processingAPI.getCatalogPerfumes(token),
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

        setSelectedPerfume({
            perfumeId: perfume.id,
            serialNumber: perfume.serialNumber || perfume.id.toString(),
            name: perfume.name || "Unknown",
            price: perfume.price || 500
        });
        setQuantity(1);
    };

    const handleRemovePerfume = () => {
        setSelectedPerfume(null);
        setQuantity(1);
    };

    const handleCreateSale = async () => {
        if (!token || !selectedPerfume) {
            setError("Molimo dodajte parfem!");
            return;
        }

        if (!selectedPerfume.serialNumber || quantity <= 0) {
            setError("Molimo popunite sve podatke!");
            return;
        }

        try {
            setError("");
            const saleData = {
                perfumeSerialNumber: selectedPerfume.serialNumber,
                quantity: quantity,
                saleType,
                paymentMethod,
                sellerId: null,
                userRole: "SELLER"
            };

            console.log("Šaljem podatke o prodaji:", saleData);
            const response = await salesAPI.processSale(token, saleData);
            console.log("Odgovor sa servera:", response);

            setShowSuccess(true);
            setSelectedPerfume(null);
            setQuantity(1);

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
                                <label>Parfem:</label>
                                
                                {/* Perfume selector dropdown */}
                                <select 
                                    value={selectedPerfume?.perfumeId || ""}
                                    onChange={(e) => {
                                        const perfumeId = e.target.value;
                                        if (perfumeId) {
                                            const perfume = catalog.find(p => p.id.toString() === perfumeId);
                                            if (perfume) {
                                                handleAddPerfume(perfume);
                                            }
                                        }
                                    }}
                                    className="sales-perfume-dropdown"
                                >
                                    <option value="">-- Izaberite parfem --</option>
                                    {isLoading ? (
                                        <option disabled>Učitavanje...</option>
                                    ) : catalog.length === 0 ? (
                                        <option disabled>Nema dostupnih parfema</option>
                                    ) : (
                                        catalog.map((perfume) => (
                                            <option key={perfume.id} value={perfume.id}>
                                                {perfume.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            {/* Selected perfume with quantity */}
                            {selectedPerfume && (
                                <div className="sales-perfume-selection">
                                    <div className="sales-perfume-info">
                                        <div className="sales-perfume-name">{selectedPerfume.name}</div>
                                        <div className="sales-perfume-price">{selectedPerfume.price} RSD/kom</div>
                                    </div>

                                    {/* Dropdown for Type */}
                                    <div className="sales-perfume-type">
                                        <label>Tip:</label>
                                        <select
                                        /*Logic*/
                                        >
                                            <option value="PERFUME">Parfem</option>
                                            <option value="COLOGNE">Kolonjska voda</option>
                                        </select>
                                    </div>

                                    {/* Dropdown for Bottle Size */}
                                    <div className="sales-perfume-size">
                                        <label>Veličina bočice:</label>
                                        <select
                                        /*Logic*/
                                        >
                                            <option value="150ml">150ml</option>
                                            <option value="250ml">250ml</option>
                                        </select>
                                    </div>

                                    <div className="sales-quantity-section">
                                        <label>Količina:</label>
                                        <input
                                            type="number"
                                            placeholder="Količina"
                                            min="1"
                                            value={quantity}
                                            onChange={(e) => {
                                                const qty = parseInt(e.target.value) || 1;
                                                setQuantity(qty > 0 ? qty : 1);
                                            }}
                                            className="sales-quantity-input"
                                        />
                                    </div>

                                    <div className="sales-perfume-subtotal">
                                        <label>Ukupno: </label>
                                        {(selectedPerfume.price * quantity).toLocaleString()} RSD
                                    </div>

                                    <button
                                        onClick={handleRemovePerfume}
                                        className="sales-remove-btn"
                                    >
                                        ✕ Ukloni
                                    </button>
                                </div>
                            )}

                            {/* Dugme za kreiranje */}
                            <button
                                onClick={handleCreateSale}
                                disabled={!selectedPerfume}
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
