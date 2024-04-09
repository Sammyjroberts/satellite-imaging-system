// import request from "supertest";
// import app from "../../index";
// import { asCallback } from "utils";
// import { jest } from "@jest/globals";
// import * as apiQueue from "api-queue";
// let sendToQueueMock = jest.fn();
// jest.mock("api-queue", () => {
//   const originalAPIQueueModule = jest.requireActual("api-queue");
//   const mockChannel = {
//     sendToQueue: sendToQueueMock,
//   };
//   return {
//     __esModule: true,
//     ...originalAPIQueueModule,
//     getRabbitMQChannel: jest.fn().mockResolveValue(mockChannel),
//   };
// });

// describe("Satellite Imaging Request API Tests", () => {
//   it("should test creating a satellite imaging request", async () => {
//     // create a satellite first
//     const [err1, resp1] = await asCallback(
//       request(app)
//         .post("/api/satellite")
//         .send({ name: "satellite1" })
//         .expect(201)
//     );
//     expect(err1).toBeNull();
//     expect(resp1.body.name).toBe("satellite1");
//     // create a satellite imaging request
//     const [err, resp] = await asCallback(
//       request(app)
//         .post("/api/satellite-imaging-requests")
//         .send({ satelliteID: resp1.body.id })
//         .expect(201)
//     );
//     expect(err).toBeNull();
//     expect(resp.body.satelliteID).toBe(resp1.body.id);
//     expect(resp.body.status).toBe("PENDING");
//     // test mock
//     console.log("sendToQueueMock", apiQueue);
//     expect(sendToQueueMock).toHaveBeenCalledWith(
//       apiQueue.queues.SATELLITE_IMAGING_REQUEST,
//       JSON.stringify(resp.body)
//     );
//   });
// });
