import { Db } from "./DbConnectionPool";

export const initialize_database = async () => {
    try {
        await Db.initialize();
        console.log("✓ Database connection established successfully");
    } catch (error) {
        console.error("✗ Error connecting to database:", error);
        console.warn("⚠ Server will continue running without database connection");
        console.warn("⚠ Please check MySQL credentials and ensure the database is running");
    }
};
