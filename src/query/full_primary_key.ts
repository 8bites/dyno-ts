import { DynamoDB } from "aws-sdk";

import { MetaTable, Table } from "../table";

import * as Codec from "../codec";
import * as Metadata from "../metadata";
import {
    batchGet,
    batchWrite,
    fullQuery,
    Query,
    update
} from "./table_operations";

export class FullPrimaryKey<T extends Table, THashKeyType, TRangeKeyType> {
    constructor(
        readonly tableClass: MetaTable<T>,
        readonly metadata: Metadata.Indexes.FullPrimaryKeyMetadata,
        readonly documentClient: DynamoDB.DocumentClient
    ) {}

    public async delete(hashKey: THashKeyType, sortKey: TRangeKeyType) {
        return await this.documentClient
            .delete({
                TableName: this.tableClass.metadata.name,
                // ReturnValues: "ALL_OLD",
                Key: {
                    [this.metadata.hash.name]: hashKey,
                    [this.metadata.range.name]: sortKey
                }
            })
            .promise();
    }

    public async get(
        hashKey: THashKeyType,
        sortKey: TRangeKeyType
    ): Promise<T | null> {
        const dynamoRecord = await this.documentClient
            .get({
                TableName: this.tableClass.metadata.name,
                Key: {
                    [this.metadata.hash.name]: hashKey,
                    [this.metadata.range.name]: sortKey
                }
            })
            .promise();
        if (!dynamoRecord.Item) {
            return null;
        } else {
            return Codec.deserialize(this.tableClass, dynamoRecord.Item);
        }
    }

    public async batchGet(keys: Array<[THashKeyType, TRangeKeyType]>) {
        const res = await batchGet(
            this.documentClient,
            this.tableClass.metadata.name,
            keys.map(key => {
                return {
                    [this.metadata.hash.name]: key[0],
                    [this.metadata.range.name]: key[1]
                };
            })
        );

        return {
            records: res.map(item => {
                return Codec.deserialize(this.tableClass, item);
            })
        };
    }

    public async batchDelete(keys: Array<[THashKeyType, TRangeKeyType]>) {
        return await batchWrite(
            this.documentClient,
            this.tableClass.metadata.name,
            keys.map(key => {
                return {
                    DeleteRequest: {
                        Key: {
                            [this.metadata.hash.name]: key[0],
                            [this.metadata.range.name]: key[1]
                        }
                    }
                };
            })
        );
    }

    public async query(options: {
        hash: THashKeyType;
        range?: Query.Conditions<TRangeKeyType>;
        rangeOrder?: "ASC" | "DESC";
        limit?: number;
        exclusiveStartKey?: DynamoDB.DocumentClient.Key;
    }) {
        const result = await fullQuery({
            ...options,
            documentClient: this.documentClient,
            tableName: this.tableClass.metadata.name,
            hashName: this.metadata.hash.name,
            rangeName: this.metadata.range.name
        });

        return {
            ...result,
            records: result.records.map(item => {
                return Codec.deserialize(this.tableClass, item);
            })
        };
    }

    public async update(
        hashKey: THashKeyType,
        sortKey: TRangeKeyType,
        changes: {
            [key: string]: any;
        }
    ): Promise<void> {
        return await update(
            this.documentClient,
            this.tableClass,
            {
                [this.metadata.hash.name]: hashKey,
                [this.metadata.range.name]: sortKey
            },
            changes
        );
    }
}
