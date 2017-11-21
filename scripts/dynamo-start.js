"use strict";

const fs = require("fs");
const path = require("path");
const DynamoLocal = require("./dynamodb-local");

DynamoLocal.launch().then(pid => {
    fs.writeFileSync(path.resolve("./.ddb_pid"), pid, "utf8");
});
