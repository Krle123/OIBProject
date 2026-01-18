import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { PerformanceReport } from "../Domain/models/PerformanceReport";

dotenv.config({ quiet: true });

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "izvestaji_performanse",
    entities: [PerformanceReport],
    synchronize: true,
    logging: false,
});

export const initializeDatabase = async (): Promise<void> => {
    try {
        await AppDataSource.initialize();
        console.log("✓ Database connection established successfully");
        console.log(`✓ Connected to database: ${process.env.DB_NAME}`);
    } catch (error: any) {
        console.error("✗ Error connecting to database:", error.message);
        throw error;
    }
};
