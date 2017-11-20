import { Decorator, Query, Table } from "../../index";

describe("Local secondary index", () => {
    it("should throw for missing attribute", () => {
        expect(() => {
            @Decorator.Table(`prod-Card${Math.random()}`)
            class Card extends Table {
                @Decorator.LocalSecondaryIndex("id")
                public static readonly titleIndex: Query.LocalSecondaryIndex<
                    Card,
                    number,
                    string
                >;
            }

            const card = new Card();
            card.save();
        }).toThrow("Given hashKey id is not declared as attribute");
    });
});
