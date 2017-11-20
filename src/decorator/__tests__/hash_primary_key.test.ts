import { Decorator, Query, Table } from "../../index";

describe("Hash primary key", () => {
    it("should throw for missing attribute", () => {
        expect(() => {
            @Decorator.Table(`prod-Card${Math.random()}`)
            class Card extends Table {
                @Decorator.HashPrimaryKey("id")
                public static readonly primaryKey: Query.HashPrimaryKey<
                    Card,
                    number
                >;
            }

            const card = new Card();
            card.save();
        }).toThrow("Given hashKey id is not declared as attribute");
    });
});
