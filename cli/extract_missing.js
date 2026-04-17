const fs = require('fs');
const ts = require('typescript');
const path = require('path');

const srcFile = path.join(__dirname, 'src/generator.ts');
const targetTemplateDir = path.join(__dirname, 'template');

const content = fs.readFileSync(srcFile, 'utf8');
const sourceFile = ts.createSourceFile('generator.ts', content, ts.ScriptTarget.Latest, true);

let filesToCreate = [];
let rangesToRemove = [];

function visit(node) {
    if (ts.isCallExpression(node)) {
        const expr = node.expression;
        if (ts.isPropertyAccessExpression(expr) && expr.expression.text === 'fs' && expr.name.text === 'writeFileSync') {
            const args = node.arguments;
            if (args.length >= 2) {
                const pathNode = args[0];
                const contentNode = args[1];
                let filePath = '';
                
                 if (ts.isCallExpression(pathNode) && pathNode.expression.name && pathNode.expression.name.text === 'join') {
                    const arg0 = pathNode.arguments[0];
                    const arg1 = pathNode.arguments[1];

                    // Check if it's one of the missing directories
                    if (arg0 && ts.isIdentifier(arg0) && arg1 && ts.isStringLiteral(arg1)) {
                        const base = arg0.text;
                        if (base === 'homeDir') filePath = 'src/modules/main/screens/home/' + arg1.text;
                        else if (base === 'mainComponentsDir') filePath = 'src/modules/main/components/' + arg1.text;
                        else if (base === 'layoutDir') filePath = 'android/app/src/main/res/layout/' + arg1.text;
                        else if (base === 'splashDir') filePath = 'src/modules/common/splash-screen/' + arg1.text;
                        else if (base === 'commonComponentsDir') filePath = 'src/modules/common/components/' + arg1.text;
                        else if (base === 'targetDir') filePath = arg1.text;
                    }
                }

                if (filePath) {
                    let fileContent = '';
                    let isTemplate = false;
                    
                    if (ts.isNoSubstitutionTemplateLiteral(contentNode) || ts.isStringLiteral(contentNode)) {
                        fileContent = contentNode.text;
                    } else if (ts.isTemplateExpression(contentNode)) {
                        isTemplate = true;
                        fileContent = contentNode.head.text;
                        for (let span of contentNode.templateSpans) {
                            if (ts.isIdentifier(span.expression)) {
                                fileContent += `{{${span.expression.text}}}`;
                            } else if (ts.isPropertyAccessExpression(span.expression)) {
                                fileContent += `{{${span.expression.name.text}}}`;
                            } else {
                                fileContent += `{{UNKNOWN}}`;
                            }
                            fileContent += span.literal.text;
                        }
                    } else {
                        // Skip if it's not a literal or template we generated
                        return;
                    }

                    if (fileContent !== undefined && fileContent.length > 0) {
                        filesToCreate.push({
                            path: filePath,
                            content: fileContent,
                            isTemplate,
                            nodeStart: node.getStart(sourceFile, true),
                            nodeEnd: node.getEnd()
                        });
                    }
                }
            }
        }
    }
    ts.forEachChild(node, visit);
}

visit(sourceFile);

// Create the template directory and subdirectories
for (const f of filesToCreate) {
    const finalName = f.isTemplate ? f.path + '.template' : f.path;
    const dest = path.join(targetTemplateDir, finalName);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, f.content);
}

console.log(`Extracted ${filesToCreate.length} missing files successfully!`);

// Prune them from generator.ts
let newContent = content;
filesToCreate.sort((a, b) => b.nodeStart - a.nodeStart);
for (const f of filesToCreate) {
    let endIdx = f.nodeEnd;
    if (newContent[endIdx] === ';') {
        endIdx++;
    }
    newContent = newContent.slice(0, f.nodeStart) + newContent.slice(endIdx);
}
fs.writeFileSync(srcFile, newContent);
console.log('Successfully pruned generator.ts again');
