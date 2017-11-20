import { MetaTable, Table } from "../table";

export function serialize<T extends Table>(
    tableClass: MetaTable<T>,
    record: T
): { [key: string]: any } {
    const res: { [key: string]: any } = {};

    tableClass.metadata.attributes.forEach((attributeMetadata) => {
        res[attributeMetadata.name] = record.getAttribute(
            attributeMetadata.name
        );
    });

    return res;
}
