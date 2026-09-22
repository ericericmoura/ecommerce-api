import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset({
  tsconfig: "tsconfig.jest.json",
}).transform;

/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    "^@/(.*)\\.js$": "<rootDir>/src/$1",
    "^@root/(.*)\\.js$": "<rootDir>/$1",
  },
  clearMocks: true,
  preset: "ts-jest",
  setupFilesAfterEnv: ["<rootDir>/src/config/prismaMock.ts"],
};