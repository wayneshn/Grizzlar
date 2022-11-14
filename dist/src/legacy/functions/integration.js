"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const integrations_1 = require("../auth/clients/integrations");
class Integration {
    constructor(buid) {
        this.buid = buid;
        this.config = async () => {
            if (!this._config) {
                this._config = await integrations_1.getConfig({
                    buid: this.buid
                });
            }
            return this._config;
        };
    }
}
exports.default = Integration;
