import { Attribute } from "../../metadata";
import * as AttributeValue from "../attribute_value";

describe("AttributeValue.parse", () => {
    it("should parse number", () => {
        expect(
            AttributeValue.parse({
                N: "10"
            })
        ).toEqual({ value: 10, type: Attribute.Type.Number });
    });

    it("should parse string", () => {
        expect(
            AttributeValue.parse({
                S: "10"
            })
        ).toEqual({ value: "10", type: Attribute.Type.String });
    });

    it("should throw for non-string B attribute", () => {
        expect(() =>
            AttributeValue.parse({
                B: 10
            })
        ).toThrow("DynamoTypes doesn't support B attribute that is not string");
    });

    it("should parse buffer", () => {
        expect(
            AttributeValue.parse({
                B: "xx"
            })
        ).toEqual({ value: "xx", type: Attribute.Type.Buffer });
    });

    it("should parse array", () => {
        expect(
            AttributeValue.parse({
                L: [
                    { S: "10" },
                    { N: "20" },
                    {
                        L: [{ BOOL: false }]
                    }
                ]
            })
        ).toEqual({
            type: Attribute.Type.Array,
            value: ["10", 20, [false]]
        });
    });

    it("should parse map", () => {
        expect(
            AttributeValue.parse({
                M: {
                    a: { S: "10" },
                    b: { N: "20" },
                    c: {
                        L: [{ BOOL: false }]
                    }
                }
            })
        ).toEqual({
            type: Attribute.Type.Map,
            value: {
                a: "10",
                b: 20,
                c: [false]
            }
        });
    });

    it("should parse null", () => {
        expect(
            AttributeValue.parse({
                NULL: true
            })
        ).toEqual({
            value: null,
            type: Attribute.Type.Null
        });
    });

    it("should throw for unknown value type", () => {
        expect(() => AttributeValue.parse({})).toThrow();
    });
});
