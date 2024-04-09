import DB from "../../index";

describe("Database Connection", () => {
  it("should connect to the database without error", async () => {
    const isConnected = await DB.getInstance().testDatabaseConnection();
    expect(isConnected).toBe(true);
  });
});
