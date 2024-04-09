/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
  return knex.raw(`
    -- Create the satellite table
    CREATE TABLE satellite (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create the satellite_imaging_request table
    CREATE TABLE satellite_imaging_request (
      id SERIAL PRIMARY KEY,
      satellite_id INTEGER NOT NULL,
      status VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create the satellite_image table
    CREATE TABLE satellite_image (
      id SERIAL PRIMARY KEY,
      url VARCHAR(255) NOT NULL,
      satellite_imaging_request_id INTEGER NOT NULL,
      -- This is a denormalized field for query ease
      satellite_id INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes
    CREATE INDEX idx_satellite_imaging_request_satellite_id ON satellite_imaging_request (satellite_id);
    CREATE INDEX idx_satellite_image_satellite_imaging_request_id ON satellite_image (satellite_imaging_request_id);
    CREATE INDEX idx_satellite_image_satellite_id ON satellite_image (satellite_id);
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
