const fs = require('fs');

const srcFile = 'src/generator.ts';
const ranges = require('./extract_ranges.json');

let content = fs.readFileSync(srcFile, 'utf8');

// Sort ranges back to front to safely delete by index
ranges.sort((a, b) => b.start - a.start);

for (const r of ranges) {
    // Delete the range and the trailing semicolon if it exists
    let endIdx = r.end;
    if (content[endIdx] === ';') {
        endIdx++;
    }
    content = content.slice(0, r.start) + content.slice(endIdx);
}

// Remove empty directories logic
// const folders = [ "src/api", ... ]; for (const folder of folders) { fs.mkdirpSync(...) }
content = content.replace(/const folders = \[\s*([\s\S]*?)\];\n\n\tfor \(const folder of folders\) \{\n\t\tfs\.mkdirpSync\(path\.join\(targetDir, folder\)\);\n\t\}/g, '');

content = content.replace(/const devEnv = `[\s\S]*?`;\n/, '');
content = content.replace(/const prodEnv = `[\s\S]*?`;\n/, '');
content = content.replace(/const makefileContent = `[\s\S]*?`;\n/, '');

// Delete empty newlines left behind
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

fs.writeFileSync(srcFile, content);
console.log('Successfully pruned generator.ts');
