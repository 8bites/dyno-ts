import * as AWS from "aws-sdk";
import Connection from "../src/connection";

// setup local config
AWS.config.update({
    accessKeyId: "local",
    secretAccessKey: "local",
    region: "localhost"
});

Connection.initalize({
    endpoint: "http://localhost:8000",
    region: "localhost"
});
