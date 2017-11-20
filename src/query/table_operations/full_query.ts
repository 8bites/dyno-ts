import { DynamoDB } from "aws-sdk";
import { HASH_KEY_REF, HASH_VALUE_REF, RANGE_KEY_REF } from "./constants";
import * as Query from "./query";

interface Options<THashKeyType, TRangeKeyType> {
    documentClient: DynamoDB.DocumentClient;
    tableName: string;
    indexName?: string;
    hash: THashKeyType;
    hashName: string;
    range?: Query.Conditions<TRangeKeyType>;
    rangeName?: string;
    rangeOrder?: "ASC" | "DESC";
    limit?: number;
    exclusiveStartKey?: DynamoDB.DocumentClient.Key;
}

export async function fullQuery<THashKeyType, TRangeKeyType>(
    options: Options<THashKeyType, TRangeKeyType>
) {
    if (!options.rangeOrder) {
        options.rangeOrder = "ASC";
    }
    const scanIndexForward = options.rangeOrder === "ASC";

    const params: DynamoDB.DocumentClient.QueryInput = {
        TableName: options.tableName,
        Limit: options.limit,
        ScanIndexForward: scanIndexForward,
        ExclusiveStartKey: options.exclusiveStartKey,
        ReturnConsumedCapacity: "TOTAL",
        KeyConditionExpression: `${HASH_KEY_REF} = ${HASH_VALUE_REF}`,
        ExpressionAttributeNames: {
            [HASH_KEY_REF]: options.hashName
        },
        ExpressionAttributeValues: {
            [HASH_VALUE_REF]: options.hash
        }
    };

    if (options.indexName) {
        params.IndexName = options.indexName;
    }

    if (options.range) {
        const rangeKeyOptions = Query.parseCondition(
            options.range,
            RANGE_KEY_REF
        );
        params.KeyConditionExpression += ` AND ${
            rangeKeyOptions.conditionExpression
        }`;
        Object.assign(params.ExpressionAttributeNames, {
            [RANGE_KEY_REF]: options.rangeName
        });
        Object.assign(
            params.ExpressionAttributeValues,
            rangeKeyOptions.expressionAttributeValues
        );
    }

    const result = await options.documentClient.query(params).promise();

    return {
        records: result.Items || [],
        count: result.Count,
        scannedCount: result.ScannedCount,
        lastEvaluatedKey: result.LastEvaluatedKey,
        consumedCapacity: result.ConsumedCapacity
    };
}
