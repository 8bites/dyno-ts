import * as Metadata from "../../metadata";

import { DynamoDB } from "aws-sdk";
import * as _ from "lodash";

export async function createTable(
    metadata: Metadata.Table.Metadata,
    client: DynamoDB
) {
    /* tslint:disable naming-convention */
    let KeySchema: DynamoDB.Types.KeySchema;
    let AttributeDefinitions: DynamoDB.Types.AttributeDefinitions;

    if (metadata.primaryKey.type === "FULL") {
        KeySchema = [
            {
                AttributeName: metadata.primaryKey.hash.name,
                KeyType: "HASH"
            },
            {
                AttributeName: metadata.primaryKey.range.name,
                KeyType: "RANGE"
            }
        ];
        AttributeDefinitions = [
            {
                AttributeName: metadata.primaryKey.hash.name,
                AttributeType: metadata.primaryKey.hash.type
            },
            {
                AttributeName: metadata.primaryKey.range.name,
                AttributeType: metadata.primaryKey.range.type
            }
        ];
    } else {
        KeySchema = [
            {
                AttributeName: metadata.primaryKey.hash.name,
                KeyType: "HASH"
            }
        ];
        AttributeDefinitions = [
            {
                AttributeName: metadata.primaryKey.hash.name,
                AttributeType: metadata.primaryKey.hash.type
            }
        ];
    }

    metadata.localSecondaryIndexes.map(index => {
        AttributeDefinitions.push({
            AttributeName: index.range.name,
            AttributeType: index.range.type
        });
    });

    metadata.globalSecondaryIndexes.map(index => {
        AttributeDefinitions.push({
            AttributeName: index.hash.name,
            AttributeType: index.hash.type
        });

        if (index.type === "FULL") {
            AttributeDefinitions.push({
                AttributeName: index.range.name,
                AttributeType: index.range.type
            });
        }
    });

    AttributeDefinitions = _.uniqBy(
        AttributeDefinitions,
        attr => attr.AttributeName
    );

    const params: DynamoDB.Types.CreateTableInput = {
        /**
         * An array of attributes that describe the key schema for the table and indexes.
         */
        AttributeDefinitions,
        /**
         * The name of the table to create.`
         */
        TableName: metadata.name,
        KeySchema,
        LocalSecondaryIndexes:
            metadata.localSecondaryIndexes.length > 0
                ? metadata.localSecondaryIndexes.map(index => {
                      return {
                          IndexName: index.name,
                          KeySchema: [
                              {
                                  AttributeName: metadata.primaryKey.hash.name,
                                  KeyType: "HASH"
                              },
                              {
                                  AttributeName: index.range.name,
                                  KeyType: "RANGE"
                              }
                          ],
                          Projection: {
                              ProjectionType: "ALL"
                          }
                      };
                  })
                : undefined,
        GlobalSecondaryIndexes:
            metadata.globalSecondaryIndexes.length > 0
                ? metadata.globalSecondaryIndexes.map(index => {
                      if (index.type === "FULL") {
                          return {
                              IndexName: index.name,
                              KeySchema: [
                                  {
                                      AttributeName: index.hash.name,
                                      KeyType: "HASH"
                                  },
                                  {
                                      AttributeName: index.range.name,
                                      KeyType: "RANGE"
                                  }
                              ],
                              Projection: {
                                  ProjectionType: "ALL"
                              },
                              ProvisionedThroughput: {
                                  ReadCapacityUnits: 1,
                                  WriteCapacityUnits: 1
                              }
                          };
                      } else {
                          return {
                              IndexName: index.name,
                              KeySchema: [
                                  {
                                      AttributeName: index.hash.name,
                                      KeyType: "HASH"
                                  }
                              ],
                              Projection: {
                                  ProjectionType: "ALL"
                              },
                              ProvisionedThroughput: {
                                  ReadCapacityUnits: 1,
                                  WriteCapacityUnits: 1
                              }
                          };
                      }
                  })
                : undefined,
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
        }
    };

    const res = await client.createTable(params).promise();

    await client.waitFor("tableExists", { TableName: metadata.name }).promise();

    // TTL
    // https://github.com/aws/aws-sdk-js/issues/1527
    // TTL doesn't supported at dynamo-local Yet
    /* istanbul ignore next */
    const ttlAttribute = metadata.attributes.find(attr => !!attr.timeToLive);
    /* istanbul ignore next */
    if (ttlAttribute) {
        /* istanbul ignore next */
        await client
            .updateTimeToLive({
                TableName: metadata.name,
                TimeToLiveSpecification: {
                    Enabled: true,
                    AttributeName: ttlAttribute.name
                }
            })
            .promise();
    }

    return res.TableDescription;
}
