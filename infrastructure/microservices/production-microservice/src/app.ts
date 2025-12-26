import cors from 'cors';
import express from 'express';
import "reflect-metadata";
import dotenv from 'dotenv';
import { ProductionController } from './WebAPI/controllers/ProductionController';
import { IProductionService } from './Domain/services/IProductionService';
import { ProductionService } from './Services/ProductionService';
import { Db } from './Database/DbConnectionPool';
import { initialize_database } from './Database/InitializeConnection';
import { FieldPlant } from './Domain/models/FieldPlant';
import { Plant } from './Domain/models/Plant';
import { Repository } from 'typeorm';
import { IPlantService } from './Domain/services/IPlantService';
import { PlantService } from './Services/PlantService';

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

const fieldPlantRepository: Repository<FieldPlant> = Db.getRepository(FieldPlant);
const plantRepository: Repository<Plant> = Db.getRepository(Plant);

const productionService: IProductionService = new ProductionService(fieldPlantRepository, plantRepository);
const plantService: IPlantService = new PlantService(plantRepository, fieldPlantRepository);

initialize_database();

const productionController = new ProductionController(productionService, plantService);

app.use('/api/v1', productionController.getRouter());

export default app;