import React from "react";

export const PregledPage: React.FC = () => {
  return (
    <div
      className="dashboard-page-content"
      style={{
        display: "flex",
        gap: "16px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Left panel: Lista biljaka */}
      <div
        className="dashboard-panel"
        style={{
          flex: "0 0 calc(50% - 8px)", // 50% minus half of gap
          boxSizing: "border-box",
        }}
      >
        <div
          className="panel-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Lista biljaka</span>
          <button className="panel-add">+</button>
        </div>

        <input
          className="panel-search"
          placeholder="Pretraga biljaka..."
          style={{ margin: "8px 0", padding: "8px", width: "100%" }}
        />

        <table
          className="dashboard-table"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Naziv</th>
              <th>Latinski naziv</th>
              <th>Jacina</th>
              <th>Zemlja</th>
              <th>Stanje</th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Right panel: Fiskalni racun */}
      <div
        className="dashboard-panel"
        style={{
          flex: "0 0 calc(50% - 8px)", // 50% minus half of gap
          boxSizing: "border-box",
        }}
      >
        <div
          className="panel-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Fiskalni racun</span>
          <button className="panel-add">+</button>
        </div>

        <input
          className="panel-search"
          placeholder="Pretraga racuna..."
          style={{ margin: "8px 0", padding: "8px", width: "100%" }}
        />

        <table
          className="dashboard-table"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Broj racuna</th>
              <th>Tip prodaje</th>
              <th>Nacin placanja</th>
              <th>Iznos (RSD)</th>
              <th>Datum</th>
            </tr>
          </thead>
        </table>
      </div>
    </div>
  );
};
