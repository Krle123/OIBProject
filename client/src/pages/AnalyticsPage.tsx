import React, { useEffect, useState } from "react";
import { IAnalyticsAPI } from "../api/analytics/IAnalyticsAPI";
import { IUserAPI } from "../api/users/IUserAPI";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";
import { useAuth } from "../hooks/useAuthHook";

type AnalyticsPageProps = {
    analyticsAPI: IAnalyticsAPI;
    userAPI: IUserAPI;
};

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ analyticsAPI, userAPI }) => {
    const { token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "reports" | "receipts">("overview");

    // Analytics data
    const [totalSales, setTotalSales] = useState<any>(null);
    const [top10BestSelling, setTop10BestSelling] = useState<any[]>([]);
    const [top10Revenue, setTop10Revenue] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [receipts, setReceipts] = useState<any[]>([]);

    // Filters
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    useEffect(() => {
        if (token) {
            loadData();
        }
    }, [token]);

    const loadData = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            // Only load existing reports and receipts - don't generate new ones
            const [reportsData, receiptsData] = await Promise.all([
                analyticsAPI.getAllReports(token).catch(() => []),
                analyticsAPI.getReceipts(token).catch(() => [])
            ]);

            setReports(reportsData);
            setReceipts(receiptsData);

            // Calculate statistics from receipts (no new reports created)
            if (receiptsData.length > 0) {
                const totalAmount = receiptsData.reduce((sum: number, r: any) => sum + Number(r.totalAmount || 0), 0);
                setTotalSales({
                    totalRevenue: totalAmount.toFixed(2),
                    totalTransactions: receiptsData.length,
                    totalItemsSold: receiptsData.reduce((sum: number, r: any) => {
                        const perfumes = r.soldPerfumes || [];
                        return sum + perfumes.reduce((pSum: number, p: any) => pSum + (p.quantity || 0), 0);
                    }, 0)
                });

                // Calculate top 10 from receipts
                const perfumeStats = new Map<string, { name: string; quantity: number; revenue: number }>();
                receiptsData.forEach((receipt: any) => {
                    (receipt.soldPerfumes || []).forEach((p: any) => {
                        const existing = perfumeStats.get(p.name) || { name: p.name, quantity: 0, revenue: 0 };
                        perfumeStats.set(p.name, {
                            name: p.name,
                            quantity: existing.quantity + (p.quantity || 0),
                            revenue: existing.revenue + ((p.quantity || 0) * (p.pricePerUnit || 0))
                        });
                    });
                });

                const statsArray = Array.from(perfumeStats.values());
                setTop10BestSelling(statsArray.sort((a, b) => b.quantity - a.quantity).slice(0, 10));
                setTop10Revenue(statsArray.sort((a, b) => b.revenue - a.revenue).slice(0, 10));
            } else {
                setTotalSales(null);
                setTop10BestSelling([]);
                setTop10Revenue([]);
            }
        } catch (error) {
            console.error("Failed to load analytics:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateReport = async (type: string) => {
        if (!token) return;
        setIsLoading(true);
        try {
            switch (type) {
                case "month":
                    await analyticsAPI.getSalesByMonth(token, selectedMonth, selectedYear);
                    break;
                case "year":
                    await analyticsAPI.getSalesByYear(token, selectedYear);
                    break;
                case "total":
                    await analyticsAPI.getTotalSales(token);
                    break;
                case "top10":
                    await analyticsAPI.getTop10BestSelling(token);
                    break;
                case "top10revenue":
                    await analyticsAPI.getTop10Revenue(token);
                    break;
            }
            alert(`Izvestaj generisan! Proverite tab "Izvestaji"`);
            await loadData();
        } catch (error: any) {
            alert(`Greska: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = async (type: "report" | "receipt", id: number) => {
        if (!token) return;
        try {
            const blob = type === "report"
                ? await analyticsAPI.downloadReportPDF(token, id)
                : await analyticsAPI.downloadReceiptPDF(token, id);

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}-${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            alert("Greska pri preuzimanju PDF-a");
        }
    };

    return (
        <div className="dashboard-root">
            <DashboardNavbar userAPI={userAPI} />

            <div className="analytics-page-content">
                <h1>Analiza Podataka</h1>

                {/* Tabs */}
                <div className="analytics-tabs">
                    <button
                        className={`analytics-tab ${activeTab === "overview" ? "active" : ""}`}
                        onClick={() => setActiveTab("overview")}
                    >
                        Pregled
                    </button>
                    <button
                        className={`analytics-tab ${activeTab === "reports" ? "active" : ""}`}
                        onClick={() => setActiveTab("reports")}
                    >
                        Izvestaji ({reports.length})
                    </button>
                    <button
                        className={`analytics-tab ${activeTab === "receipts" ? "active" : ""}`}
                        onClick={() => setActiveTab("receipts")}
                    >
                        Fiskalni Racuni ({receipts.length})
                    </button>
                </div>

                {isLoading ? (
                    <div className="analytics-loading">Ucitavanje...</div>
                ) : (
                    <>
                        {/* Overview Tab */}
                        {activeTab === "overview" && (
                            <div className="analytics-overview">
                                {/* Total Sales Card */}
                                <div className="analytics-card analytics-card-wide">
                                    <h3>Ukupna Prodaja</h3>
                                    {totalSales ? (
                                        <div className="analytics-stats">
                                            <div className="stat-item">
                                                <span className="stat-value">{totalSales.totalRevenue || 0} RSD</span>
                                                <span className="stat-label">Ukupan Prihod</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-value">{totalSales.totalTransactions || 0}</span>
                                                <span className="stat-label">Broj Transakcija</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-value">{totalSales.totalItemsSold || 0}</span>
                                                <span className="stat-label">Prodatih Artikala</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p>Nema podataka</p>
                                    )}
                                </div>

                                {/* Generate Report Controls */}
                                <div className="analytics-card">
                                    <h3>Generisi Izvestaj</h3>
                                    <div className="analytics-filters">
                                        <div className="filter-group">
                                            <label>Godina:</label>
                                            <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                                                {[2024, 2025, 2026].map(y => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="filter-group">
                                            <label>Mesec:</label>
                                            <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                                                {Array.from({length: 12}, (_, i) => (
                                                    <option key={i+1} value={i+1}>{i+1}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="analytics-actions">
                                        <button onClick={() => handleGenerateReport("month")}>Po Mesecu</button>
                                        <button onClick={() => handleGenerateReport("year")}>Po Godini</button>
                                        <button onClick={() => handleGenerateReport("total")}>Ukupno</button>
                                        <button onClick={() => handleGenerateReport("top10")}>Top 10 Prodaja</button>
                                        <button onClick={() => handleGenerateReport("top10revenue")}>Top 10 Prihod</button>
                                    </div>
                                </div>

                                {/* Top 10 Best Selling */}
                                <div className="analytics-card">
                                    <h3>Top 10 Najprodavanijih</h3>
                                    {top10BestSelling.length > 0 ? (
                                        <ul className="analytics-list">
                                            {top10BestSelling.map((item, i) => (
                                                <li key={i}>
                                                    <span className="rank">#{i + 1}</span>
                                                    <span className="name">{item.name || item.perfumeName}</span>
                                                    <span className="value">{item.quantity || item.totalSold} kom</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>Nema podataka</p>
                                    )}
                                </div>

                                {/* Top 10 Revenue */}
                                <div className="analytics-card">
                                    <h3>Top 10 Po Prihodu</h3>
                                    {top10Revenue.length > 0 ? (
                                        <ul className="analytics-list">
                                            {top10Revenue.map((item, i) => (
                                                <li key={i}>
                                                    <span className="rank">#{i + 1}</span>
                                                    <span className="name">{item.name || item.perfumeName}</span>
                                                    <span className="value">{item.revenue || item.totalRevenue} RSD</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>Nema podataka</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reports Tab */}
                        {activeTab === "reports" && (
                            <div className="analytics-reports">
                                {reports.length === 0 ? (
                                    <div className="analytics-empty">Nema sacuvanih izvestaja</div>
                                ) : (
                                    <table className="analytics-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Tip</th>
                                                <th>Period</th>
                                                <th>Datum Kreiranja</th>
                                                <th>Akcije</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reports.map(report => (
                                                <tr key={report.id}>
                                                    <td>{report.id}</td>
                                                    <td>{report.type}</td>
                                                    <td>{report.period || '-'}</td>
                                                    <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <button
                                                            className="btn-download"
                                                            onClick={() => handleDownloadPDF("report", report.id)}
                                                        >
                                                            PDF
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {/* Receipts Tab */}
                        {activeTab === "receipts" && (
                            <div className="analytics-receipts">
                                {receipts.length === 0 ? (
                                    <div className="analytics-empty">Nema fiskalnih racuna</div>
                                ) : (
                                    <table className="analytics-table">
                                        <thead>
                                            <tr>
                                                <th>Broj Racuna</th>
                                                <th>Tip Prodaje</th>
                                                <th>Placanje</th>
                                                <th>Iznos</th>
                                                <th>Datum</th>
                                                <th>Akcije</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {receipts.map(receipt => (
                                                <tr key={receipt.id}>
                                                    <td>{receipt.receiptNumber}</td>
                                                    <td>{receipt.saleType}</td>
                                                    <td>{receipt.paymentMethod}</td>
                                                    <td>{receipt.totalAmount} RSD</td>
                                                    <td>{new Date(receipt.saleDate).toLocaleDateString()}</td>
                                                    <td>
                                                        <button
                                                            className="btn-download"
                                                            onClick={() => handleDownloadPDF("receipt", receipt.id)}
                                                        >
                                                            PDF
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
