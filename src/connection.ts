import * as AWS from "aws-sdk";
import { DynamoDB } from "aws-sdk";

import * as HTTP from "http";
import * as HTTPS from "https";

const ENABLE_XRAY = process.env.ENABLE_XRAY === "true";

export default class Connection {
    private static _documentClient: AWS.DynamoDB.DocumentClient;
    public static get documentClient() {
        return this._documentClient;
    }

    private static _client: AWS.DynamoDB;
    public static get client() {
        return this._client;
    }

    public static initalize(
        options: {
            endpoint?: string;
            enableAWSXray?: boolean;
            region?: string;
        } = {}
    ) {
        const endpoint = options.endpoint;

        const region = (options.region ||
            (process.env.AWS_REGION as string)) as string | undefined;

        const dynamoDbOptions = {
            region,
            endpoint,
            httpOptions: {
                agent: this.httpAgent(endpoint)
            }
        };

        if (ENABLE_XRAY || options.enableAWSXray) {
            /* tslint:disable */
            const AWSXRay = require("aws-xray-sdk-core");
            const aws = AWSXRay.captureAWS(AWS);
            this._client = new aws.DynamoDB(dynamoDbOptions);
            this._documentClient = new aws.DynamoDB.DocumentClient({
                service: this._client
            });
        } else {
            this._client = new DynamoDB(dynamoDbOptions);
            this._documentClient = new DynamoDB.DocumentClient({
                service: this._client
            });
        }
    }

    private static httpAgent(endpoint: string | undefined) {
        if (endpoint && endpoint.startsWith("http://")) {
            return new HTTP.Agent({
                keepAlive: true
            });
        } else {
            return new HTTPS.Agent({
                rejectUnauthorized: true,
                keepAlive: true
            });
        }
    }
}

Connection.initalize();
