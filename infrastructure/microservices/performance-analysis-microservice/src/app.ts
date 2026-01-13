import express from "express";
import performanceAnalysisController from "./WebAPI/PerformanceAnalysisController";

const app = express();
app.use(express.json());
app.use("/performance", performanceAnalysisController);

export default app;
