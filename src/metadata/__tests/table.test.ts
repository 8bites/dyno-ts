import * as Attribute from "../attribute";
import { createMetadata, validateMetadata } from "../table";

describe("Metadata table", () => {
    const invalidMetadata: any = {
        primaryKey: "",
        name: "",
        attributes: [],
        globalSecondaryIndexes: [],
        localSecondaryIndexes: []
    };

    it("should create metadata", () => {
        expect(createMetadata()).toEqual({
            name: "",
            attributes: [],
            globalSecondaryIndexes: [],
            localSecondaryIndexes: []
        });
    });

    it("should validate name", () => {
        expect(() => validateMetadata(invalidMetadata)).toThrow(
            "Name must be provided for Table"
        );
    });

    it("should validate primaryKey", () => {
        expect(() =>
            validateMetadata({
                ...invalidMetadata,
                name: "name"
            })
        ).toThrow("Table must have PrimaryKey");
    });

    it("should throw when ttl attribute is defined twice", () => {
        expect(() =>
            validateMetadata({
                primaryKey: "key",
                name: "name",
                globalSecondaryIndexes: [],
                localSecondaryIndexes: [],
                attributes: [
                    {
                        propertyName: "foo",
                        name: "foo",
                        timeToLive: true,
                        type: Attribute.Type.Number
                    },
                    {
                        propertyName: "bar",
                        name: "bar",
                        timeToLive: true,
                        type: Attribute.Type.Number
                    }
                ]
            } as any)
        ).toThrow("TTL attribute must be one");
    });

    it("should throw when ttl attribute is not a number", () => {
        expect(() =>
            validateMetadata({
                primaryKey: "key",
                name: "name",
                globalSecondaryIndexes: [],
                localSecondaryIndexes: [],
                attributes: [
                    {
                        propertyName: "foo",
                        name: "foo",
                        timeToLive: true,
                        type: Attribute.Type.String
                    }
                ]
            } as any)
        ).toThrow(
            "TTL Attribute must be type of Number, with value of unix timestamp such as 1460232057"
        );
    });

    it("should pass proper ttl attribute", () => {
        expect(() =>
            validateMetadata({
                primaryKey: "key",
                name: "name",
                globalSecondaryIndexes: [],
                localSecondaryIndexes: [],
                attributes: [
                    {
                        propertyName: "foo",
                        name: "foo",
                        timeToLive: true,
                        type: Attribute.Type.Number
                    }
                ]
            } as any)
        ).not.toThrow();
    });
});
