import cors from 'cors';
import express from 'express';
import "reflect-metadata";
import dotenv from 'dotenv';
import { Db } from './Database/DbConnectionPool';
import { initialize_database } from './Database/InitializeConnection';
import { ProcessingController } from './WebAPI/controllers/ProcessingController';
import { IProcessingService } from './Domain/services/IProcessingService';
import { ProcessingService } from './Services/ProcessingService';
import { ICommunicationService } from './Domain/services/ICommunicationService';
import { CommunicationService } from './Services/CommunicationService';
import { Perfume } from './Domain/models/Perfume';
import { LogerService } from './Services/LogerService';
import { ILogerService } from './Domain/services/ILogerService';
import { PackagingService } from './Services/PackagingService';
import { Packaging } from './Domain/models/Packaging';

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

const processingRepository = Db.getRepository(Perfume);
const packagingRepository = Db.getRepository(Packaging);
const communicationService: ICommunicationService = new CommunicationService();
const logerService: ILogerService = new LogerService();
const processingService: IProcessingService = new ProcessingService(communicationService, processingRepository, logerService);
const packagingService = new PackagingService(packagingRepository, processingRepository, logerService);

initialize_database();

const processingController = new ProcessingController(processingService, packagingService);

app.use('/api/v1', processingController.getRouter());

export default app;