import DB from ".";

beforeAll(async () => {
  await DB.getInstance().resetDB();
});
