import DBConfigs from "./knexfile.js";
import knex from "knex";
import _ from "lodash";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbConfig = DBConfigs[process.env.SERVICE_NAME];
// NOTE: will be messy as its imported from another project thats experimental
/**
 * Class representing a database connection.
 * @class DB
 * @classdesc A class representing a database connection.
 */
class DB {
  constructor() {
    if (DB.instance) {
      return DB.instance;
    }
    this.connection = knex(dbConfig);
    DB.instance = this;
  }

  /**
   * Get the instance of the DB class.
   * If an instance doesn't exist, a new instance is created.
   * @returns {DB} The instance of the DB class.
   */
  static getInstance() {
    if (!DB.instance) {
      DB.instance = new DB();
    }
    return DB.instance;
  }

  destroy() {
    if (!this.connection) return;
    this.connection.destroy();
  }

  /**
   * Get the database connection.
   * @method getDb
   * @returns {import('knex').Knex<any, any[]>} The database connection.
   */
  getDb() {
    return this.connection;
  }

  async migrateLatest() {
    if (!this.connection) return;
    const migrationsDirectory = path.join(__dirname, "..", "migrations");
    await this.connection.migrate.latest({
      directory: migrationsDirectory,
    });
    console.log("migrated latest 💾🔀📦");
  }

  async seed() {
    if (!this.connection) return;
    await this.connection.seed.run({
      directory: path.join(__dirname, "..", "seeds"),
    });
    console.log("db seeded 🌱💾🌱");
  }

  async createDatabase() {
    const config = _.clone(dbConfig);
    if (
      typeof config.connection !== "object" ||
      !("database" in config.connection)
    ) {
      throw new Error(
        "Invalid configuration. Connection must be an object with a 'database' property."
      );
    }
    config.connection.database = "";
    const tempDb = knex(config);
    const exists = await tempDb.raw(
      `SELECT 1 FROM pg_database WHERE datname = '${process.env.DATABASE}'`
    );
    if (!exists.rows.length) {
      await tempDb.raw(`CREATE DATABASE ${process.env.DATABASE}`);
    }
    await tempDb.destroy();
    console.log("created database 💾🆕");
  }

  async clearDB() {
    if (!this.connection) return;
    const tables = await this.connection
      .select("tablename")
      .from("pg_tables")
      .where("schemaname", "public");
    for (const table of tables) {
      await this.connection.schema.dropTableIfExists(table.tablename);
    }
    console.log("cleared db 🗑️💾❌");
  }

  async testDatabaseConnection() {
    try {
      if (!this.connection) return false;
      await this.connection.raw("SELECT 1+1 AS result");
      return true;
    } catch (error) {
      console.error("Failed to connect to the database:", error);
      return false;
    }
  }

  async safeEnv() {
    if (
      process.env.NODE_ENV !== "test" &&
      process.env.NODE_ENV !== "ci" &&
      process.env.NODE_ENV !== "localdev"
    ) {
      throw new Error("Not in safe environment to run function environment");
    }
    console.log("safe env 🔐💻⚠️ ");
  }

  async resetDB() {
    try {
      console.log("resetting db");
      await this.safeEnv();
      await this.createDatabase();
      await this.clearDB();
      await this.migrateLatest();
      // await this.seed();
      console.log("database ready 💾🔄🔍✅");
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

(async () => {
  const fileURL = new URL(import.meta.url);
  const mainURL = new URL(`file://${process.argv[1]}`);
  if (fileURL.href === mainURL.href) {
    try {
      const argv = yargs(hideBin(process.argv)).argv;
      if (argv.resetDB) await DB.getInstance().resetDB();
      else {
        console.log('bad args, try "yarn db --resetDB"');
      }
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
})();

export default DB;
