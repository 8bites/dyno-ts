import * as Query from "../query";
import { MetaTable } from "../table";

import Connection from "../connection";

// Writer is pretty much "Helper" method.
// You can still create writer without this decorator, but it
// seems pretty clear people would need writer for most of classes anyway

export function Writer() {
    return (tableClass: MetaTable<any>, propertyKey: string) => {
        Object.defineProperty(tableClass, propertyKey, {
            value: new Query.Writer(tableClass, Connection.documentClient),
            writable: false
        });
    };
}
