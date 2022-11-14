"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmpty = void 0;
// Is the given object empty e.g. {}?
function isEmpty(obj) {
    return Object.getOwnPropertyNames(obj).length === 0;
}
exports.isEmpty = isEmpty;
