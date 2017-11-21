require("reflect-metadata");

import { Attribute as AttributeDecorator } from "../attribute";
import { FullPrimaryKey as FullPrimaryKeyDecorator } from "../full_primary_key";
import { Table as TableDecorator } from "../table";
import { Writer as WriterDecorator } from "../writer";

import * as Query from "../../query";

import { Table } from "../../table";

const TABLE_NAME = `prod-Card-${Math.random()}`;

@TableDecorator(TABLE_NAME)
class Card extends Table {
    @FullPrimaryKeyDecorator("id", "title")
    public static readonly primaryKey: Query.FullPrimaryKey<
        Card,
        number,
        string
    >;

    @WriterDecorator() public static readonly writer: Query.Writer<Card>;

    @AttributeDecorator() public id: number;

    @AttributeDecorator() public title: string;

    @AttributeDecorator({ name: "complicated_field" })
    public complicatedField: string;
}

describe("Table Decorator", () => {
    it("should build table metadata", () => {
        expect(Card.metadata.name).toBe(TABLE_NAME);
    });

    it("should create primaryKey", () => {
        expect(Card.primaryKey).toBeInstanceOf(Query.FullPrimaryKey);
    });

    it("should have writer", () => {
        expect(Card.writer).toBeInstanceOf(Query.Writer);
    });

    it("should have attributes properties", () => {
        const card = new Card();
        card.id = 10;
        card.title = "100";

        card.complicatedField = "data";
        expect(card.getAttribute("complicated_field")).toBe("data");

        card.setAttribute("complicated_field", "data2");
        expect(card.complicatedField).toBe("data2");
    });

    it("should throw for missing hash key", () => {
        expect(() => {
            // tslint:disable max-classes-per-file
            @TableDecorator(TABLE_NAME)
            class InvalidCard extends Table {
                @FullPrimaryKeyDecorator("id", "title")
                public static readonly primaryKey: Query.FullPrimaryKey<
                    Card,
                    number,
                    string
                >;

                @AttributeDecorator() public title: string;
            }

            const card = new InvalidCard();
            card.save();
        }).toThrow("Given hashKey id is not declared as attribute");
    });

    it("should throw for missing range key", () => {
        expect(() => {
            // tslint:disable max-classes-per-file
            @TableDecorator(TABLE_NAME)
            class InvalidCard extends Table {
                @FullPrimaryKeyDecorator("id", "title")
                public static readonly primaryKey: Query.FullPrimaryKey<
                    Card,
                    number,
                    string
                >;

                @AttributeDecorator() public id: number;
            }

            const card = new InvalidCard();
            card.save();
        }).toThrow("Given hashKey title is not declared as attribute");
    });
});
