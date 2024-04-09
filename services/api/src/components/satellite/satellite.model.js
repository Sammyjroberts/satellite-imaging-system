import DB from "db";

const db = DB.getInstance().getDb();

// SQL query to retrieve satellite images by satellite ID
const GET_SATELLITE_IMAGES_BY_SATELLITE_ID_QUERY = `
  SELECT
    s.id as "satelliteID",
    s.name as "satelliteName",
    sir.created_at as "satelliteRequestDate",
    si.created_at as "satelliteImageDate",
    si.url as "satelliteImageURL"
  FROM satellite_image si
  INNER JOIN satellite_imaging_request sir ON si.satellite_imaging_request_id = sir.id
  INNER JOIN satellite s ON sir.satellite_id = s.id
  WHERE s.id = :satelliteID
  ORDER BY si.created_at DESC;
  # TODO: maybe add some filtering / limiting here
`;

class SatelliteModel {
  /**
   * Create a new satellite.
   * @param {Object} satellite - The satellite object to be created.
   * @returns {Promise<Object>} The created satellite object.
   */
  static async createSatellite(satellite) {
    const result = await db("satellite").insert(satellite).returning("*");
    return result[0];
  }

  /**
   * Get satellite images by satellite ID.
   * @param {number} satelliteID - The ID of the satellite.
   * @returns {Promise<Array>} An array of satellite images.
   */
  static async getImages(satelliteID) {
    const result = await db.raw(GET_SATELLITE_IMAGES_BY_SATELLITE_ID_QUERY, {
      satelliteID,
    });
    return result.rows;
  }
}

export default SatelliteModel;
