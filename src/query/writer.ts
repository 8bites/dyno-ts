import { DynamoDB } from "aws-sdk";
import { MetaTable, Table } from "../table";

import * as Codec from "../codec";
import * as Metadata from "../metadata";
import { batchWrite } from "./table_operations/batch_write";

export class Writer<T extends Table> {
    private _documentClient: DynamoDB.DocumentClient;
    private _tableClass: MetaTable<T>;
    constructor(
        tableClass: MetaTable<T>,
        documentClient: DynamoDB.DocumentClient
    ) {
        this._tableClass = tableClass;
        this._documentClient = documentClient;
    }

    public get documentClient() {
        return this._documentClient;
    }

    public get tableClass() {
        return this._tableClass;
    }

    public async put(record: T) {
        try {
            const res = await this.documentClient
                .put({
                    TableName: this.tableClass.metadata.name,
                    Item: Codec.serialize(this.tableClass, record)
                })
                .promise();

            record.setAttributes(res.Attributes || {});
            return record;
        } catch (err) {
            throw err;
        }
    }

    public async batchPut(records: T[]) {
        return await batchWrite(
            this.documentClient,
            this.tableClass.metadata.name,
            records.map(record => {
                return {
                    PutRequest: {
                        Item: Codec.serialize(this.tableClass, record)
                    }
                };
            })
        );
    }

    public async delete(record: T) {
        await this.documentClient
            .delete({
                TableName: this.tableClass.metadata.name,
                Key: KeyFromRecord(record, this.tableClass.metadata.primaryKey)
            })
            .promise();
    }
}

function KeyFromRecord<T extends Table>(
    record: T,
    metadata:
        | Metadata.Indexes.FullPrimaryKeyMetadata
        | Metadata.Indexes.HashPrimaryKeyMetadata
) {
    if (metadata.type === "HASH") {
        return {
            [metadata.hash.name]: record[metadata.hash.name]
        };
    } else {
        return {
            [metadata.hash.name]: record.getAttribute(metadata.hash.name),
            [metadata.range.name]: record.getAttribute(metadata.range.name)
        };
    }
}
