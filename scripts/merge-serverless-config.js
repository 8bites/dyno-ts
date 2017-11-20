"use strict";

const yaml = require("js-yaml");
const path = require("path");
const fs = require("fs");
const defaults = require("lodash.defaultsdeep");
const configPath = process.argv[2];

const STAGE = process.env.STAGE;
const PWD = process.env.PWD;

if (!configPath) {
    throw new Error('"path to config" not found in args');
}

const baseConfig = yaml.safeLoad(
    fs.readFileSync(path.resolve(__dirname, `../serverless.base.${STAGE}.yml`))
);
const config = yaml.safeLoad(fs.readFileSync(configPath), { json: true });

fs.writeFileSync(
    path.join(path.dirname(configPath), "serverless.yml"),
    yaml
        .safeDump(defaults(config, baseConfig), {
            indent: 4,
            noCompatMode: true,
            noRefs: true
        })
        // remove escaping for strings
        .replace(/: '/g, ": ")
        .replace(/'\r?\n|\r/g, "\r\n")
        .replace(/''/g, "'"),
    "utf-8"
);
