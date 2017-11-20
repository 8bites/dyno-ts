import { Decorator, Query, Table } from "../../index";

// tslint:disable max-classes-per-file
describe("Global secondary index", () => {
    describe("hash", () => {
        it("should throw for missing attribute", () => {
            expect(() => {
                @Decorator.Table(`prod-Card${Math.random()}`)
                class Card extends Table {
                    @Decorator.HashGlobalSecondaryIndex("id")
                    public static readonly titleIndex: Query.HashGlobalSecondaryIndex<
                        Card,
                        number
                    >;
                }

                const card = new Card();
                card.save();
            }).toThrow("Given hashKey id is not declared as attribute");
        });
    });

    describe("full", () => {
        it("should throw for missing hash attribute", () => {
            expect(() => {
                @Decorator.Table(`prod-Card${Math.random()}`)
                class Card extends Table {
                    @Decorator.FullGlobalSecondaryIndex("id", "title")
                    public static readonly titleIndex: Query.FullGlobalSecondaryIndex<
                        Card,
                        number,
                        string
                    >;

                    @Decorator.Attribute() public title: string;
                }

                const card = new Card();
                card.save();
            }).toThrow("Given hashKey id is not declared as attribute");
        });

        it("should throw for missing range attribute", () => {
            expect(() => {
                @Decorator.Table(`prod-Card${Math.random()}`)
                class Card extends Table {
                    @Decorator.FullGlobalSecondaryIndex("id", "title")
                    public static readonly titleIndex: Query.FullGlobalSecondaryIndex<
                        Card,
                        number,
                        string
                    >;

                    @Decorator.Attribute() public id: number;
                }

                const card = new Card();
                card.save();
            }).toThrow("Given rangeKey title is not declared as attribute");
        });
    });
});
