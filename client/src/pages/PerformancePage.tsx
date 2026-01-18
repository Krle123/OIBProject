import React, { useEffect, useState } from "react";
import { IPerformanceAPI } from "../api/performance/IPerformanceAPI";
import { IUserAPI } from "../api/users/IUserAPI";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";
import { useAuth } from "../hooks/useAuthHook";

type PerformancePageProps = {
    performanceAPI: IPerformanceAPI;
    userAPI: IUserAPI;
};

export const PerformancePage: React.FC<PerformancePageProps> = ({ performanceAPI, userAPI }) => {
    const { token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [activeTab, setActiveTab] = useState<"simulation" | "reports">("simulation"); // Start on reports tab to show data

    // Simulation form
    const [algorithmType, setAlgorithmType] = useState<string>("DISTRIBUTIVE_CENTER");
    const [numberOfPackages, setNumberOfPackages] = useState<number>(10);

    // Reports
    const [reports, setReports] = useState<any[]>([]);
    const [selectedReport, setSelectedReport] = useState<any | null>(null);
    const [filterAlgorithm, setFilterAlgorithm] = useState<string>("all");

    useEffect(() => {
        if (token) {
            loadReports();
        }
    }, [token]);

    const loadReports = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const reportsData = await performanceAPI.getAllReports(token);
            setReports(reportsData);
        } catch (error) {
            console.error("Failed to load reports:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRunSimulation = async () => {
        if (!token) return;
        if (numberOfPackages < 1 || numberOfPackages > 1000) {
            alert("Broj paketa mora biti između 1 i 1000");
            return;
        }

        setIsSimulating(true);
        try {
            const report = await performanceAPI.runSimulation(token, algorithmType, numberOfPackages);
            alert("Simulacija uspešno završena!");
            await loadReports();
            setSelectedReport(report);
        } catch (error: any) {
            console.error("Failed to run simulation:", error);
            alert(`Greška pri pokretanju simulacije: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsSimulating(false);
        }
    };

    const handleDownloadPDF = async (reportId: number) => {
        if (!token) return;
        try {
            const blob = await performanceAPI.downloadReportPDF(token, reportId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `performance-report-${reportId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Failed to download PDF:", error);
            alert("Greška pri preuzimanju PDF-a");
        }
    };

    const handleViewReport = async (reportId: number) => {
        if (!token) return;
        try {
            const report = await performanceAPI.getReportById(token, reportId);
            setSelectedReport(report);
        } catch (error) {
            console.error("Failed to load report:", error);
            alert("Greška pri učitavanju izveštaja");
        }
    };

    const getAlgorithmName = (type: string): string => {
        switch (type) {
            case "DISTRIBUTIVE_CENTER":
                return "Distributivni Centar";
            case "WAREHOUSE_CENTER":
                return "Magacinski Centar";
            default:
                return type;
        }
    };

    const filteredReports = filterAlgorithm === "all"
        ? reports
        : reports.filter(r => r.algorithmType === filterAlgorithm);

    return (
        <div className="performance-page">
            <DashboardNavbar userAPI={userAPI} />

            <div className="performance-page-content">
                <h1>Analiza Performansi</h1>

                {/* Tabs */}
                <div className="performance-tabs">
                    <button
                        className={`performance-tab ${activeTab === "simulation" ? "active" : ""}`}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveTab("simulation");
                        }}
                    >
                        Simulacija
                    </button>
                    <button
                        className={`performance-tab ${activeTab === "reports" ? "active" : ""}`}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveTab("reports");
                        }}
                    >
                        Izveštaji ({reports.length})
                    </button>
                </div>
                {isLoading && !isSimulating ? (
                    <div className="performance-loading">
                        <p>Učitavanje...</p>
                    </div>
                ) : (
                    <>
                        {/* Simulation Tab */}
                        {activeTab === "simulation" && (
                            <div className="performance-simulation">
                                <div className="performance-card">
                                    <h2>Pokreni Simulaciju Performansi</h2>
                                    <p className="performance-description">
                                        Simulacija analizira performanse logističkih algoritama za skladištenje.
                                        Odaberite tip algoritma i broj paketa za simulaciju.
                                    </p>

                                    <div className="performance-form">
                                        <div className="form-group">
                                            <label>Tip Algoritma:</label>
                                            <select
                                                value={algorithmType}
                                                onChange={(e) => setAlgorithmType(e.target.value)}
                                                disabled={isSimulating}
                                            >
                                                <option value="DISTRIBUTIVE_CENTER">Distributivni Centar Skladišta</option>
                                                <option value="WAREHOUSE_CENTER">Magacinski Centar Skladišta</option>
                                            </select>
                                            <small>
                                                {algorithmType === "DISTRIBUTIVE_CENTER"
                                                    ? "Omogućava slanje 3 ambaлаже odjednom, vreme: 0.5s po paketu"
                                                    : "Omogućava slanje 1 ambaлаже odjednom, vreme: 2.5s po paketu"}
                                            </small>
                                        </div>

                                        <div className="form-group">
                                            <label>Broj Paketa:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="1000"
                                                value={numberOfPackages}
                                                onChange={(e) => setNumberOfPackages(Number(e.target.value))}
                                                disabled={isSimulating}
                                            />
                                            <small>Broj paketa za simulaciju (1-1000)</small>
                                        </div>

                                        <button
                                            className="btn-primary"
                                            onClick={handleRunSimulation}
                                            disabled={isSimulating}
                                        >
                                            {isSimulating ? "Simulacija u toku..." : "Pokreni Simulaciju"}
                                        </button>
                                    </div>
                                </div>

                                {selectedReport && (
                                    <div className="performance-card">
                                        <h3>Poslednji Rezultati</h3>
                                        <div className="performance-metrics">
                                            <div className="metric">
                                                <span className="metric-label">Tip Algoritma:</span>
                                                <span className="metric-value">{getAlgorithmName(selectedReport.algorithmType)}</span>
                                            </div>
                                            <div className="metric">
                                                <span className="metric-label">Procesirano Paketa:</span>
                                                <span className="metric-value">{selectedReport.packagesProcessed}</span>
                                            </div>
                                            <div className="metric">
                                                <span className="metric-label">Ukupno Vreme:</span>
                                                <span className="metric-value">{parseFloat(selectedReport.totalSimulationTime || 0).toFixed(2)}s</span>
                                            </div>
                                            <div className="metric">
                                                <span className="metric-label">Prosečno Vreme:</span>
                                                <span className="metric-value">{parseFloat(selectedReport.averageProcessingTime || 0).toFixed(2)}s</span>
                                            </div>
                                            {selectedReport.efficiencyMetrics && (
                                                <>
                                                    <div className="metric">
                                                        <span className="metric-label">Efikasnost:</span>
                                                        <span className="metric-value">{parseFloat(selectedReport.efficiencyMetrics.efficiency || 0).toFixed(2)}%</span>
                                                    </div>
                                                    <div className="metric">
                                                        <span className="metric-label">Throughput:</span>
                                                        <span className="metric-value">{parseFloat(selectedReport.efficiencyMetrics.throughput || 0).toFixed(2)} paketa/s</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        {selectedReport.conclusions && (
                                            <div className="performance-conclusions">
                                                <h4>Zaključci:</h4>
                                                <pre>{selectedReport.conclusions}</pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Reports Tab */}
                        {activeTab === "reports" && (
                            <div className="performance-reports">
                                <div className="performance-filters">
                                    <label>Filtriraj po algoritmu:</label>
                                    <select
                                        value={filterAlgorithm}
                                        onChange={(e) => setFilterAlgorithm(e.target.value)}
                                    >
                                        <option value="all">Svi</option>
                                        <option value="DISTRIBUTIVE_CENTER">Distributivni Centar</option>
                                        <option value="WAREHOUSE_CENTER">Magacinski Centar</option>
                                    </select>
                                </div>

                                {filteredReports.length === 0 ? (
                                    <div className="performance-empty">Nema sačuvanih izveštaja</div>
                                ) : (
                                    <>
                                        <table className="performance-table">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Tip Algoritma</th>
                                                    <th>Paketa</th>
                                                    <th>Vreme (s)</th>
                                                    <th>Efikasnost</th>
                                                    <th>Datum</th>
                                                    <th>Akcije</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredReports.map(report => (
                                                    <tr key={report.id}>
                                                        <td>{report.id}</td>
                                                        <td>{getAlgorithmName(report.algorithmType)}</td>
                                                        <td>{report.packagesProcessed}</td>
                                                        <td>{parseFloat(report.totalSimulationTime || 0).toFixed(2)}</td>
                                                        <td>{parseFloat(report.efficiencyMetrics?.efficiency || 0).toFixed(2)}%</td>
                                                        <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                                                        <td>
                                                            <button
                                                                className="btn-view"
                                                                onClick={() => handleViewReport(report.id)}
                                                            >
                                                                Pregled
                                                            </button>
                                                            <button
                                                                className="btn-download"
                                                                onClick={() => handleDownloadPDF(report.id)}
                                                            >
                                                                PDF
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {selectedReport && (
                                            <div className="performance-report-detail">
                                                <h3>Detalji Izveštaja #{selectedReport.id}</h3>
                                                <div className="performance-metrics">
                                                    <div className="metric">
                                                        <span className="metric-label">Naslov:</span>
                                                        <span className="metric-value">{selectedReport.title}</span>
                                                    </div>
                                                    <div className="metric">
                                                        <span className="metric-label">Tip Algoritma:</span>
                                                        <span className="metric-value">{getAlgorithmName(selectedReport.algorithmType)}</span>
                                                    </div>
                                                    <div className="metric">
                                                        <span className="metric-label">Procesirano Paketa:</span>
                                                        <span className="metric-value">{selectedReport.packagesProcessed}</span>
                                                    </div>
                                                    <div className="metric">
                                                        <span className="metric-label">Ukupno Vreme:</span>
                                                        <span className="metric-value">{parseFloat(selectedReport.totalSimulationTime || 0).toFixed(2)}s</span>
                                                    </div>
                                                    <div className="metric">
                                                        <span className="metric-label">Prosečno Vreme:</span>
                                                        <span className="metric-value">{parseFloat(selectedReport.averageProcessingTime || 0).toFixed(2)}s</span>
                                                    </div>
                                                    {selectedReport.efficiencyMetrics && (
                                                        <>
                                                            <div className="metric">
                                                                <span className="metric-label">Efikasnost:</span>
                                                                <span className="metric-value">{parseFloat(selectedReport.efficiencyMetrics.efficiency || 0).toFixed(2)}%</span>
                                                            </div>
                                                            <div className="metric">
                                                                <span className="metric-label">Throughput:</span>
                                                                <span className="metric-value">{parseFloat(selectedReport.efficiencyMetrics.throughput || 0).toFixed(2)} paketa/s</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                {selectedReport.conclusions && (
                                                    <div className="performance-conclusions">
                                                        <h4>Zaključci i Preporuke:</h4>
                                                        <pre>{selectedReport.conclusions}</pre>
                                                    </div>
                                                )}
                                                <button
                                                    className="btn-close"
                                                    onClick={() => setSelectedReport(null)}
                                                >
                                                    Zatvori
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
