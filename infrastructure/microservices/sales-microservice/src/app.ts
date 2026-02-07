import cors from 'cors';
import express from 'express';
import "reflect-metadata";
import dotenv from 'dotenv';
import { SalesController } from './WebAPI/controllers/SalesController';
import { ISalesService } from './Domain/services/ISalesService';
import { SalesService } from './Services/SalesService';
import { ICommunicationService } from './Domain/services/ICommunicationService';
import { CommunicationService } from './Services/CommunicationService';
import { Db } from './Database/DbConnectionPool';
import { initialize_database } from './Database/InitializeConnection';
import { FiscalReceipt } from './Domain/models/FiscalReceipt';
import { Repository } from 'typeorm';

dotenv.config({ quiet: true });

const app = express();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["POST", "PUT", "GET", "DELETE"];

// Protected microservice from unauthorized access
app.use(cors({
  origin: corsOrigin,
  methods: corsMethods,
}));

// Initialize repositories

const receiptRepository: Repository<FiscalReceipt> = Db.getRepository(FiscalReceipt);

// Initialize services with dependency injection
const communicationService: ICommunicationService = new CommunicationService();
const salesService: ISalesService = new SalesService(receiptRepository, communicationService);

// Initialize database
initialize_database();

// Initialize controller
const salesController = new SalesController(salesService);

// Register routes
app.use('/api/v1', salesController.getRouter());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sales microservice is running',
    timestamp: new Date().toISOString()
  });
});

export default app;
