import { DynamoDB } from "aws-sdk";

import { MetaTable, Table } from "../table";

import * as Codec from "../codec";
import * as Metadata from "../metadata";
import { fullQuery, Query } from "./table_operations";

export class FullGlobalSecondaryIndex<
    T extends Table,
    THashKeyType,
    TRangeKeyType
> {
    constructor(
        readonly tableClass: MetaTable<T>,
        readonly metadata: Metadata.Indexes.FullGlobalSecondaryIndexMetadata,
        readonly documentClient: DynamoDB.DocumentClient
    ) {}

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
            indexName: this.metadata.name,
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
}
