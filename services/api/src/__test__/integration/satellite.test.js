import request from "supertest";
import app from "../../index";
import { asCallback } from "utils";

describe("Satellite API Tests", () => {
  it("should test creating a satellite", async () => {
    const [err, resp] = await asCallback(
      request(app)
        .post("/api/satellite")
        .send({ name: "satellite1" })
        .expect(201)
    );
    expect(err).toBeNull();
    expect(resp.body.name).toBe("satellite1");
  });
});
