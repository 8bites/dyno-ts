require("reflect-metadata");

import * as Metadata from "../../metadata";
import { Table } from "../../table";

import { FullPrimaryKey } from "../full_primary_key";

import {
    Attribute as AttributeDecorator,
    FullPrimaryKey as FullPrimaryKeyDecorator,
    Table as TableDecorator
} from "../../decorator";

import Connection from "../../connection";
import * as Query from "../index";

const TABLE_NAME = `prod-Card-${Math.random()}`;

describe("FullPrimaryKey", () => {
    @TableDecorator(TABLE_NAME)
    class Card extends Table {
        @FullPrimaryKeyDecorator("id", "title")
        public static readonly primaryKey: Query.FullPrimaryKey<
            Card,
            number,
            string
        >;

        @AttributeDecorator() public id: number;

        @AttributeDecorator() public title: string;

        @AttributeDecorator() public count: number;
    }

    let primaryKey: FullPrimaryKey<Card, number, string>;

    beforeEach(async () => {
        await Card.createTable();

        primaryKey = new FullPrimaryKey<Card, number, string>(
            Card,
            Card.metadata.primaryKey as Metadata.Indexes.FullPrimaryKeyMetadata,
            Connection.documentClient
        );
    });

    afterEach(async () => {
        await Card.dropTable();
    });

    describe("delete", async () => {
        it("should delete item if exist", async () => {
            await Connection.documentClient
                .put({
                    TableName: Card.metadata.name,
                    Item: {
                        id: 10,
                        title: "abc"
                    }
                })
                .promise();

            await primaryKey.delete(10, "abc");

            expect(await primaryKey.get(10, "abc")).toBeNull();
        });
    });

    describe("get", async () => {
        it("should find item", async () => {
            const item = await primaryKey.get(10, "abc");
            expect(item).toBeNull();
        });

        it("should find item", async () => {
            await Connection.documentClient
                .put({
                    TableName: Card.metadata.name,
                    Item: {
                        id: 10,
                        title: "abc"
                    }
                })
                .promise();
            const item = await primaryKey.get(10, "abc");
            expect(item).toBeInstanceOf(Card);
            expect(item!.id).toBe(10);
            expect(item!.title).toBe("abc");
        });
    });

    describe("bacthGet", async () => {
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
                        title: "abc"
                    }
                })
                .promise();
            await Connection.documentClient
                .put({
                    TableName: Card.metadata.name,
                    Item: {
                        id: 12,
                        title: "abc"
                    }
                })
                .promise();

            const items = (await primaryKey.batchGet([
                [10, "abc"],
                [11, "abc"]
            ])).records;
            expect(items.length).toBe(2);

            expect(items[0].id).toBe(10);
            expect(items[1].id).toBe(11);
        });
    });

    describe("bacthGet", async () => {
        it("should find items", async () => {
            await Connection.documentClient
                .put({
                    TableName: Card.metadata.name,
                    Item: {
                        id: 101,
                        title: "abc"
                    }
                })
                .promise();
            await Connection.documentClient
                .put({
                    TableName: Card.metadata.name,
                    Item: {
                        id: 111,
                        title: "abc"
                    }
                })
                .promise();

            await primaryKey.batchDelete([[101, "abc"], [111, "abc"]]);

            const results = await primaryKey.batchGet([
                [101, "abc"],
                [111, "abc"]
            ]);

            expect(results).toEqual({ records: [] });
        });
    });

    describe("query", () => {
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
                        id: 10,
                        title: "abd"
                    }
                })
                .promise();
            await Connection.documentClient
                .put({
                    TableName: Card.metadata.name,
                    Item: {
                        id: 10,
                        title: "aba"
                    }
                })
                .promise();

            let res = await primaryKey.query({
                hash: 10,
                range: ["between", "abc", "abf"]
            });

            expect(res.records.length).toBe(2);
            expect(res.records[0].title).toBe("abc");
            expect(res.records[1].title).toBe("abd");

            res = await primaryKey.query({
                hash: 10,
                range: ["between", "abc", "abf"],
                rangeOrder: "DESC"
            });

            expect(res.records.length).toBe(2);
            expect(res.records[0].title).toBe("abd");
            expect(res.records[1].title).toBe("abc");
        });

        it("should return empty array if nothing found", async () => {
            const res = await primaryKey.query({
                hash: Date.now()
            });

            expect(res.records).toEqual([]);
        });
    });

    describe("update", () => {
        it("should be able to update items", async () => {
            await primaryKey.update(10, "abc", { count: ["add", 1] });

            let card = await primaryKey.get(10, "abc");
            expect(card!.count).toBe(1);

            await primaryKey.update(10, "abc", { count: ["add", 2] });

            card = await primaryKey.get(10, "abc");
            expect(card!.count).toBe(3);
        });
    });
});
