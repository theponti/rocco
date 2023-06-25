import type { Config } from "jest";
import path from "path";

export default async (): Promise<Config> => {
  return {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,
    testMatch: [path.resolve(__dirname, "./src/**/*.test.ts")],
  };
};
