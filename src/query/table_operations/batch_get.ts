import { DynamoDB } from "aws-sdk";
import { chunk, sortBy } from "lodash";

// this is limit of dynamoDB
const MAX_ITEMS = 100;

export async function batchGet(
    documentClient: DynamoDB.DocumentClient,
    tableName: string,
    keys: DynamoDB.DocumentClient.KeyList
) {
    const chunks = await Promise.all(
        chunk(keys, MAX_ITEMS).map(async keysChunk => {
            const res = await documentClient
                .batchGet({
                    RequestItems: {
                        [tableName]: {
                            Keys: keysChunk
                        }
                    }
                })
                .promise();

            return sortBy(res.Responses![tableName], (record, index) => {
                const keyIndex = keysChunk.findIndex(keysHash => {
                    for (const keyName in keysHash) {
                        if (record[keyName] !== keysHash[keyName]) {
                            return false;
                        }
                    }
                    return true;
                });
                return keyIndex;
            });
        })
    );

    return chunks.reduce((memo, items) => memo.concat(items), []);
}
