const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { compilerOptions: { paths } } = require("./tsconfig.paths.json");

module.exports = {
    preset: "ts-jest",
    // transform: {
    //     "\\.[jt]sx?$": "ts-jest",
    // },
    testEnvironment: "jsdom",
    moduleNameMapper: {
        ...pathsToModuleNameMapper(paths, { prefix: "<rootDir>/" }),
        "^.+\\.(css|scss|svg|png)$": "identity-obj-proxy",
    },
};
