"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require('path');
const fs = require('fs');
const uuid_1 = require("uuid");
exports.default = () => {
    const isEnabled = process.env.TELEMETRY === 'FALSE' ? false : true;
    if (!isEnabled) {
        console.log('Telemetry is disabled');
        return '';
    }
    try {
        // Get UUID from package.json
        const rootDir = path.join(__dirname, '../../../');
        const config = require(rootDir + 'package.json');
        // If found, return UUID
        if (config.pizzly && config.pizzly.uuid) {
            return config.pizzly.uuid;
        }
        // If none, create UUID and return it
        config.pizzly = { ...config.pizzly };
        config.pizzly.uuid = uuid_1.v4();
        fs.writeFileSync(rootDir + 'package.json', JSON.stringify(config, null, 2));
        return config.pizzly.uuid;
    }
    catch (err) {
        return '';
    }
};
