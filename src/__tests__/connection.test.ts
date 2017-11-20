import Connection from "../connection";

describe("Connection", () => {
    it("returns client instance", () => {
        expect(Connection.client).toBeDefined();
    });

    it("returns documentClient", () => {
        expect(Connection.documentClient).toBeDefined();
    });

    it("initalize connection with env region", () => {
        process.env.AWS_REGION = "localhost";

        expect(() => Connection.initalize()).not.toThrow();
        delete process.env.AWS_REGION;
    });

    it("initializes connection with enableAWSXray flag", () => {
        expect(() =>
            Connection.initalize({ enableAWSXray: true })
        ).not.toThrow();
    });

    it("initializes connection with ENABLE_XRAY env flag", () => {
        process.env.ENABLE_XRAY = "*";

        expect(() => Connection.initalize()).not.toThrow();

        delete process.env.ENABLE_XRAY;
    });
});
