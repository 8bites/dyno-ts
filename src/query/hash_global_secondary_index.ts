import { DynamoDB } from "aws-sdk";

import { MetaTable, Table } from "../table";

import * as Codec from "../codec";
import * as Metadata from "../metadata";

const HASH_KEY_REF = "#hk";
const HASH_VALUE_REF = ":hkv";

export class HashGlobalSecondaryIndex<T extends Table, THashKeyType> {
    constructor(
        readonly tableClass: MetaTable<T>,
        readonly metadata: Metadata.Indexes.HashGlobalSecondaryIndexMetadata,
        readonly documentClient: DynamoDB.DocumentClient
    ) {}

    public async query(hash: THashKeyType, options: { limit?: number } = {}) {
        const params: DynamoDB.DocumentClient.QueryInput = {
            TableName: this.tableClass.metadata.name,
            IndexName: this.metadata.name,
            Limit: options.limit,
            ReturnConsumedCapacity: "TOTAL",
            KeyConditionExpression: `${HASH_KEY_REF} = ${HASH_VALUE_REF}`,
            ExpressionAttributeNames: {
                [HASH_KEY_REF]: this.metadata.hash.name
            },
            ExpressionAttributeValues: {
                [HASH_VALUE_REF]: hash
            }
        };

        const result = await this.documentClient.query(params).promise();

        return {
            records: (result.Items || []).map((item) => {
                return Codec.deserialize(this.tableClass, item);
            }),
            count: result.Count,
            scannedCount: result.ScannedCount,
            lastEvaluatedKey: result.LastEvaluatedKey,
            consumedCapacity: result.ConsumedCapacity
        };
    }
}
