require("reflect-metadata");

import {
    Attribute as AttributeDecorator,
    FullPrimaryKey as FullPrimaryKeyDecorator,
    HashPrimaryKey as HashPrimaryKeyDecorator,
    Table as TableDecorator
} from "../../decorator";

import * as Query from "../index";
import * as TableOperations from "../table_operations";
import { Writer } from "../writer";

import { Table } from "../../table";

import Connection from "../../connection";

// tslint:disable max-classes-per-file
describe("Writer", () => {
    describe("full key", () => {
        @TableDecorator(`prod-Card-${Date.now()}`)
        class Card extends Table {
            @FullPrimaryKeyDecorator("id", "title")
            public static readonly primaryKey: Query.FullPrimaryKey<
                Card,
                number,
                string
            >;

            @AttributeDecorator() public id: number;

            @AttributeDecorator() public title: string;
        }

        beforeEach(async () => {
            await TableOperations.createTable(Card.metadata, Connection.client);
        });
        afterEach(async () => {
            await TableOperations.dropTable(Card.metadata, Connection.client);
        });

        describe("put", () => {
            it("should put or update record", async () => {
                const card = new Card();
                card.id = 100;
                card.title = "100";

                const writer = new Writer(Card, Connection.documentClient);
                await writer.put(card);

                const reloadedCard = await Card.primaryKey.get(100, "100");
                expect(reloadedCard).toBeInstanceOf(Card);
                expect(reloadedCard!.id).toBe(100);
                expect(reloadedCard!.title).toBe("100");
            });
        });
    });

    describe("hash key", () => {
        @TableDecorator(`prod-Card-${Date.now()}`)
        class Card extends Table {
            @HashPrimaryKeyDecorator("id")
            public static readonly primaryKey: Query.HashPrimaryKey<
                Card,
                number
            >;

            @AttributeDecorator() public id: number;

            @AttributeDecorator() public title: string;
        }

        beforeEach(async () => {
            await TableOperations.createTable(Card.metadata, Connection.client);
        });
        afterEach(async () => {
            await TableOperations.dropTable(Card.metadata, Connection.client);
        });

        describe("put", () => {
            it("should put or update record", async () => {
                const card = new Card();
                card.id = 100;
                card.title = "100";

                const writer = new Writer(Card, Connection.documentClient);
                await writer.put(card);

                const reloadedCard = await Card.primaryKey.get(100);
                expect(reloadedCard).toBeInstanceOf(Card);
                expect(reloadedCard!.id).toBe(100);
                expect(reloadedCard!.title).toBe("100");

                await writer.delete(card);

                const removedCard = await Card.primaryKey.get(100);
                expect(removedCard).toBeNull();
            });
        });
    });
});
