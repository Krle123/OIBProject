import { Db } from "./DbConnectionPool";
import { Storage } from "../Domain/models/Storage";
import { StorageType } from "../Domain/enums/StorageType";

export const initialize_database = async () => {
    try {
        await Db.initialize();
        console.log("✓ Database connection established successfully");

        // Seed initial storage data
        await seedInitialData();
    } catch (error) {
        console.error("✗ Error connecting to database:", error);
        console.warn("⚠ Server will continue running without database connection");
        console.warn("⚠ Please check MySQL credentials and ensure the database is running");
    }
};

const seedInitialData = async () => {
    try {
        const storageRepository = Db.getRepository(Storage);

        // Check if storages already exist
        const existingStorages = await storageRepository.count();

        if (existingStorages === 0) {
            console.log("⚙ Seeding initial storage data...");

            const initialStorages = [
                {
                    name: "Distribution Center Paris",
                    location: "Rue de la Paix, Paris",
                    maxCapacity: 500,
                    currentCapacity: 250,
                    type: StorageType.DISTRIBUTION_CENTER
                },
                {
                    name: "Warehouse Center Marseille",
                    location: "Port de Marseille, Marseille",
                    maxCapacity: 300,
                    currentCapacity: 150,
                    type: StorageType.WAREHOUSE_CENTER
                },
                {
                    name: "Distribution Center Lyon",
                    location: "Avenue Charles de Gaulle, Lyon",
                    maxCapacity: 400,
                    currentCapacity: 200,
                    type: StorageType.DISTRIBUTION_CENTER
                }
            ];

            for (const storageData of initialStorages) {
                const storage = storageRepository.create(storageData);
                await storageRepository.save(storage);
            }

            console.log(`✓ Seeded ${initialStorages.length} storages`);
        }
    } catch (error) {
        console.error("✗ Error seeding initial data:", error);
    }
};
