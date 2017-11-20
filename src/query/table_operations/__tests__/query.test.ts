import { parseCondition } from "../query";

describe("table operations query", () => {
    describe("parseCondition", () => {
        it("should parse compare conditions", () => {
            const conditions = ["=", "<", "<=", ">="];

            conditions.forEach(condition => {
                expect(
                    parseCondition([condition, "1"] as any, "keyName")
                ).toEqual({
                    conditionExpression: `keyName ${condition} :rkv`,
                    expressionAttributeValues: {
                        ":rkv": "1"
                    }
                });
            });
        });

        it("should parse beginsWith expression", () => {
            expect(
                parseCondition(["beginsWith", "1"] as any, "keyName")
            ).toEqual({
                conditionExpression: `begins_with(keyName, :rkv)`,
                expressionAttributeValues: {
                    ":rkv": "1"
                }
            });
        });

        it("should parse between expression", () => {
            expect(
                parseCondition(["between", "1", "2"] as any, "keyName")
            ).toEqual({
                conditionExpression: `keyName between :rkv1 AND :rkv2`,
                expressionAttributeValues: {
                    ":rkv1": "1",
                    ":rkv2": "2"
                }
            });
        });
    });
});
