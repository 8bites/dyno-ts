import { nativeTypeToAttributeMetadataType } from "../attribute";

describe("nativeTypeToAttributeMetadataType", () => {
    const types = [
        [String, "S"],
        [Number, "N"],
        [Boolean, "BOOL"],
        [Array, "L"],
        [Object, "M"]
    ];

    types.forEach((type) => {
        const nativeType = type[0];
        const dynamodbType = type[1];

        it(`converts ${nativeType.toString()}`, () => {
            expect(nativeTypeToAttributeMetadataType(nativeType)).toBe(
                dynamodbType
            );
        });
    });

    it("throws error for unexpected type", () => {
        expect(() => nativeTypeToAttributeMetadataType("foo")).toThrowError();
    });
});
