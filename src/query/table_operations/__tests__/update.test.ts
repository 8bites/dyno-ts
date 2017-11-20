import { generateChangeAttributes } from "../update";

describe("generateChangeAttributes", () => {
    const tableClass: any = {
        metadata: {
            attributes: [
                {
                    propertyName: "title",
                    name: "ddbTitle"
                }
            ]
        }
    };

    it("generates update expression", () => {
        const result = generateChangeAttributes(tableClass, {
            title: "new title"
        });

        expect(result.UpdateExpression).toBe("set #ddbTitle = :ddbTitle");
        expect(result.ExpressionAttributeNames).toEqual({
            ["#ddbTitle"]: "title"
        });
        expect(result.ExpressionAttributeValues).toEqual({
            [":ddbTitle"]: "new title"
        });
    });

    it("generates remove expression", () => {
        const result = generateChangeAttributes(tableClass, {
            title: null
        });

        expect(result.UpdateExpression).toBe("remove #ddbTitle");
        expect(result.ExpressionAttributeNames).toEqual({
            ["#ddbTitle"]: "title"
        });
        expect(result.ExpressionAttributeValues).toEqual({});
    });

    it("generates add expression", () => {
        const result = generateChangeAttributes(tableClass, {
            title: ["add", "another title"]
        });

        expect(result.UpdateExpression).toBe("add #ddbTitle :ddbTitle");
        expect(result.ExpressionAttributeNames).toEqual({
            ["#ddbTitle"]: "title"
        });
        expect(result.ExpressionAttributeValues).toEqual({
            [":ddbTitle"]: "another title"
        });
    });

    it("generates delete expression", () => {
        const result = generateChangeAttributes(tableClass, {
            title: ["delete", "another title"]
        });

        expect(result.UpdateExpression).toBe("delete #ddbTitle :ddbTitle");
        expect(result.ExpressionAttributeNames).toEqual({
            ["#ddbTitle"]: "title"
        });
        expect(result.ExpressionAttributeValues).toEqual({
            [":ddbTitle"]: "another title"
        });
    });
});
