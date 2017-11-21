const { ChildProcess } = require("child_process");
const localDynamo = require("local-dynamo");

let childProcess = null;

const DynamoLocal = {
    launch() {
        return new Promise(resolve => {
            childProcess = localDynamo.launch({
                port: 8000,
                sharedDb: true,
                stdio: "pipe",
                detached: true
            });

            childProcess.stdout.on("data", buffer => {
                const data = buffer.toString();

                process.stdout.write(data);

                if (data.indexOf("Initializing DynamoDB Local") > -1) {
                    resolve(childProcess.pid);
                }
                if (data.indexOf("Exception") > -1) {
                    // tslint:disable no-console
                    console.error(data);
                    reject(new Error(data));
                }
            });
        });
    },

    teardown() {
        return new Promise(resolve => {
            if (childProcess) {
                childProcess.on("close", resolve);
                process.kill(-childProcess.pid);
            } else {
                resolve();
            }
        });
    }
};

module.exports = DynamoLocal;
