import * as AWS from "aws-sdk";

// setup local config
AWS.config.update({
    accessKeyId: "local",
    secretAccessKey: "local",
    region: "localhost"
});
