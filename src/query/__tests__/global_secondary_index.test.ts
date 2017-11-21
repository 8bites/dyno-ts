require("reflect-metadata");

import Connection from "../../connection";
import * as Decorator from "../../decorator";
import { Table } from "../../table";
import * as Query from "../index";

const TABLE_NAME = `prod-Card-${Math.random()}`;

@Decorator.Table(TABLE_NAME)
class Card extends Table {
    @Decorator.FullPrimaryKey("id", "title")
    public static readonly primaryKey: Query.FullPrimaryKey<
        Card,
        number,
        string
    >;

    @Decorator.HashGlobalSecondaryIndex("title")
    public static readonly hashTitleIndex: Query.HashGlobalSecondaryIndex<
        Card,
        string
    >;

    @Decorator.FullGlobalSecondaryIndex("title", "id")
    public static readonly fullTitleIndex: Query.FullGlobalSecondaryIndex<
        Card,
        string,
        number
    >;

    @Decorator.Attribute() public id: number;

    @Decorator.Attribute() public title: string;

    @Decorator.Attribute() public count: number;
}

describe("HashGlobalSecondaryIndex", () => {
    beforeEach(async () => {
        await Card.createTable();
    });

    afterEach(async () => {
        await Card.dropTable();
    });

    describe("#query", () => {
        it("should find items", async () => {
            await Connection.documentClient
                .put({
                    TableName: Card.metadata.name,
                    Item: {
                        id: 10,
                        title: "abc"
                    }
                })
                .promise();
            await Connection.documentClient
                .put({
                    TableName: Card.metadata.name,
                    Item: {
                        id: 11,
                        title: "abd"
                    }
                })
                .promise();
            await Connection.documentClient
                .put({
                    TableName: Card.metadata.name,
                    Item: {
                        id: 12,
                        title: "abd"
                    }
                })
                .promise();

            const res = await Card.hashTitleIndex.query("abd");
            expect(res.records.length).toBe(2);
            expect(res.records[0].id).toBe(12);
            expect(res.records[1].id).toBe(11);
        });
    });
});

describe("FullGlobalSecondaryIndex", () => {
    beforeEach(async () => {
        await Card.createTable();
    });

    afterEach(async () => {
        await Card.dropTable();
    });

    describe("#query", () => {
        it("should find items", async () => {
            await Connection.documentClient
                .put({
                    TableName: Card.metadata.name,
                    Item: {
                        id: 10,
                        title: "abc"
                    }
                })
                .promise();
            await Connection.documentClient
                .put({
                    TableName: Card.metadata.name,
                    Item: {
                        id: 11,
                        title: "abd"
                    }
                })
                .promise();
            await Connection.documentClient
                .put({
                    TableName: Card.metadata.name,
                    Item: {
                        id: 12,
                        title: "abd"
                    }
                })
                .promise();
            await Connection.documentClient
                .put({
                    TableName: Card.metadata.name,
                    Item: {
                        id: 13,
                        title: "abd"
                    }
                })
                .promise();

            const res = await Card.fullTitleIndex.query({
                hash: "abd",
                range: [">=", 12],
                rangeOrder: "DESC"
            });
            expect(res.records.length).toBe(2);

            expect(res.records[0].id).toBe(13);
            expect(res.records[1].id).toBe(12);
        });
    });
});
