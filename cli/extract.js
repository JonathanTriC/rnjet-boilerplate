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

                    if (arg0 && ts.isIdentifier(arg0) && arg0.text === 'targetDir' && arg1 && ts.isStringLiteral(arg1)) {
                         filePath = arg1.text;
                    } else if (arg0 && ts.isIdentifier(arg0) && arg1 && ts.isStringLiteral(arg1)) {
                        const base = arg0.text;
                        if (base === 'navCommonStackDir') filePath = 'src/navigation/navigator/stack/common-stack/' + arg1.text;
                        else if (base === 'navMainStackDir') filePath = 'src/navigation/navigator/stack/main-stack/' + arg1.text;
                        else if (base === 'navStackDir') filePath = 'src/navigation/navigator/stack/' + arg1.text;
                        else if (base === 'navNavigatorDir') filePath = 'src/navigation/navigator/' + arg1.text;
                        else if (base === 'navRouteAppDir') filePath = 'src/navigation/route-app/' + arg1.text;
                        else if (base === 'mainComponentsDir') filePath = 'src/components/' + arg1.text;
                        else if (base === 'i18nLocalesDir') filePath = 'src/i18n/locales/' + arg1.text;
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

                    if (fileContent !== undefined) {
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

console.log(`Extracted ${filesToCreate.length} files successfully!`);

// Optionally, generate ranges so that next step can easily delete
fs.writeFileSync(path.join(__dirname, 'extract_ranges.json'), JSON.stringify(filesToCreate.map(f => ({
    path: f.path, 
    start: f.nodeStart, 
    end: f.nodeEnd
})), null, 2));
