import * as AWS from "aws-sdk";
import DynamoLocal from "./dynamodb-local";

beforeEach(() => {
    // setup local config
    AWS.config.update({
        accessKeyId: "local",
        secretAccessKey: "local",
        region: "localhost"
    });
});

beforeAll(() => {
    return DynamoLocal.launch();
});

afterAll(() => {
    return DynamoLocal.teardown();
});
