import { DynamoDB } from "aws-sdk";

import * as Codec from "../codec";
import * as Metadata from "../metadata";
import { MetaTable, Table } from "../table";

import { batchGet, batchWrite, update } from "./table_operations";

export class HashPrimaryKey<T extends Table, THashKeyType> {
    constructor(
        readonly tableClass: MetaTable<T>,
        readonly metadata: Metadata.Indexes.HashPrimaryKeyMetadata,
        readonly documentClient: DynamoDB.DocumentClient
    ) {}

    public async delete(hashKey: THashKeyType) {
        await this.documentClient
            .delete({
                TableName: this.tableClass.metadata.name,
                Key: {
                    [this.metadata.hash.name]: hashKey
                }
            })
            .promise();
    }

    public async get(hashKey: THashKeyType): Promise<T | null> {
        const dynamoRecord = await this.documentClient
            .get({
                TableName: this.tableClass.metadata.name,
                Key: {
                    [this.metadata.hash.name]: hashKey
                }
            })
            .promise();
        if (dynamoRecord.Item) {
            return Codec.deserialize(this.tableClass, dynamoRecord.Item);
        } else {
            return null;
        }
    }

    public async scan(options: {
        limit?: number;
        totalSegments?: number;
        segment?: number;
        FilterExpression?: string;
        exclusiveStartKey?: DynamoDB.DocumentClient.Key;
    }) {
        const params: DynamoDB.DocumentClient.ScanInput = {
            TableName: this.tableClass.metadata.name,
            Limit: options.limit,
            ExclusiveStartKey: options.exclusiveStartKey,
            ReturnConsumedCapacity: "TOTAL",
            TotalSegments: options.totalSegments,
            Segment: options.segment
        };

        const result = await this.documentClient.scan(params).promise();

        return {
            records: (result.Items || []).map(item => {
                return Codec.deserialize(this.tableClass, item);
            }),
            count: result.Count,
            scannedCount: result.ScannedCount,
            lastEvaluatedKey: result.LastEvaluatedKey,
            consumedCapacity: result.ConsumedCapacity
        };
    }

    public async batchGet(keys: THashKeyType[]) {
        const res = await batchGet(
            this.documentClient,
            this.tableClass.metadata.name,
            keys.map(key => {
                return {
                    [this.metadata.hash.name]: key
                };
            })
        );

        return {
            records: res.map(item => {
                return Codec.deserialize(this.tableClass, item);
            })
        };
    }

    public async batchDelete(keys: THashKeyType[]) {
        return await batchWrite(
            this.documentClient,
            this.tableClass.metadata.name,
            keys.map(key => {
                return {
                    DeleteRequest: {
                        Key: {
                            [this.metadata.hash.name]: key
                        }
                    }
                };
            })
        );
    }

    public async update(
        hashKey: THashKeyType,
        changes: {
            [key: string]: any;
        }
    ): Promise<void> {
        await update(
            this.documentClient,
            this.tableClass,
            {
                [this.metadata.hash.name]: hashKey
            },
            changes
        );
    }
}
