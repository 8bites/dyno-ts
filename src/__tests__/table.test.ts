import { Decorator, Query, Table } from "../index";

describe("Table", () => {
    @Decorator.Table(`prod-Card${Math.random()}`)
    class Card extends Table {
        @Decorator.FullPrimaryKey("id", "title")
        public static readonly primaryKey: Query.FullPrimaryKey<
            Card,
            number,
            string
        >;

        @Decorator.HashGlobalSecondaryIndex("title")
        public static readonly titleIndex: Query.HashGlobalSecondaryIndex<
            Card,
            string
        >;

        @Decorator.Attribute() public id: number;

        @Decorator.Attribute() public title: string;

        // @Decorator.Attribute({ timeToLive: true })
        @Decorator.Attribute() public expiresAt: number;
    }

    beforeEach(async () => {
        const response = await Card.createTable();
        console.log(">>> response: ", response);
    });
    afterEach(async () => {
        await Card.dropTable();
    });

    it("should create primaryKey", () => {
        expect(Card.primaryKey).toBeInstanceOf(Query.FullPrimaryKey);
    });

    it("should have attributes properties", async () => {
        const card = new Card();
        card.id = 10;
        card.title = "100";

        await card.save();

        const reloadedCard = await Card.primaryKey.get(10, "100");
        expect(reloadedCard).toBeInstanceOf(Card);
        expect(reloadedCard!.id).toBe(10);
        expect(reloadedCard!.title).toBe("100");
    });

    it("should create entity with constructor", async () => {
        const card = new Card({ id: 10, title: "100" });

        await card.save();
        const reloadedCard = await Card.primaryKey.get(10, "100");
        expect(reloadedCard).toBeInstanceOf(Card);
        expect(reloadedCard!.id).toBe(10);
        expect(reloadedCard!.title).toBe("100");
    });

    it("should validate entity in constructor", async () => {
        const card = new Card({ id: "11", title: "100" });
        let error = null;

        try {
            await card.save();
        } catch (err) {
            error = err;
        }
        expect(error).toBeDefined();
    });

    it("should serialize", () => {
        const card = new Card({ id: 11, title: "100" });

        expect(card.serialize()).toEqual({
            id: 11,
            title: "100"
        });
    });

    it("should remove record", async () => {
        const card = new Card({ id: 11, title: "100" });

        await card.save();
        await card.delete();

        const cardRecord = await Card.primaryKey.get(card.id, card.title);

        expect(cardRecord).toBeNull();
    });

    // https://github.com/aws/aws-sdk-js/issues/1527
    // TTL doesn't supported at dynamo-local Yet
    xit("should works with TTL", async () => {
        const card = new Card();
        card.id = 10;
        card.title = "100";
        card.expiresAt = new Date().valueOf() / 1000 + 100;
        await card.save();

        await new Promise((resolve, reject) => {
            setTimeout(resolve, 300);
        });

        const reloadCard = await Card.primaryKey.get(10, "100");
        expect(reloadCard).toBeNull();
    });
});
