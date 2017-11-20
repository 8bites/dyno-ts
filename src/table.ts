// Base Table
import * as Metadata from "./metadata";
import * as Query from "./query";

import { forEach } from "lodash";
import Connection from "./connection";

export class Table {
    // Table Operations
    public static async createTable() {
        await Query.TableOperations.createTable(
            this.metadata,
            Connection.client
        );
    }
    public static async dropTable() {
        await Query.TableOperations.dropTable(this.metadata, Connection.client);
    }

    // raw storage for all attributes this record (instance) has
    private _attributes: { [key: string]: any } = {};

    private _writer: Query.Writer<Table>;

    constructor(attributes?: { [key: string]: any }) {
        if (attributes) {
            this.setAttributes(attributes);
        }
    }

    // This will be setted by Decorator
    static get metadata() {
        if (!(this as any)._metadata) {
            (this as any)._metadata = Metadata.Table.createMetadata();
        }
        return (this as any)._metadata as Metadata.Table.Metadata;
    }
    static set metadata(metadata: Metadata.Table.Metadata) {
        (this as any)._metadata = metadata;
    }

    // Those are pretty much "Private". don't use it if its possible
    public setAttribute(name: string, value: any) {
        // Do validation with Attribute metadata maybe
        this._attributes[name] = value;
    }
    public getAttribute(name: string) {
        return this._attributes[name];
    }
    public setAttributes(attributes: { [name: string]: any }) {
        forEach(attributes, (value, name) => {
            this.setAttribute(name, value);
        });
    }

    public get writer() {
        if (!this._writer) {
            this._writer = new Query.Writer(
                this.constructor as MetaTable<Table>,
                Connection.documentClient
            );
        }
        return this._writer;
    }
    public async save() {
        return await this.writer.put(this);
    }
    public async delete() {
        return await this.writer.delete(this);
    }

    public serialize() {
        // TODO some serialization logic
        return this._attributes;
    }
}

export interface MetaTable<T extends Table> {
    metadata: Metadata.Table.Metadata;
    new (): T;
}
