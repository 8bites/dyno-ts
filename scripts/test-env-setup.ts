import DynamoLocal from "./dynamodb-local";

beforeAll(async () => {
    await DynamoLocal.launch();
});

afterAll(async () => {
    await DynamoLocal.teardown();
});
