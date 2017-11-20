import { DynamoDB } from "aws-sdk";
import { chunk } from "lodash";

// this is limit of dynamoDB
const MAX_ITEMS = 25;

export async function batchWrite(
    documentClient: DynamoDB.DocumentClient,
    tableName: string,
    requests: DynamoDB.DocumentClient.WriteRequest[]
) {
    await Promise.all(
        chunk(requests, MAX_ITEMS).map(async items => {
            return await documentClient
                .batchWrite({
                    RequestItems: {
                        [tableName]: items
                    }
                })
                .promise();
        })
    );
}
