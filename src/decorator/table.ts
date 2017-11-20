import Connection from "../connection";
import * as Metadata from "../metadata";
import * as Query from "../query";
import { MetaTable, Table as TableClass } from "../table";

// Table Decorator
export function Table(name: string) {
    return (target: MetaTable<any>) => {
        target.metadata.name = name;

        // Table Decorator Executed at last,
        // So Validate metadata, presume all the setups are finisehd
        Metadata.Table.validateMetadata(target.metadata);

        // After validation, setup some methods.
        defineAttributeProperties(target);
        definePrimaryKeyProperty(target);

        defineGlobalSecondaryIndexes(target);
        defineLocalSecondaryIndexes(target);
    };
}

function defineAttributeProperties(table: MetaTable<any>) {
    table.metadata.attributes.forEach((attr) => {
        Object.defineProperty(table.prototype, attr.propertyName, {
            configurable: true,
            enumerable: true,
            get(this: TableClass) {
                return this.getAttribute(attr.name);
            },
            set(this: TableClass, v) {
                this.setAttribute(attr.name, v);
            }
        });
    });
}

function defineGlobalSecondaryIndexes(table: MetaTable<any>) {
    table.metadata.globalSecondaryIndexes.forEach((metadata) => {
        if (metadata.type === "HASH") {
            Object.defineProperty(table, metadata.propertyName, {
                value: new Query.HashGlobalSecondaryIndex(
                    table,
                    metadata,
                    Connection.documentClient
                ),
                writable: false
            });
        } else {
            Object.defineProperty(table, metadata.propertyName, {
                value: new Query.FullGlobalSecondaryIndex(
                    table,
                    metadata,
                    Connection.documentClient
                ),
                writable: false
            });
        }
    });
}

function defineLocalSecondaryIndexes(table: MetaTable<any>) {
    table.metadata.localSecondaryIndexes.forEach((metadata) => {
        Object.defineProperty(table, metadata.propertyName, {
            value: new Query.LocalSecondaryIndex(
                table,
                metadata,
                Connection.documentClient
            ),
            writable: false
        });
    });
}

function definePrimaryKeyProperty(table: MetaTable<any>) {
    if (table.metadata.primaryKey) {
        const pkMetdata = table.metadata.primaryKey;
        if (pkMetdata.type === "FULL") {
            Object.defineProperty(table, pkMetdata.name, {
                value: new Query.FullPrimaryKey(
                    table,
                    pkMetdata,
                    Connection.documentClient
                ),
                writable: false
            });
        } else {
            Object.defineProperty(table, pkMetdata.name, {
                value: new Query.HashPrimaryKey(
                    table,
                    pkMetdata,
                    Connection.documentClient
                ),
                writable: false
            });
        }
    }
}
