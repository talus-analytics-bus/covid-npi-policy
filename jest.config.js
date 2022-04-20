const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { compilerOptions } = require("./tsconfig.json");

module.exports = {
    preset: "ts-jest",
    transform: {
        "\\.[jt]sx?$": "ts-jest",
    },
    testEnvironment: "jsdom",
    moduleNameMapper: {
        ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
        "^.+\\.(css|scss|svg|png)$": "identity-obj-proxy",
    },
};
