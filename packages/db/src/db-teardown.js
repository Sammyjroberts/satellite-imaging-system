import DB from ".";

afterAll(async () => {
  await DB.getInstance().destroy();
});
