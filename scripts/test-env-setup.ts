import DynamoLocal from "./dynamodb-local";

beforeAll(async () => {
    await DynamoLocal.launch();
});

afterAll(async () => {
    await DynamoLocal.teardown();

    // exit if jest hangs
    setTimeout(() => process.exit(), 1000);
});
