import { DataSource } from "typeorm";
import { Storage } from "../Domain/models/Storage";
import { FiscalReceipt } from "../Domain/models/FiscalReceipt";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const Db = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "sales_db",
    entities: [Storage, FiscalReceipt],
    synchronize: true,
    logging: false,
});
