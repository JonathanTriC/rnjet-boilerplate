const fs = require('fs');
const ts = require('typescript');
const path = require('path');

const srcFile = path.join(__dirname, 'src/generator.ts');
const targetTemplateDir = path.join(__dirname, 'template');

const content = fs.readFileSync(srcFile, 'utf8');
const sourceFile = ts.createSourceFile('generator.ts', content, ts.ScriptTarget.Latest, true);

let filesToCreate = [];

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

                    if (arg0 && ts.isIdentifier(arg0) && arg1 && ts.isStringLiteral(arg1)) {
                        const base = arg0.text;
                        if (base === 'i18nHooksDir') filePath = 'src/hooks/i18n-hooks/' + arg1.text;
                        else if (base === 'navHooksDir') filePath = 'src/hooks/navigation-hooks/' + arg1.text;
                        else if (base === 'welcomeDir') filePath = 'src/i18n/welcome/' + arg1.text;
                        else if (base === 'textTypeDir') filePath = 'src/types/text-type/' + arg1.text;
                        else if (base === 'mainDir') filePath = 'src/modules/main/' + arg1.text;
                        else if (base === 'mainScreenDir') filePath = 'src/modules/main/screens/' + arg1.text;
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
                    }

                    if (fileContent !== undefined && fileContent.length > 0) {
                        filesToCreate.push({
                            path: filePath,
                            content: fileContent,
                            isTemplate
                        });
                    }
                }
            }
        }
    }
    ts.forEachChild(node, visit);
}

visit(sourceFile);

for (const f of filesToCreate) {
    const finalName = f.isTemplate ? f.path + '.template' : f.path;
    const dest = path.join(targetTemplateDir, finalName);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, f.content);
}

console.log(`Extracted ${filesToCreate.length} remaining files successfully!`);
