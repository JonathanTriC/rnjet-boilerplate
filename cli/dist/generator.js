"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProject = generateProject;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const shelljs_1 = __importDefault(require("shelljs"));
const chalk_1 = __importDefault(require("chalk"));
const sharp_1 = __importDefault(require("sharp"));
async function generateProject(answers) {
    const { appDisplayName, projectName, folderName, bundleId, installDeps } = answers;
    const targetDir = path_1.default.resolve(process.cwd(), folderName);
    // 1. Create folder
    fs_extra_1.default.mkdirpSync(targetDir);
    // 2. Run React Native CLI inside it
    console.log(chalk_1.default.cyan("Generating base React Native project..."));
    shelljs_1.default.cd(targetDir);
    // Using the exact required command but adapted for RN 0.84.1 deprecations
    const initCmd = `npx --yes @react-native-community/cli@latest init ${projectName} --version 0.84.1 --skip-install`;
    if (shelljs_1.default.exec(initCmd).code !== 0) {
        console.error(chalk_1.default.red("Failed to initialize React Native project. See above logs for details."));
        process.exit(1);
    }
    console.log(chalk_1.default.green("React Native project initialized"));
    // Move nested generated project to root of targetDir
    const nestedDir = path_1.default.join(targetDir, projectName);
    if (fs_extra_1.default.existsSync(nestedDir)) {
        fs_extra_1.default.copySync(nestedDir, targetDir);
        fs_extra_1.default.removeSync(nestedDir);
    }
    // 3. Rename project
    console.log(chalk_1.default.cyan("Renaming bundle identifier..."));
    const renameCmd = `npx --yes react-native-rename "${projectName}" -b ${bundleId}`;
    if (shelljs_1.default.exec(renameCmd).code !== 0) {
        console.warn(chalk_1.default.yellow("react-native-rename could not be completed cleanly. Continuing..."));
    }
    else {
        console.log(chalk_1.default.green("Project renamed successfully"));
    }
    // 4. Install dependencies
    if (installDeps) {
        console.log(chalk_1.default.cyan("Installing boilerplate dependencies..."));
        const deps = [
            "@react-native-masked-view/masked-view@^0.3.2",
            "react-native-screens@latest",
            "react-native-gesture-handler@latest",
            "react-native-mmkv@latest",
            "react-native-nitro-modules@latest",
            "react-native-splash-view@^0.0.21",
            "@react-native-vector-icons/material-design-icons@^13.0.0",
            "react-native-linear-gradient@^2.8.3",
            "@react-navigation/native@^7.1.31",
            "@react-navigation/stack@^7.8.2",
            "@react-navigation/bottom-tabs@^7.15.9",
            "react-native-safe-area-context@^5.2.0",
            "react-native-linear-gradient@^2.8.3",
            "react-native-skeleton-placeholder@^5.2.4",
            "react-native-paper@^5.15.0",
            "@tanstack/react-query@^5.90.21",
            "axios@^1.13.6",
            "react-i18next",
            "i18next",
            "react-native-config",
            "babel-plugin-module-resolver@^5.0.0",
            "react-native-worklets@^0.8.1",
            "@gorhom/bottom-sheet@^5",
            "react-native-reanimated@^4.3.0",
        ].join(" ");
        if (shelljs_1.default.exec(`yarn add ${deps}`).code !== 0) {
            console.error(chalk_1.default.red("Failed to install dependencies"));
        }
        else {
            console.log(chalk_1.default.green("Dependencies installed"));
        }
    }
    const templateDir = path_1.default.resolve(__dirname, "../template");
    copyTemplateDir(templateDir, targetDir, {
        appDisplayName,
        projectName,
        folderName,
        bundleId,
    });
    // Update configurations
    const babelPath = path_1.default.join(targetDir, "babel.config.js");
    if (fs_extra_1.default.existsSync(babelPath)) {
        let babelStr = fs_extra_1.default.readFileSync(babelPath, "utf8");
        babelStr = babelStr.replace("module.exports = {", `module.exports = {
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@api': './src/api',
          '@assets': './src/assets',
          '@constants': './src/constants',
          '@components': './src/components',
          '@hooks': './src/hooks',
          '@modules': './src/modules',
          '@navigation': './src/navigation',
          '@i18n': './src/i18n',
          '@theme': './src/theme',
          '@types': './src/types',
        },
      },
    ],
		'react-native-worklets/plugin',
  ],`);
        fs_extra_1.default.writeFileSync(babelPath, babelStr);
    }
    const pkgPath = path_1.default.join(targetDir, "package.json");
    if (fs_extra_1.default.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs_extra_1.default.readFileSync(pkgPath, "utf8"));
        pkg.name = folderName;
        pkg.scripts = pkg.scripts || {};
        pkg.scripts["env:dev"] = "node scripts/apply-env.js development";
        pkg.scripts["env:prod"] = "node scripts/apply-env.js production";
        fs_extra_1.default.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    }
    const appJsonPath = path_1.default.join(targetDir, "app.json");
    if (fs_extra_1.default.existsSync(appJsonPath)) {
        const appJson = JSON.parse(fs_extra_1.default.readFileSync(appJsonPath, "utf8"));
        appJson.name = projectName;
        appJson.displayName = appDisplayName;
        fs_extra_1.default.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
    }
    // 6. ENV FILES
    const gitIgnorePath = path_1.default.join(targetDir, ".gitignore");
    if (fs_extra_1.default.existsSync(gitIgnorePath)) {
        fs_extra_1.default.appendFileSync(gitIgnorePath, "\n# dotEnv files\n.env*\n");
    }
    // Phase 3 Native Config Applied inline
    // --- PHASE 3: NATIVE ENVIRONMENTS (FLAVORS & SCHEMES) ---
    console.log(chalk_1.default.cyan("\nConfiguring Native Environments..."));
    const devSource = path_1.default.join(__dirname, "../src/assets/app-icon/ios/development/AppIcon~ios-marketing.png");
    const prodSource = path_1.default.join(__dirname, "../src/assets/app-icon/ios/production/AppIcon~ios-marketing.png");
    const targetIconsFolderDev = path_1.default.join(targetDir, "src/assets/app-icon/development");
    const targetIconsFolderProd = path_1.default.join(targetDir, "src/assets/app-icon/production");
    if (fs_extra_1.default.existsSync(devSource)) {
        fs_extra_1.default.mkdirSync(targetIconsFolderDev, { recursive: true });
        fs_extra_1.default.copyFileSync(devSource, path_1.default.join(targetIconsFolderDev, "app-icon.png"));
    }
    if (fs_extra_1.default.existsSync(prodSource)) {
        fs_extra_1.default.mkdirSync(targetIconsFolderProd, { recursive: true });
        fs_extra_1.default.copyFileSync(prodSource, path_1.default.join(targetIconsFolderProd, "app-icon.png"));
    }
    // Copy font files
    const cliFontsSource = path_1.default.join(__dirname, "../src/assets/fonts");
    const targetFontsDir = path_1.default.join(targetDir, "src/assets/fonts");
    if (fs_extra_1.default.existsSync(cliFontsSource)) {
        fs_extra_1.default.cpSync(cliFontsSource, targetFontsDir, { recursive: true });
        console.log(chalk_1.default.green("Font files copied successfully"));
    }
    else {
        console.warn(chalk_1.default.yellow("Font source directory not found at " + cliFontsSource));
    }
    // 1. Android productFlavors
    const rootAndroidBuildGradlePath = path_1.default.join(targetDir, "android/build.gradle");
    if (fs_extra_1.default.existsSync(rootAndroidBuildGradlePath)) {
        let rootGradle = fs_extra_1.default.readFileSync(rootAndroidBuildGradlePath, "utf8");
        rootGradle = rootGradle.replace(/compileSdkVersion\s*=\s*\d+/g, "compileSdkVersion = 36");
        rootGradle = rootGradle.replace(/compileSdk\s*=\s*\d+/g, "compileSdk = 36");
        fs_extra_1.default.writeFileSync(rootAndroidBuildGradlePath, rootGradle);
    }
    const androidBuildGradlePath = path_1.default.join(targetDir, "android/app/build.gradle");
    if (fs_extra_1.default.existsSync(androidBuildGradlePath)) {
        let gradle = fs_extra_1.default.readFileSync(androidBuildGradlePath, "utf8");
        // Inject react-native-config map
        const extBlock = `
    project.ext.envConfigFiles = [
      devAppDebug: ".env.development",
      devAppRelease: ".env.development",
      appDebug: ".env.production",
      appRelease: ".env.production",
    ]
    project.ext.defaultEnvFile = ".env.development" 

    apply from: project(":react-native-config").projectDir.getPath() + "/dotenv.gradle"
    `;
        gradle = gradle.replace('apply plugin: "com.android.application"', 'apply plugin: "com.android.application"\n' + extBlock);
        // Inject flavorDimensions
        if (!gradle.includes("flavorDimensions")) {
            gradle = gradle.replace(/defaultConfig\s*\{([\s\S]*?)\}/, (match, content) => {
                if (content.includes("build_config_package"))
                    return match;
                return `defaultConfig {${content.trim()}
            resValue "string", "build_config_package", "${bundleId}"
          }`;
            });
            gradle = gradle.replace(/defaultConfig\s*\{[\s\S]*?\}/, (match) => {
                return `${match}
        flavorDimensions "env"
        productFlavors {
            app {
                dimension "env"
                applicationIdSuffix ""
                resValue "string", "app_name", "${appDisplayName}"
                resValue "string", "build_config_package", "${bundleId}"
            }
            devApp {
                dimension "env"
                applicationIdSuffix ".dev"
                resValue "string", "app_name", "[DEV] ${appDisplayName}"
                resValue "string", "build_config_package", "${bundleId}"
            }
        }`;
            });
        }
        if (!gradle.includes("debuggableVariants")) {
            gradle = gradle.replace("autolinkLibrariesWithApp()", 'debuggableVariants = ["devAppDebug", "appDebug"]\n\n    autolinkLibrariesWithApp()');
        }
        fs_extra_1.default.writeFileSync(androidBuildGradlePath, gradle);
    }
    // 2. Android Folder Copies
    const cliIconsAndroidDev = path_1.default.join(__dirname, "../src/assets/app-icon/android/development/res");
    const cliIconsAndroidProd = path_1.default.join(__dirname, "../src/assets/app-icon/android/production/res");
    const targetAndroidDev = path_1.default.join(targetDir, "android/app/src/devApp/res");
    const targetAndroidProd = path_1.default.join(targetDir, "android/app/src/app/res");
    if (fs_extra_1.default.existsSync(cliIconsAndroidDev)) {
        fs_extra_1.default.cpSync(cliIconsAndroidDev, targetAndroidDev, { recursive: true });
    }
    if (fs_extra_1.default.existsSync(cliIconsAndroidProd)) {
        fs_extra_1.default.cpSync(cliIconsAndroidProd, targetAndroidProd, { recursive: true });
    }
    // 3. iOS Schemes
    const iosProjectName = projectName;
    const xcschemesPath = path_1.default.join(targetDir, "ios", iosProjectName + ".xcodeproj", "xcshareddata", "xcschemes");
    const defaultSchemePath = path_1.default.join(xcschemesPath, iosProjectName + ".xcscheme");
    if (fs_extra_1.default.existsSync(defaultSchemePath)) {
        const originalScheme = fs_extra_1.default.readFileSync(defaultSchemePath, "utf8");
        const devScriptText = `PROJECT_ROOT=$(dirname &quot;$WORKSPACE_PATH&quot;)&#10;echo &quot;.env.development&quot; &gt; /tmp/envfile&#10;cp &quot;$PROJECT_ROOT/${iosProjectName}/Info-Dev.plist&quot; &quot;$PROJECT_ROOT/${iosProjectName}/Info.plist&quot;&#10;rm -rf &quot;$PROJECT_ROOT/${iosProjectName}/Images.xcassets/AppIcon.appiconset&quot;&#10;cp -R &quot;$PROJECT_ROOT/${iosProjectName}/Images.xcassets/AppIconDev.appiconset&quot; &quot;$PROJECT_ROOT/${iosProjectName}/Images.xcassets/AppIcon.appiconset&quot;`;
        const prodScriptText = `PROJECT_ROOT=$(dirname &quot;$WORKSPACE_PATH&quot;)&#10;echo &quot;.env.production&quot; &gt; /tmp/envfile&#10;cp &quot;$PROJECT_ROOT/${iosProjectName}/Info-Prod.plist&quot; &quot;$PROJECT_ROOT/${iosProjectName}/Info.plist&quot;&#10;rm -rf &quot;$PROJECT_ROOT/${iosProjectName}/Images.xcassets/AppIcon.appiconset&quot;&#10;cp -R &quot;$PROJECT_ROOT/${iosProjectName}/Images.xcassets/AppIconProd.appiconset&quot; &quot;$PROJECT_ROOT/${iosProjectName}/Images.xcassets/AppIcon.appiconset&quot;`;
        // Pre-action Dev
        const preActionDev = `
      <PreActions>
         <ExecutionAction
            ActionType = "Xcode.IDEStandardExecutionActionsCore.ExecutionActionType.ShellScriptAction">
            <ActionContent
               title = "Run Script"
               scriptText = "${devScriptText}">
            </ActionContent>
         </ExecutionAction>
      </PreActions>`;
        // Pre-action Prod
        const preActionProd = `
      <PreActions>
         <ExecutionAction
            ActionType = "Xcode.IDEStandardExecutionActionsCore.ExecutionActionType.ShellScriptAction">
            <ActionContent
               title = "Run Script"
               scriptText = "${prodScriptText}">
            </ActionContent>
         </ExecutionAction>
      </PreActions>`;
        const devScheme = originalScheme.replace(/<BuildAction[^>]*>/, (match) => match + preActionDev);
        const prodScheme = originalScheme.replace(/<BuildAction[^>]*>/, (match) => match + preActionProd);
        fs_extra_1.default.writeFileSync(path_1.default.join(xcschemesPath, "Dev App.xcscheme"), devScheme);
        fs_extra_1.default.writeFileSync(path_1.default.join(xcschemesPath, "App.xcscheme"), prodScheme);
        fs_extra_1.default.unlinkSync(defaultSchemePath);
    }
    // 4. iOS project.pbxproj patching
    const pbxprojPath = path_1.default.join(targetDir, "ios", iosProjectName + ".xcodeproj", "project.pbxproj");
    if (fs_extra_1.default.existsSync(pbxprojPath)) {
        let pbx = fs_extra_1.default.readFileSync(pbxprojPath, "utf8");
        // Set default bundle ID on level pbxproj using literal string
        pbx = pbx.replace(/PRODUCT_BUNDLE_IDENTIFIER\s*=\s*.*?;/g, `PRODUCT_BUNDLE_IDENTIFIER = "${bundleId}";`);
        fs_extra_1.default.writeFileSync(pbxprojPath, pbx);
    }
    // 5. Update iOS Info.plist for App Name & Bundle ID (Generate Dev & Prod)
    console.log(chalk_1.default.cyan("\nGenerating Info.plist for Dev and Prod..."));
    const infoPlistPath = path_1.default.join(targetDir, "ios", iosProjectName, "Info.plist");
    const infoDevPlistPath = path_1.default.join(targetDir, "ios", iosProjectName, "Info-Dev.plist");
    const infoProdPlistPath = path_1.default.join(targetDir, "ios", iosProjectName, "Info-Prod.plist");
    if (fs_extra_1.default.existsSync(infoPlistPath)) {
        console.log(chalk_1.default.green("Base Info.plist found! Injecting environment setups..."));
        let basePlist = fs_extra_1.default.readFileSync(infoPlistPath, "utf8");
        // Inject UIAppFonts
        const fontsInjection = `	<key>UIAppFonts</key>\n\t<array>\n\t\t<string>MaterialDesignIcons.ttf</string>\n\t</array>\n`;
        if (!basePlist.includes("UIAppFonts")) {
            basePlist = basePlist.replace("<dict>", `<dict>\n${fontsInjection}`);
        }
        // Helper: Function to replace values, or create new ones if tags don't exist
        const setPlistValue = (plistStr, key, value) => {
            const regex = new RegExp(`<key>${key}</key>\\s*<string>.*?</string>`);
            if (regex.test(plistStr)) {
                return plistStr.replace(regex, `<key>${key}</key>\n\t<string>${value}</string>`);
            }
            else {
                // If not found, inject right below the first <dict>
                return plistStr.replace("<dict>", `<dict>\n\t<key>${key}</key>\n\t<string>${value}</string>`);
            }
        };
        // --- CREATE INFO-PROD.PLIST ---
        let prodPlist = setPlistValue(basePlist, "CFBundleDisplayName", appDisplayName);
        prodPlist = setPlistValue(prodPlist, "CFBundleIdentifier", bundleId);
        fs_extra_1.default.writeFileSync(infoProdPlistPath, prodPlist);
        console.log(chalk_1.default.green(" -> Info-Prod.plist successfully created"));
        // --- CREATE INFO-DEV.PLIST ---
        let devPlist = setPlistValue(basePlist, "CFBundleDisplayName", `[DEV] ${appDisplayName}`);
        devPlist = setPlistValue(devPlist, "CFBundleIdentifier", `${bundleId}.dev`);
        fs_extra_1.default.writeFileSync(infoDevPlistPath, devPlist);
        console.log(chalk_1.default.green(" -> Info-Dev.plist successfully created"));
        // Set the main Info.plist to the default Production version.
        fs_extra_1.default.writeFileSync(infoPlistPath, prodPlist);
    }
    else {
        // If the path is wrong, the script will shout in the terminal!
        console.error(chalk_1.default.red(`\nWARNING: Info.plist NOT FOUND at path: ${infoPlistPath}`));
        console.error(chalk_1.default.yellow("Make sure the iOS folder name matches the projectName."));
    }
    // (ENV organically generated natively mapping AppIcon and BundleId above)
    // 6. iOS Folder Copies
    console.log(chalk_1.default.cyan("Setting up iOS App Icons (Dev & Prod Masters)..."));
    const cliIconsIosDev = path_1.default.join(__dirname, "../src/assets/app-icon/ios/development");
    const cliIconsIosProd = path_1.default.join(__dirname, "../src/assets/app-icon/ios/production");
    // Target folder in iOS project
    const targetIosDev = path_1.default.join(targetDir, "ios", iosProjectName, "Images.xcassets", "AppIconDev.appiconset");
    const targetIosProdMaster = path_1.default.join(targetDir, "ios", iosProjectName, "Images.xcassets", "AppIconProd.appiconset");
    const targetIosDefault = path_1.default.join(targetDir, "ios", iosProjectName, "Images.xcassets", "AppIcon.appiconset");
    if (fs_extra_1.default.existsSync(cliIconsIosDev)) {
        fs_extra_1.default.cpSync(cliIconsIosDev, targetIosDev, { recursive: true });
    }
    if (fs_extra_1.default.existsSync(cliIconsIosProd)) {
        // Create Prod Storage
        fs_extra_1.default.cpSync(cliIconsIosProd, targetIosProdMaster, { recursive: true });
        // Set the initial AppIcon using the Prod version
        fs_extra_1.default.cpSync(cliIconsIosProd, targetIosDefault, { recursive: true });
    }
    // 7. Adjust package.json scripts
    const pkgJsonPath = path_1.default.join(targetDir, "package.json");
    if (fs_extra_1.default.existsSync(pkgJsonPath)) {
        const pkg = JSON.parse(fs_extra_1.default.readFileSync(pkgJsonPath, "utf8"));
        delete pkg.scripts["env:dev"];
        delete pkg.scripts["env:prod"];
        pkg.scripts["android:dev"] =
            `react-native run-android --mode=devAppDebug --appId=${bundleId}.dev`;
        pkg.scripts["android:prod"] =
            `react-native run-android --mode=appDebug --appId=${bundleId}`;
        pkg.scripts["ios:dev"] = 'react-native run-ios --scheme "Dev App"';
        pkg.scripts["ios:prod"] = 'react-native run-ios --scheme "App"';
        fs_extra_1.default.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2));
    }
    const tsConfigPath = path_1.default.join(targetDir, "tsconfig.json");
    if (fs_extra_1.default.existsSync(tsConfigPath)) {
        const tsConfigObj = {
            extends: "@react-native/typescript-config",
            compilerOptions: {
                jsx: "react-native",
                baseUrl: ".",
                esModuleInterop: true,
                strict: true,
                strictFunctionTypes: true,
                types: ["jest"],
                paths: {
                    "@api": ["src/api"],
                    "@api/*": ["src/api/*"],
                    "@assets": ["src/assets"],
                    "@assets/*": ["src/assets/*"],
                    "@constants": ["src/constants"],
                    "@constants/*": ["src/constants/*"],
                    "@components": ["src/components"],
                    "@components/*": ["src/components/*"],
                    "@hooks": ["src/hooks"],
                    "@hooks/*": ["src/hooks/*"],
                    "@modules": ["src/modules"],
                    "@modules/*": ["src/modules/*"],
                    "@navigation": ["src/navigation"],
                    "@navigation/*": ["src/navigation/*"],
                    "@i18n": ["src/i18n"],
                    "@i18n/*": ["src/i18n/*"],
                    "@theme": ["src/theme"],
                    "@theme/*": ["src/theme/*"],
                    "@types": ["src/types"],
                    "@types/*": ["src/types/*"],
                },
            },
            include: ["**/*.ts", "**/*.tsx"],
            exclude: ["**/node_modules", "**/Pods"],
        };
        fs_extra_1.default.writeFileSync(tsConfigPath, JSON.stringify(tsConfigObj, null, 2));
    }
    // --- PHASE 4: SPLASH SCREEN ---
    console.log(chalk_1.default.cyan("\nConfiguring Splash Screen..."));
    const splashSource = path_1.default.join(__dirname, "../src/assets/app-icon/ios/production/AppIcon~ios-marketing.png");
    const targetAppIconPath = path_1.default.join(targetDir, "src/assets/icons/production/app_icon.png");
    const targetSplashPath = path_1.default.join(targetDir, "src/assets/images/splash.png");
    if (fs_extra_1.default.existsSync(splashSource)) {
        // Ensure production app icon exists as a 512x512 fallback
        fs_extra_1.default.mkdirSync(path_1.default.dirname(targetAppIconPath), { recursive: true });
        await (0, sharp_1.default)(splashSource)
            .resize(512, 512, { fit: "inside" })
            .toFile(targetAppIconPath);
        // Copy to splash.png base
        fs_extra_1.default.mkdirSync(path_1.default.dirname(targetSplashPath), { recursive: true });
        fs_extra_1.default.copyFileSync(splashSource, targetSplashPath);
        // Generate Android densities using sharp
        const densities = [
            { name: "drawable-mdpi", size: 320 },
            { name: "drawable-hdpi", size: 480 },
            { name: "drawable-xhdpi", size: 720 },
            { name: "drawable-xxhdpi", size: 960 },
            { name: "drawable-xxxhdpi", size: 1280 },
        ];
        for (const d of densities) {
            const dirPath = path_1.default.join(targetDir, "android/app/src/main/res", d.name);
            fs_extra_1.default.mkdirSync(dirPath, { recursive: true });
            await (0, sharp_1.default)(targetSplashPath)
                .resize(d.size, d.size, { fit: "inside" })
                .toFile(path_1.default.join(dirPath, "splash.png"));
        }
    }
    else {
        console.warn("Source splash icon not found at " + splashSource);
    }
    // Android launch_screen.xml
    const launchScreenXml = `<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@android:color/white">

    <ImageView
        android:layout_width="120dp"
        android:layout_height="120dp"
        android:layout_centerInParent="true"
        android:src="@drawable/splash"
        android:scaleType="centerInside" />
</RelativeLayout>`;
    const layoutDir = path_1.default.join(targetDir, "android/app/src/main/res/layout");
    fs_extra_1.default.mkdirSync(layoutDir, { recursive: true });
    fs_extra_1.default.writeFileSync(path_1.default.join(layoutDir, "launch_screen.xml"), launchScreenXml);
    // iOS Splash.imageset
    if (fs_extra_1.default.existsSync(splashSource)) {
        const splashImagesetDir = path_1.default.join(targetDir, "ios", iosProjectName, "Images.xcassets", "Splash.imageset");
        fs_extra_1.default.mkdirSync(splashImagesetDir, { recursive: true });
        const contentsJson = {
            images: [
                { idiom: "universal", filename: "splash.png", scale: "1x" },
                { idiom: "universal", filename: "splash@2x.png", scale: "2x" },
                { idiom: "universal", filename: "splash@3x.png", scale: "3x" },
            ],
            info: { author: "xcode", version: 1 },
        };
        fs_extra_1.default.writeFileSync(path_1.default.join(splashImagesetDir, "Contents.json"), JSON.stringify(contentsJson, null, 2));
        await (0, sharp_1.default)(splashSource)
            .resize(120, 120, { fit: "inside" })
            .toFile(path_1.default.join(splashImagesetDir, "splash.png"));
        await (0, sharp_1.default)(splashSource)
            .resize(240, 240, { fit: "inside" })
            .toFile(path_1.default.join(splashImagesetDir, "splash@2x.png"));
        await (0, sharp_1.default)(splashSource)
            .resize(360, 360, { fit: "inside" })
            .toFile(path_1.default.join(splashImagesetDir, "splash@3x.png"));
    }
    // iOS LaunchScreen.storyboard
    const launchScreenFiles = require("glob").sync(targetDir + "/ios/**/LaunchScreen.storyboard");
    if (launchScreenFiles.length > 0) {
        const storyboardContent = `<?xml version="1.0" encoding="UTF-8"?>
<document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" version="3.0" toolsVersion="21507" targetRuntime="iOS.CocoaTouch" propertyAccessControl="none" useAutolayout="YES" launchScreen="YES" useTraitCollections="YES" useSafeAreas="YES" colorMatched="YES" initialViewController="01J-lp-oVM">
    <device id="retina4_7" orientation="portrait" appearance="light"/>
    <dependencies>
        <deployment identifier="iOS"/>
        <plugIn identifier="com.apple.InterfaceBuilder.IBCocoaTouchPlugin" version="21505"/>
        <capability name="Safe area layout guides" minToolsVersion="9.0"/>
        <capability name="System colors in document resources" minToolsVersion="11.0"/>
        <capability name="documents saved in the Xcode 8 format" minToolsVersion="8.0"/>
    </dependencies>
    <scenes>
        <!--View Controller-->
        <scene sceneID="EHf-IW-A2E">
            <objects>
                <viewController id="01J-lp-oVM" sceneMemberID="viewController">
                    <view key="view" contentMode="scaleToFill" id="Ze5-6b-2t3">
                        <rect key="frame" x="0.0" y="0.0" width="375" height="667"/>
                        <autoresizingMask key="autoresizingMask" widthSizable="YES" heightSizable="YES"/>
                        <subviews>
                            <imageView clipsSubviews="YES" userInteractionEnabled="NO" contentMode="scaleAspectFit" horizontalHuggingPriority="251" verticalHuggingPriority="251" image="Splash" translatesAutoresizingMaskIntoConstraints="NO" id="abc-12-xyz">
                                <rect key="frame" x="127.5" y="273.5" width="120" height="120"/>
                                <constraints>
                                    <constraint firstAttribute="width" constant="120" id="123-ab-cde"/>
                                    <constraint firstAttribute="height" constant="120" id="456-df-ghi"/>
                                </constraints>
                            </imageView>
                        </subviews>
                        <viewLayoutGuide key="safeArea" id="Bcu-3y-fUS"/>
                        <color key="backgroundColor" systemColor="systemBackgroundColor"/>
                        <constraints>
                            <constraint firstItem="abc-12-xyz" firstAttribute="centerX" secondItem="Ze5-6b-2t3" secondAttribute="centerX" id="789-jk-lmn"/>
                            <constraint firstItem="abc-12-xyz" firstAttribute="centerY" secondItem="Ze5-6b-2t3" secondAttribute="centerY" id="012-op-qrs"/>
                        </constraints>
                    </view>
                </viewController>
                <placeholder placeholderIdentifier="IBFirstResponder" id="iYj-Kq-Ea1" userLabel="First Responder" sceneMemberID="firstResponder"/>
            </objects>
            <point key="canvasLocation" x="52.173913043478265" y="375"/>
        </scene>
    </scenes>
    <resources>
        <image name="Splash" width="120" height="120"/>
        <systemColor name="systemBackgroundColor">
            <color white="1" alpha="1" colorSpace="custom" customColorSpace="genericGamma22GrayColorSpace"/>
        </systemColor>
    </resources>
</document>`;
        fs_extra_1.default.writeFileSync(launchScreenFiles[0], storyboardContent);
    }
    // Android MainActivity.kt
    const glob = require("glob");
    const mainActivityPaths = glob.sync(targetDir + "/android/app/src/main/java/**/MainActivity.kt");
    if (mainActivityPaths.length > 0) {
        let ma = fs_extra_1.default.readFileSync(mainActivityPaths[0], "utf8");
        if (!ma.includes("SplashView")) {
            ma = ma.replace("import com.facebook.react.ReactActivity", "import com.facebook.react.ReactActivity\nimport android.os.Bundle\nimport com.splashview.SplashView");
            ma = ma.replace("class MainActivity : ReactActivity() {", "class MainActivity : ReactActivity() {\n\n  override fun onCreate(savedInstanceState: Bundle?) {\n    SplashView.showSplashView(this)\n    super.onCreate(null)\n  }");
            fs_extra_1.default.writeFileSync(mainActivityPaths[0], ma);
        }
    }
    // iOS AppDelegate.mm
    const appDelegatePath = path_1.default.join(targetDir, "ios", iosProjectName, "AppDelegate.mm");
    if (fs_extra_1.default.existsSync(appDelegatePath)) {
        let ad = fs_extra_1.default.readFileSync(appDelegatePath, "utf8");
        const objcSplashFunc = `
- (void)showSplashScreen {
  Class splashClass = NSClassFromString(@"SplashView");
  if (splashClass) {
    id splashInstance = [splashClass performSelector:NSSelectorFromString(@"sharedInstance")];
    if (splashInstance) {
      [splashInstance performSelector:NSSelectorFromString(@"showSplash")];
    }
  }
}
`;
        if (!ad.includes("showSplashScreen")) {
            ad = ad.replace("@implementation AppDelegate", "@implementation AppDelegate\n" + objcSplashFunc);
            ad = ad.replace("return [super application:application didFinishLaunchingWithOptions:launchOptions];", "  [self showSplashScreen];\n  return [super application:application didFinishLaunchingWithOptions:launchOptions];");
            fs_extra_1.default.writeFileSync(appDelegatePath, ad);
        }
    }
    // React SplashScreen
    const commonDir = path_1.default.join(targetDir, "src/modules/common");
    const commonScreenDir = path_1.default.join(commonDir, "screens");
    const commonComponentsDir = path_1.default.join(commonDir, "components");
    const splashDir = path_1.default.join(commonScreenDir, "splash");
    fs_extra_1.default.mkdirSync(splashDir, { recursive: true });
    fs_extra_1.default.mkdirSync(commonComponentsDir, { recursive: true });
    const useSplashScreenTsx = `import { useNavigate } from '@hooks/navigation-hooks';
import { useCallback, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const useSplashScreen = () => {
  const { resetNavigate } = useNavigate();
  const { top } = useSafeAreaInsets();

  const checkIsUserLoggedIn = useCallback(() => {
    setTimeout(() => {
      resetNavigate('Main', { screen: 'HomeScreen' });
    }, 1000);
  }, [resetNavigate]);

  useEffect(() => {
    checkIsUserLoggedIn();
  }, [checkIsUserLoggedIn]);

  return { top };
};

export { useSplashScreen };
`;
    const splashStylesTs = `import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  image: {
    width: 120,
    height: 120,
  }
});
`;
    const splashScreenTsxCode = `import React from 'react';
import { View, Image } from 'react-native';
import { useSplashScreen } from './useSplashScreen';
import { styles } from './styles';

export const SplashScreen: React.FC = () => {
  const { top } = useSplashScreen();

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <Image 
        source={require('@assets/images/splash.png')} 
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};
`;
    fs_extra_1.default.writeFileSync(path_1.default.join(splashDir, "useSplashScreen.ts"), useSplashScreenTsx);
    fs_extra_1.default.writeFileSync(path_1.default.join(splashDir, "styles.ts"), splashStylesTs);
    fs_extra_1.default.writeFileSync(path_1.default.join(splashDir, "SplashScreen.tsx"), splashScreenTsxCode);
    fs_extra_1.default.writeFileSync(path_1.default.join(splashDir, "index.ts"), "export * from './SplashScreen';\n");
    fs_extra_1.default.writeFileSync(path_1.default.join(commonScreenDir, "index.ts"), "export * from './splash';\n");
    fs_extra_1.default.writeFileSync(path_1.default.join(commonComponentsDir, "index.ts"), "");
    fs_extra_1.default.writeFileSync(path_1.default.join(commonDir, "index.ts"), "export * from './screens';\nexport * from './components';\n");
    fs_extra_1.default.appendFileSync(path_1.default.join(targetDir, "src/modules/index.ts"), "export * from './common';\n");
    console.log(chalk_1.default.cyan("\\nInstalling Pods..."));
    try {
        shelljs_1.default.cd(targetDir);
        shelljs_1.default.exec("yarn install && cd ios && rm -rf Podfile.lock Pods && pod install && cd ..");
    }
    catch (error) {
        console.warn(chalk_1.default.yellow("\\nWarning: Failed to install iOS pods. You may need to run pod install manually."));
    }
    console.log(chalk_1.default.cyan("Linking fonts with react-native-asset..."));
    if (shelljs_1.default.exec("npx react-native-asset").code !== 0) {
        console.warn(chalk_1.default.yellow("react-native-asset linking failed. Run 'npx react-native-asset' manually."));
    }
    else {
        console.log(chalk_1.default.green("Fonts linked successfully"));
    }
    console.log(chalk_1.default.green("Project setup complete!"));
    console.log(chalk_1.default.green(`\nSuccess! RNJet project created at ${targetDir}`));
    console.log(chalk_1.default.cyan("\nTo get started:"));
    console.log(chalk_1.default.white(`  cd ${folderName}`));
    console.log(chalk_1.default.white("  make menu (to choose option)\n"));
}
function copyTemplateDir(src, dest, vars) {
    const entries = fs_extra_1.default.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path_1.default.join(src, entry.name);
        if (entry.isDirectory()) {
            fs_extra_1.default.mkdirpSync(path_1.default.join(dest, entry.name));
            copyTemplateDir(srcPath, path_1.default.join(dest, entry.name), vars);
        }
        else if (entry.name.endsWith(".template")) {
            const destName = entry.name.replace(".template", "");
            const fileContent = fs_extra_1.default.readFileSync(srcPath, "utf8");
            fs_extra_1.default.writeFileSync(path_1.default.join(dest, destName), interpolate(fileContent, vars));
        }
        else {
            fs_extra_1.default.copyFileSync(srcPath, path_1.default.join(dest, entry.name));
        }
    }
}
function interpolate(content, vars) {
    return content.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}
