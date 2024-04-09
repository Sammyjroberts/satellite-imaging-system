/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
  return knex.raw(`
    -- Create the satellite_imaging_jobs table
    CREATE TABLE satellite_imaging_job (
      id SERIAL PRIMARY KEY,
      satellite_id INTEGER NOT NULL,
      satellite_imaging_request_id INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create the satellite_imaging_result table
    CREATE TABLE satellite_imaging_result (
      id SERIAL PRIMARY KEY,
      path VARCHAR(255) NOT NULL,
      satellite_imaging_request_id INTEGER NOT NULL,
      downloaded BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes
    CREATE INDEX idx_satellite_image_satellite_imaging_request_id ON satellite_imaging_result (satellite_imaging_request_id);
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function (knex) {
  return knex.raw(`
    DROP TABLE IF EXISTS satellite_image;
    DROP TABLE IF EXISTS satellite_imaging_request;
    DROP TABLE IF EXISTS satellite;
  `);
};
