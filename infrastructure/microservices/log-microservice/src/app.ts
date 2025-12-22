import cors from 'cors';
import express from 'express';
import "reflect-metadata";
import dotenv from 'dotenv';
import { LogController } from './WebAPI/controllers/LogController';
import { ILogService } from './Domain/services/ILogService';
import { LogService } from './Services/LogService';
import { Db } from './Database/DbConnectionPool';
import { initialize_database } from './Database/InitializeConnection';
import { ILogerService } from './Domain/services/ILogerService';
import { LogerService } from './Services/LogerService';
import { Log } from './Domain/models/Log';

dotenv.config({ quiet: true });

const app = express();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["POST"];

// Protected microservice from unauthorized access
app.use(cors({
  origin: corsOrigin,
  methods: corsMethods,
}));

const logRepository = Db.getRepository(Log);
const logService: ILogService = new LogService(logRepository);
//const logerService: ILogerService = new LogerService();

initialize_database();

const logController = new LogController(logService);

app.use('/api/v1', logController.getRouter());

export default app;



