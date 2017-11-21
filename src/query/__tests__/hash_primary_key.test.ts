require("reflect-metadata");

import * as _ from "lodash";
import * as Metadata from "../../metadata";
import { Table } from "../../table";
import { HashPrimaryKey } from "../hash_primary_key";

import {
    Attribute as AttributeDecorator,
    HashPrimaryKey as HashPrimaryKeyDecorator,
    Table as TableDecorator
} from "../../decorator";

import Connection from "../../connection";
import * as Query from "../index";

const TABLE_NAME = `prod-Card-${Math.random()}`;

describe("HashPrimaryKey", () => {
    @TableDecorator(TABLE_NAME)
    class Card extends Table {
        @HashPrimaryKeyDecorator("id")
        public static readonly primaryKey: Query.HashPrimaryKey<Card, number>;

        @AttributeDecorator() public id: number;

        @AttributeDecorator() public title: string;

        @AttributeDecorator() public count: number;
    }

    let primaryKey: HashPrimaryKey<Card, number>;

    async function createCard() {
        const card = new Card();
        card.id = Date.now();
        await card.save();
        return card;
    }

    beforeEach(async () => {
        await Card.createTable();

        primaryKey = new HashPrimaryKey<Card, number>(
            Card,
            Card.metadata.primaryKey as Metadata.Indexes.HashPrimaryKeyMetadata,
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

            const card = await primaryKey.get(10);
            expect(card).toBeDefined();
            if (card) {
                expect(card.serialize()).toEqual({
                    id: 10,
                    title: "abc"
                });
            }
            await primaryKey.delete(10);

            const removedCard = await primaryKey.get(10);

            expect(removedCard).toBeNull();
        });
    });

    describe("scan", async () => {
        it("should return results", async () => {
            const cards = [
                await createCard(),
                await createCard(),
                await createCard(),
                await createCard()
            ];

            const res1 = await primaryKey.scan({ limit: 2 });
            const res2 = await primaryKey.scan({
                limit: 2,
                exclusiveStartKey: res1.lastEvaluatedKey
            });

            const ids = _.sortBy(
                _.concat(res1.records, res2.records),
                item => item.id
            ).map(card => card.id);

            expect(ids).toEqual(
                _.sortBy(cards.map(card => card.id), index => index)
            );
        });
    });

    describe("batchGet", async () => {
        it("should return results in order", async () => {
            const cards = [
                await createCard(),
                await createCard(),
                await createCard(),
                await createCard()
            ];

            const result = (await primaryKey.batchGet(
                cards.map(card => card.id)
            )).records;

            // it should keep the order
            expect(result.map(card => card.id)).toEqual(
                cards.map(card => card.id)
            );
        });
    });

    describe("batchDelete", () => {
        it("should remove several records", async () => {
            const cards = [
                await createCard(),
                await createCard(),
                await createCard(),
                await createCard()
            ];

            await primaryKey.batchDelete(cards.map(card => card.id));

            const result = (await primaryKey.batchGet(
                cards.map(card => card.id)
            )).records;

            expect(result).toEqual([]);
        });
    });

    describe("update", () => {
        it("should update item", async () => {
            const card = await createCard();

            await primaryKey.update(card.id, { title: "new title" });

            const updatedCard = await primaryKey.get(card.id);

            expect(updatedCard).toBeDefined();
            if (updatedCard) {
                expect(updatedCard.title).toBe("new title");
            }
        });
    });
});
