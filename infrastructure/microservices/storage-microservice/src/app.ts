import cors from 'cors';
import express from 'express';
import "reflect-metadata";
import dotenv from 'dotenv';
import { Db } from './Database/DbConnectionPool';
import { Repository } from 'typeorm';
import { CommunicationService } from './Services/CommunicationService';
import { ICommunicationService } from './Domain/services/ICommunicationService';
import { StorageService } from './Services/StorageService';
import { IStorageService } from './Domain/services/IStorageService';
import { Storage } from './Domain/models/Storage';
import { initialize_database } from './Database/InitializeConnection';
import { StorageController } from './WebAPI/controllers/StorageController';

dotenv.config({ quiet: true });

const app = express();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["POST", "PUT", "GET"];

// Protected microservice from unauthorized access
app.use(cors({
  origin: corsOrigin,
  methods: corsMethods,
}));

initialize_database();

const storageRepository: Repository<Storage> = Db.getRepository(Storage);

const communicationService: ICommunicationService = new CommunicationService();
const storageService: IStorageService = new StorageService(storageRepository, communicationService);

const storageController = new StorageController(storageService);

app.use('/api/v1', storageController.getRouter());

export default app;