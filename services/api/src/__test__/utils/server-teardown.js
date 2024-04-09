import { closeServer } from "../..";

afterAll(async () => {
  await closeServer();
});
