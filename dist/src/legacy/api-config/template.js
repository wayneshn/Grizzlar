"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UndefinedVariable = exports.expandTemplate = void 0;
const lodash_at_1 = __importDefault(require("lodash.at"));
const errors_1 = require("../errors");
// Matches escaped characters eg. "\$" or variables with optional surrounding whitespace eg. "${  name  }"
const parserRegex = /\\.|\$\{\s*([^}\s]*)\s*\}/g;
const expandString = (template, templatePath, variables) => template.replace(parserRegex, (match, variableName) => {
    if (match[0] === '\\') {
        return match[1];
    }
    const value = lodash_at_1.default(variables, variableName)[0];
    if (value === undefined) {
        throw new UndefinedVariable(templatePath, variableName);
    }
    return value;
});
const expandArray = (template, templatePath, variables) => template.map((element, i) => expand(element, `${templatePath}[${i}]`, variables));
const expandObject = (template, templatePath, variables) => {
    const result = {};
    for (const [attributeName, childTemplate] of Object.entries(template)) {
        const childPath = templatePath ? `${templatePath}.${attributeName}` : attributeName;
        result[attributeName] = expand(childTemplate, childPath, variables);
    }
    return result;
};
const expand = (template, templatePath, variables) => {
    if (Array.isArray(template)) {
        return expandArray(template, templatePath, variables);
    }
    if (typeof template === 'string') {
        return expandString(template, templatePath, variables);
    }
    if (typeof template === 'number') {
        return template;
    }
    return expandObject(template, templatePath, variables);
};
/**
 * Performs variable interpolation on strings. The strings may be contained within
 * nested objects or arrays. Numbers are returned unchanged.
 *
 * Examples variables `{ name: 'Bearer', address: { city: 'Paris' } }`:
 *
 * Example cases:
 *
 *   `{ greeting: 'Hi ${name}', count: 5 }` => `{ greeting: 'Hi Bearer', count: 5 }`
 *
 *   `['City is ${address.city}', { busy: true }]` => `['City is Paris', { busy: true }]`
 *
 *   `'Hey there "${name}"'` => `'Hey there "Bearer"'`
 *
 *   `'Not a variable: \\${name}'` => `'Not a variable: ${name}'`
 *
 *   `{ a: 'Oops ${some.age}' }` => throws `UndefinedVariable(templatePath: 'a', variableName: 'some.age')`
 */
exports.expandTemplate = (template, variables) => expand(template, '', variables);
class UndefinedVariable extends errors_1.CustomError {
    constructor(templatePath, variableName) {
        super(`Undefined variable ${variableName} used in template at ${templatePath}`);
        this.templatePath = templatePath;
        this.variableName = variableName;
    }
}
exports.UndefinedVariable = UndefinedVariable;
