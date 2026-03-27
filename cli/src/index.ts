#!/usr/bin/env node

import { Command } from "commander";
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import _ from "lodash";
import { generateProject } from "./generator";

const program = new Command();

program
	.name("rnjet")
	.description(
		"Production-grade CLI tool and boilerplate system for React Native",
	)
	.version("1.0.0");

program
	.command("init")
	.description("Initialize a new RNJet project")
	.action(async () => {
		try {
			const answers = await inquirer.prompt([
				{
					type: "input",
					name: "appDisplayName",
					message: "1. App Display Name (e.g. My App):",
					validate: (input) =>
						input.trim().length > 0 || "App Display Name is required.",
				},
				{
					type: "input",
					name: "projectName",
					message: "2. Project Name (PascalCase) (e.g. MyApp):",
					filter: (input) => _.upperFirst(_.camelCase(input)),
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
					default: (answers: any) => _.kebabCase(answers.projectName),
					filter: (input, answers) => {
						if (!input) return _.kebabCase(answers.projectName);
						return _.kebabCase(input);
					},
					validate: (input, answers) => {
						const finalInput = input || _.kebabCase(answers?.projectName);
						if (!/^[a-z0-9-]+$/.test(finalInput)) {
							return "Folder Name must be kebab-case (e.g., my-app). Regex: ^[a-z0-9-]+$";
						}
						if (fs.existsSync(path.resolve(process.cwd(), finalInput))) {
							return `Folder '${finalInput}' already exists. Please choose another name.`;
						}
						return true;
					},
				},
				{
					type: "input",
					name: "bundleId",
					message: "4. Bundle Identifier (e.g. com.example.myapp):",
					default: (answers: any) => `com.app.${_.toLower(answers.projectName)}`,
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

			await generateProject(answers);
		} catch (error) {
			console.error("\nInitialization failed:", error);
			process.exit(1);
		}
	});

program.parse(process.argv);
