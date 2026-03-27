const fs = require('fs');
let c = fs.readFileSync('src/generator.ts', 'utf8');

const sIdx = c.indexOf('  // 6. ENV FILES');
const eIdx = c.indexOf('  // 7. URL CONSTANTS');

if (sIdx !== -1 && eIdx !== -1) {
  const replaceStr = `  // 6. ENV FILES
  const devEnv = 'APP_NAME=' + appDisplayName + '\\nAPP_NAME_PREFIX=[DEV] \\nBUNDLE_ID=' + bundleId + '\\nBUNDLE_ID_SUFFIX=.dev\\nAPI_URL=https://dev.api.example.com\\nENV=development\\n';
  const prodEnv = 'APP_NAME=' + appDisplayName + '\\nAPP_NAME_PREFIX=\\nBUNDLE_ID=' + bundleId + '\\nBUNDLE_ID_SUFFIX=\\nAPI_URL=https://api.example.com\\nENV=production\\n';

  fs.writeFileSync(path.join(targetDir, '.env'), devEnv);
  fs.writeFileSync(path.join(targetDir, '.env.development'), devEnv);
  fs.writeFileSync(path.join(targetDir, '.env.production'), prodEnv);

`;
  
  c = c.substring(0, sIdx) + replaceStr + c.substring(eIdx);
  fs.writeFileSync('src/generator.ts', c);
  console.log("Patched successfully!");
} else {
  console.log("Indices not found!");
}
