#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const inquirer_1 = __importDefault(require("inquirer"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const generator_1 = require("./generator");
const program = new commander_1.Command();
program
    .name("rnjet")
    .description("Production-grade CLI tool and boilerplate system for React Native")
    .version("1.0.0");
program
    .command("init")
    .description("Initialize a new RNJet project")
    .action(async () => {
    try {
        const answers = await inquirer_1.default.prompt([
            {
                type: "input",
                name: "appDisplayName",
                message: "1. App Display Name (e.g. My App):",
                validate: (input) => input.trim().length > 0 || "App Display Name is required.",
            },
            {
                type: "input",
                name: "projectName",
                message: "2. Project Name (PascalCase) (e.g. MyApp):",
                filter: (input) => lodash_1.default.upperFirst(lodash_1.default.camelCase(input)),
                validate: (input) => {
                    if (!/^[A-Z][a-zA-Z0-9]+$/.test(input)) {
                        return "Project Name must be PascalCase (e.g., MyApp). Regex: ^[A-Z][a-zA-Z0-9]+$";
                    }
                    return true;
                },
            },
            {
                type: "input",
                name: "folderName",
                message: "3. Folder Name (kebab-case) (e.g. my-app):",
                default: (answers) => lodash_1.default.kebabCase(answers.projectName),
                filter: (input, answers) => {
                    if (!input)
                        return lodash_1.default.kebabCase(answers.projectName);
                    return lodash_1.default.kebabCase(input);
                },
                validate: (input, answers) => {
                    const finalInput = input || lodash_1.default.kebabCase(answers?.projectName);
                    if (!/^[a-z0-9-]+$/.test(finalInput)) {
                        return "Folder Name must be kebab-case (e.g., my-app). Regex: ^[a-z0-9-]+$";
                    }
                    if (fs_extra_1.default.existsSync(path_1.default.resolve(process.cwd(), finalInput))) {
                        return `Folder '${finalInput}' already exists. Please choose another name.`;
                    }
                    return true;
                },
            },
            {
                type: "input",
                name: "bundleId",
                message: "4. Bundle Identifier (e.g. com.example.myapp):",
                default: (answers) => `com.app.${lodash_1.default.toLower(answers.projectName)}`,
                validate: (input) => {
                    if (!/^[a-z]+(\.[a-z0-9]+)+$/.test(input)) {
                        return "Bundle ID format invalid. Must match: ^[a-z]+(\\.[a-z0-9]+)+$";
                    }
                    return true;
                },
            },
            {
                type: "confirm",
                name: "installDeps",
                message: "5. Install dependencies?",
                default: true,
            },
        ]);
        await (0, generator_1.generateProject)(answers);
    }
    catch (error) {
        console.error("\nInitialization failed:", error);
        process.exit(1);
    }
});
program.parse(process.argv);
