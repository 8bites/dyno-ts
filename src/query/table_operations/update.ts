import { DynamoDB } from "aws-sdk";
import { MetaTable } from "../../table";

function generateUpdateExpression({
    sets,
    adds,
    removes,
    deletes
}: {
    sets: string[];
    adds: string[];
    removes: string[];
    deletes: string[];
}) {
    const expressions = [];

    if (sets.length) {
        expressions.push(`set ${sets.join(", ")}`);
    }
    if (adds.length) {
        expressions.push(`add ${adds.join(", ")}`);
    }
    if (removes.length) {
        expressions.push(`remove ${removes.join(", ")}`);
    }
    if (deletes.length) {
        expressions.push(`delete ${deletes.join(", ")}`);
    }

    return expressions.join(", ");
}

export function generateChangeAttributes(
    tableClass: MetaTable<any>,
    changes: { [key: string]: [string, any] | any }
) {
    const sets: string[] = [];
    const adds: string[] = [];
    const removes: string[] = [];
    const deletes: string[] = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    tableClass.metadata.attributes.forEach(attr => {
        const change = changes[attr.propertyName];

        if (change !== undefined) {
            let method = "set";
            let value = change;

            if (Array.isArray(value)) {
                method = value[0];
                value = value[1];
            }

            const nameAlias = `#${attr.name}`;
            const valueAlias = `:${attr.name}`;
            expressionAttributeNames[nameAlias] = attr.propertyName;
            if (value) {
                expressionAttributeValues[valueAlias] = value;
            }

            if (value === null) {
                removes.push(nameAlias);
            } else {
                switch (method) {
                    case "set": {
                        sets.push(`${nameAlias} = ${valueAlias}`);
                        break;
                    }
                    case "add": {
                        adds.push(`${nameAlias} ${valueAlias}`);
                        break;
                    }
                    case "delete": {
                        deletes.push(`${nameAlias} ${valueAlias}`);
                        break;
                    }
                }
            }
        }
    });

    return {
        UpdateExpression: generateUpdateExpression({
            sets,
            adds,
            removes,
            deletes
        }),
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames
    };
}

export async function update(
    client: DynamoDB.DocumentClient,
    tableClass: MetaTable<any>,
    key: { [key: string]: any },
    changes: { [key: string]: [string, any] | any }
) {
    await client
        .update({
            TableName: tableClass.metadata.name,
            Key: key,
            ...generateChangeAttributes(tableClass, changes)
        })
        .promise();
}
