import { DynamoDB } from "aws-sdk";
import * as Attribute from "../metadata/attribute";

import { mapValues } from "lodash";

// It extracts value with type, such as 'S"
export function parse(value: DynamoDB.AttributeValue) {
    if (value.B !== undefined) {
        // Buffer|Uint8Array|Blob|string;
        if (typeof value.B !== "string") {
            throw new Error(
                "DynamoTypes doesn't support B attribute that is not string"
            );
        }
        return { value: value.B, type: Attribute.Type.Buffer };
    } else if (value.BOOL !== undefined) {
        return { value: value.BOOL, type: Attribute.Type.Boolean };
    } else if (value.L !== undefined) {
        const list: any[] = value.L.map((i) => parse(i).value);
        return { value: list, type: Attribute.Type.Array };
    } else if (value.M !== undefined) {
        const map: { [key: string]: any } = mapValues(
            value.M,
            (i) => parse(i).value
        );
        return { value: map, type: Attribute.Type.Map };
    } else if (value.N !== undefined) {
        return { value: Number(value.N), type: Attribute.Type.Number };
    } else if (value.S !== undefined) {
        return { value: value.S, type: Attribute.Type.String };
    } else if (value.NULL !== undefined) {
        return { value: null, type: Attribute.Type.Null };
    } else {
        throw Error(`Can't parse value: ${JSON.stringify(value)}`);
    }
}
