const fs = require('fs');
const ts = require('typescript');
const path = require('path');

const srcFile = path.join(__dirname, 'src/generator.ts');

const content = fs.readFileSync(srcFile, 'utf8');
const sourceFile = ts.createSourceFile('generator.ts', content, ts.ScriptTarget.Latest, true);

let filesToCreate = [];

function visit(node) {
    if (ts.isCallExpression(node)) {
        const expr = node.expression;
        if (ts.isPropertyAccessExpression(expr) && expr.expression.text === 'fs' && (expr.name.text === 'writeFileSync' || expr.name.text === 'mkdirSync')) {
            const args = node.arguments;
            if (args.length >= 1) {
                const pathNode = args[0];
                
                let isMatch = false;
                 if (ts.isCallExpression(pathNode) && pathNode.expression.name && pathNode.expression.name.text === 'join') {
                    const arg0 = pathNode.arguments[0];
                    if (arg0 && ts.isIdentifier(arg0)) {
                        const base = arg0.text;
                        if (['i18nHooksDir', 'navHooksDir', 'welcomeDir', 'textTypeDir', 'mainDir', 'mainScreenDir'].includes(base)) {
                            isMatch = true;
                        }
                    }
                } else if (ts.isIdentifier(pathNode)) {
                     const base = pathNode.text;
                     if (['i18nHooksDir', 'navHooksDir', 'welcomeDir', 'textTypeDir', 'mainDir', 'mainScreenDir'].includes(base)) {
                            isMatch = true;
                     }
                }

                if (isMatch) {
                    filesToCreate.push({
                        nodeStart: node.getStart(sourceFile, true),
                        nodeEnd: node.getEnd()
                    });
                }
            }
        }
    }
    ts.forEachChild(node, visit);
}

visit(sourceFile);

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
console.log(`Pruned ${filesToCreate.length} calls successfully!`);
