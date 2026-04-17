const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, 'src/generator.ts');
let content = fs.readFileSync(srcFile, 'utf8');

const anchor1 = '// 5. Inject folder structure';
const anchor2 = '// Update configurations';

const idx1 = content.indexOf(anchor1);
const idx2 = content.indexOf(anchor2);

if (idx1 !== -1 && idx2 !== -1) {
    const codeToInsert = `	const templateDir = path.resolve(__dirname, "../../template");
	copyTemplateDir(templateDir, targetDir, {
		appDisplayName,
		projectName,
		folderName,
		bundleId,
	});\n\n\t`;
    content = content.slice(0, idx1) + codeToInsert + content.slice(idx2);
}

// Next, strip the splash screen and common screen directory creations
const anchorSplash1 = '// React SplashScreen';
const anchorSplash2 = 'console.log(chalk.cyan("\\nInstalling Pods..."));';

const sIdx1 = content.indexOf(anchorSplash1);
const sIdx2 = content.indexOf(anchorSplash2);

if (sIdx1 !== -1 && sIdx2 !== -1) {
    content = content.slice(0, sIdx1) + content.slice(sIdx2);
}

// Append the helper functions at the very end
const helpers = `

function copyTemplateDir(src: string, dest: string, vars: Record<string, string>) {
	const entries = fs.readdirSync(src, { withFileTypes: true });
	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		if (entry.isDirectory()) {
			fs.mkdirpSync(path.join(dest, entry.name));
			copyTemplateDir(srcPath, path.join(dest, entry.name), vars);
		} else if (entry.name.endsWith(".template")) {
			const destName = entry.name.replace(".template", "");
			const fileContent = fs.readFileSync(srcPath, "utf8");
			fs.writeFileSync(
				path.join(dest, destName),
				interpolate(fileContent, vars)
			);
		} else {
			fs.copyFileSync(srcPath, path.join(dest, entry.name));
		}
	}
}

function interpolate(content: string, vars: Record<string, string>): string {
	return content.replace(/\\{\\{(\\w+)\\}\\}/g, (_, key) => vars[key] ?? "");
}
`;

content += helpers;

fs.writeFileSync(srcFile, content);
console.log('Final replacement complete!');
