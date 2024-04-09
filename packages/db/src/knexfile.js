// Update with your config settings.
import dotenv from "dotenv";
dotenv.config();

const dbConfig = {
  api: {
    client: "postgresql",
    debug: process.env.NODE_ENV === "localdev",
    connection: {
      host: process.env.DB_HOST || "",
      database: process.env.DATABASE || "",
      user: process.env.DB_USER || "",
      password: process.env.DB_PASSWORD || "",
      port: Number(process.env.DB_PORT),
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "../api_migrations",
    },
    seeds: {
      directory: "../seeds",
    },
  },
  satellite: {
    client: "postgresql",
    debug: process.env.NODE_ENV === "localdev",
    connection: {
      host: process.env.DB_HOST || "",
      database: process.env.DATABASE || "",
      user: process.env.DB_USER || "",
      password: process.env.DB_PASSWORD || "",
      port: Number(process.env.DB_PORT),
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "../satellite_migrations",
    },
    seeds: {
      directory: "../seeds",
    },
  },
};
export default dbConfig;
