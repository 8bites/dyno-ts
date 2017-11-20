import DynamoLocal from "./dynamodb-local";

beforeAll(() => {
    return DynamoLocal.launch();
});

afterAll(() => {
    return DynamoLocal.teardown();
});
