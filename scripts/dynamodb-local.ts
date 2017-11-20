import { ChildProcess } from "child_process";
import * as localDynamo from "local-dynamo";

class DynamoLocal {
    private _childProcess: ChildProcess;

    public launch() {
        return new Promise(resolve => {
            this._childProcess = localDynamo.launch({
                port: 8000,
                sharedDb: true,
                stdio: "pipe"
            });

            this._childProcess.stdout.on("data", buffer => {
                const data = buffer.toString();

                if (data.indexOf("Initializing DynamoDB Local") > -1) {
                    resolve();
                }
                if (data.indexOf("Exception") > -1) {
                    // tslint:disable no-console
                    console.error(data);
                }
            });
        });
    }

    public teardown() {
        return new Promise(resolve => {
            if (this._childProcess) {
                this._childProcess.on("close", resolve);
                process.kill(-this._childProcess.pid);
            } else {
                resolve();
            }
        });
    }
}

export default new DynamoLocal();
