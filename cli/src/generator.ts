import fs from "fs-extra";
import path from "path";
import shell from "shelljs";
import chalk from "chalk";
import sharp from "sharp";

export async function generateProject(answers: any) {
	const { appDisplayName, projectName, folderName, bundleId, installDeps } =
		answers;
	const targetDir = path.resolve(process.cwd(), folderName);

	// 1. Create folder
	fs.mkdirpSync(targetDir);

	// 2. Run React Native CLI inside it
	console.log(chalk.cyan("Generating base React Native project..."));
	shell.cd(targetDir);

	// Using the exact required command but adapted for RN 0.84.1 deprecations
	const initCmd = `npx --yes @react-native-community/cli@latest init ${projectName} --version 0.84.1 --skip-install`;

	if (shell.exec(initCmd).code !== 0) {
		console.error(
			chalk.red(
				"Failed to initialize React Native project. See above logs for details.",
			),
		);
		process.exit(1);
	}
	console.log(chalk.green("React Native project initialized"));

	// Move nested generated project to root of targetDir
	const nestedDir = path.join(targetDir, projectName);
	if (fs.existsSync(nestedDir)) {
		fs.copySync(nestedDir, targetDir);
		fs.removeSync(nestedDir);
	}

	// 3. Rename project
	console.log(chalk.cyan("Renaming bundle identifier..."));
	const renameCmd = `npx --yes react-native-rename "${projectName}" -b ${bundleId}`;
	if (shell.exec(renameCmd).code !== 0) {
		console.warn(
			chalk.yellow(
				"react-native-rename could not be completed cleanly. Continuing...",
			),
		);
	} else {
		console.log(chalk.green("Project renamed successfully"));
	}

	// 4. Install dependencies
	if (installDeps) {
		console.log(chalk.cyan("Installing boilerplate dependencies..."));
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

		if (shell.exec(`yarn add ${deps}`).code !== 0) {
			console.error(chalk.red("Failed to install dependencies"));
		} else {
			console.log(chalk.green("Dependencies installed"));
		}
	}

	const templateDir = path.resolve(__dirname, "../template");
	copyTemplateDir(templateDir, targetDir, {
		appDisplayName,
		projectName,
		folderName,
		bundleId,
	});

	// Update configurations
	const babelPath = path.join(targetDir, "babel.config.js");
	if (fs.existsSync(babelPath)) {
		let babelStr = fs.readFileSync(babelPath, "utf8");
		babelStr = babelStr.replace(
			"module.exports = {",
			`module.exports = {
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
  ],`,
		);
		fs.writeFileSync(babelPath, babelStr);
	}

	const pkgPath = path.join(targetDir, "package.json");
	if (fs.existsSync(pkgPath)) {
		const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
		pkg.name = folderName;
		pkg.scripts = pkg.scripts || {};
		pkg.scripts["env:dev"] = "node scripts/apply-env.js development";
		pkg.scripts["env:prod"] = "node scripts/apply-env.js production";
		fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
	}

	const appJsonPath = path.join(targetDir, "app.json");
	if (fs.existsSync(appJsonPath)) {
		const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
		appJson.name = projectName;
		appJson.displayName = appDisplayName;
		fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
	}

	// 6. ENV FILES

	const gitIgnorePath = path.join(targetDir, ".gitignore");
	if (fs.existsSync(gitIgnorePath)) {
		fs.appendFileSync(gitIgnorePath, "\n# dotEnv files\n.env*\n");
	}

	// Phase 3 Native Config Applied inline

	// --- PHASE 3: NATIVE ENVIRONMENTS (FLAVORS & SCHEMES) ---
	console.log(chalk.cyan("\nConfiguring Native Environments..."));

	const devSource = path.join(
		__dirname,
		"../src/assets/app-icon/ios/development/AppIcon~ios-marketing.png",
	);
	const prodSource = path.join(
		__dirname,
		"../src/assets/app-icon/ios/production/AppIcon~ios-marketing.png",
	);
	const targetIconsFolderDev = path.join(
		targetDir,
		"src/assets/app-icon/development",
	);
	const targetIconsFolderProd = path.join(
		targetDir,
		"src/assets/app-icon/production",
	);

	if (fs.existsSync(devSource)) {
		fs.mkdirSync(targetIconsFolderDev, { recursive: true });
		fs.copyFileSync(devSource, path.join(targetIconsFolderDev, "app-icon.png"));
	}
	if (fs.existsSync(prodSource)) {
		fs.mkdirSync(targetIconsFolderProd, { recursive: true });
		fs.copyFileSync(prodSource, path.join(targetIconsFolderProd, "app-icon.png"));
	}

	// Copy font files
	const cliFontsSource = path.join(__dirname, "../src/assets/fonts");
	const targetFontsDir = path.join(targetDir, "src/assets/fonts");

	if (fs.existsSync(cliFontsSource)) {
		fs.cpSync(cliFontsSource, targetFontsDir, { recursive: true });
		console.log(chalk.green("Font files copied successfully"));
	} else {
		console.warn(
			chalk.yellow("Font source directory not found at " + cliFontsSource),
		);
	}

	// 1. Android productFlavors
	const rootAndroidBuildGradlePath = path.join(
		targetDir,
		"android/build.gradle",
	);
	if (fs.existsSync(rootAndroidBuildGradlePath)) {
		let rootGradle = fs.readFileSync(rootAndroidBuildGradlePath, "utf8");
		rootGradle = rootGradle.replace(
			/compileSdkVersion\s*=\s*\d+/g,
			"compileSdkVersion = 36",
		);
		rootGradle = rootGradle.replace(/compileSdk\s*=\s*\d+/g, "compileSdk = 36");
		fs.writeFileSync(rootAndroidBuildGradlePath, rootGradle);
	}

	const androidBuildGradlePath = path.join(
		targetDir,
		"android/app/build.gradle",
	);
	if (fs.existsSync(androidBuildGradlePath)) {
		let gradle = fs.readFileSync(androidBuildGradlePath, "utf8");

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
		gradle = gradle.replace(
			'apply plugin: "com.android.application"',
			'apply plugin: "com.android.application"\n' + extBlock,
		);

		// Inject flavorDimensions
		if (!gradle.includes("flavorDimensions")) {
			gradle = gradle.replace(
				/defaultConfig\s*\{([\s\S]*?)\}/,
				(match, content) => {
					if (content.includes("build_config_package")) return match;
					return `defaultConfig {${content.trim()}
            resValue "string", "build_config_package", "${bundleId}"
          }`;
				},
			);

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
			gradle = gradle.replace(
				"autolinkLibrariesWithApp()",
				'debuggableVariants = ["devAppDebug", "appDebug"]\n\n    autolinkLibrariesWithApp()',
			);
		}
		fs.writeFileSync(androidBuildGradlePath, gradle);
	}

	// 2. Android Folder Copies
	const cliIconsAndroidDev = path.join(
		__dirname,
		"../src/assets/app-icon/android/development/res",
	);
	const cliIconsAndroidProd = path.join(
		__dirname,
		"../src/assets/app-icon/android/production/res",
	);
	const targetAndroidDev = path.join(targetDir, "android/app/src/devApp/res");
	const targetAndroidProd = path.join(targetDir, "android/app/src/app/res");

	if (fs.existsSync(cliIconsAndroidDev)) {
		fs.cpSync(cliIconsAndroidDev, targetAndroidDev, { recursive: true });
	}
	if (fs.existsSync(cliIconsAndroidProd)) {
		fs.cpSync(cliIconsAndroidProd, targetAndroidProd, { recursive: true });
	}

	// 3. iOS Schemes
	const iosProjectName = projectName;
	const xcschemesPath = path.join(
		targetDir,
		"ios",
		iosProjectName + ".xcodeproj",
		"xcshareddata",
		"xcschemes",
	);
	const defaultSchemePath = path.join(
		xcschemesPath,
		iosProjectName + ".xcscheme",
	);

	if (fs.existsSync(defaultSchemePath)) {
		const originalScheme = fs.readFileSync(defaultSchemePath, "utf8");

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

		const devScheme = originalScheme.replace(
			/<BuildAction[^>]*>/,
			(match) => match + preActionDev,
		);
		const prodScheme = originalScheme.replace(
			/<BuildAction[^>]*>/,
			(match) => match + preActionProd,
		);

		fs.writeFileSync(path.join(xcschemesPath, "Dev App.xcscheme"), devScheme);
		fs.writeFileSync(path.join(xcschemesPath, "App.xcscheme"), prodScheme);

		fs.unlinkSync(defaultSchemePath);
	}

	// 4. iOS project.pbxproj patching
	const pbxprojPath = path.join(
		targetDir,
		"ios",
		iosProjectName + ".xcodeproj",
		"project.pbxproj",
	);
	if (fs.existsSync(pbxprojPath)) {
		let pbx = fs.readFileSync(pbxprojPath, "utf8");

		// Set default bundle ID on level pbxproj using literal string
		pbx = pbx.replace(
			/PRODUCT_BUNDLE_IDENTIFIER\s*=\s*.*?;/g,
			`PRODUCT_BUNDLE_IDENTIFIER = "${bundleId}";`,
		);

		fs.writeFileSync(pbxprojPath, pbx);
	}

	// 5. Update iOS Info.plist for App Name & Bundle ID (Generate Dev & Prod)
	console.log(chalk.cyan("\nGenerating Info.plist for Dev and Prod..."));

	const infoPlistPath = path.join(
		targetDir,
		"ios",
		iosProjectName,
		"Info.plist",
	);
	const infoDevPlistPath = path.join(
		targetDir,
		"ios",
		iosProjectName,
		"Info-Dev.plist",
	);
	const infoProdPlistPath = path.join(
		targetDir,
		"ios",
		iosProjectName,
		"Info-Prod.plist",
	);

	if (fs.existsSync(infoPlistPath)) {
		console.log(
			chalk.green("Base Info.plist found! Injecting environment setups..."),
		);
		let basePlist = fs.readFileSync(infoPlistPath, "utf8");

		// Inject UIAppFonts
		const fontsInjection = `	<key>UIAppFonts</key>\n\t<array>\n\t\t<string>MaterialDesignIcons.ttf</string>\n\t</array>\n`;
		if (!basePlist.includes("UIAppFonts")) {
			basePlist = basePlist.replace("<dict>", `<dict>\n${fontsInjection}`);
		}

		// Helper: Function to replace values, or create new ones if tags don't exist
		const setPlistValue = (plistStr: string, key: string, value: string) => {
			const regex = new RegExp(`<key>${key}</key>\\s*<string>.*?</string>`);
			if (regex.test(plistStr)) {
				return plistStr.replace(
					regex,
					`<key>${key}</key>\n\t<string>${value}</string>`,
				);
			} else {
				// If not found, inject right below the first <dict>
				return plistStr.replace(
					"<dict>",
					`<dict>\n\t<key>${key}</key>\n\t<string>${value}</string>`,
				);
			}
		};

		// --- CREATE INFO-PROD.PLIST ---
		let prodPlist = setPlistValue(
			basePlist,
			"CFBundleDisplayName",
			appDisplayName,
		);
		prodPlist = setPlistValue(prodPlist, "CFBundleIdentifier", bundleId);
		fs.writeFileSync(infoProdPlistPath, prodPlist);
		console.log(chalk.green(" -> Info-Prod.plist successfully created"));

		// --- CREATE INFO-DEV.PLIST ---
		let devPlist = setPlistValue(
			basePlist,
			"CFBundleDisplayName",
			`[DEV] ${appDisplayName}`,
		);
		devPlist = setPlistValue(devPlist, "CFBundleIdentifier", `${bundleId}.dev`);
		fs.writeFileSync(infoDevPlistPath, devPlist);
		console.log(chalk.green(" -> Info-Dev.plist successfully created"));

		// Set the main Info.plist to the default Production version.
		fs.writeFileSync(infoPlistPath, prodPlist);
	} else {
		// If the path is wrong, the script will shout in the terminal!
		console.error(
			chalk.red(`\nWARNING: Info.plist NOT FOUND at path: ${infoPlistPath}`),
		);
		console.error(
			chalk.yellow("Make sure the iOS folder name matches the projectName."),
		);
	}

	// (ENV organically generated natively mapping AppIcon and BundleId above)

	// 6. iOS Folder Copies
	console.log(chalk.cyan("Setting up iOS App Icons (Dev & Prod Masters)..."));
	const cliIconsIosDev = path.join(
		__dirname,
		"../src/assets/app-icon/ios/development",
	);
	const cliIconsIosProd = path.join(
		__dirname,
		"../src/assets/app-icon/ios/production",
	);

	// Target folder in iOS project
	const targetIosDev = path.join(
		targetDir,
		"ios",
		iosProjectName,
		"Images.xcassets",
		"AppIconDev.appiconset",
	);
	const targetIosProdMaster = path.join(
		targetDir,
		"ios",
		iosProjectName,
		"Images.xcassets",
		"AppIconProd.appiconset",
	);
	const targetIosDefault = path.join(
		targetDir,
		"ios",
		iosProjectName,
		"Images.xcassets",
		"AppIcon.appiconset",
	);

	if (fs.existsSync(cliIconsIosDev)) {
		fs.cpSync(cliIconsIosDev, targetIosDev, { recursive: true });
	}

	if (fs.existsSync(cliIconsIosProd)) {
		// Create Prod Storage
		fs.cpSync(cliIconsIosProd, targetIosProdMaster, { recursive: true });
		// Set the initial AppIcon using the Prod version
		fs.cpSync(cliIconsIosProd, targetIosDefault, { recursive: true });
	}

	// 7. Adjust package.json scripts
	const pkgJsonPath = path.join(targetDir, "package.json");
	if (fs.existsSync(pkgJsonPath)) {
		const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
		delete pkg.scripts["env:dev"];
		delete pkg.scripts["env:prod"];
		pkg.scripts["android:dev"] =
			`react-native run-android --mode=devAppDebug --appId=${bundleId}.dev`;
		pkg.scripts["android:prod"] =
			`react-native run-android --mode=appDebug --appId=${bundleId}`;
		pkg.scripts["ios:dev"] = 'react-native run-ios --scheme "Dev App"';
		pkg.scripts["ios:prod"] = 'react-native run-ios --scheme "App"';
		fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2));
	}

	const tsConfigPath = path.join(targetDir, "tsconfig.json");
	if (fs.existsSync(tsConfigPath)) {
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
		fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfigObj, null, 2));
	}

	// --- PHASE 4: SPLASH SCREEN ---
	console.log(chalk.cyan("\nConfiguring Splash Screen..."));

	const splashSource = path.join(
		__dirname,
		"../src/assets/app-icon/ios/production/AppIcon~ios-marketing.png",
	);
	const targetAppIconPath = path.join(
		targetDir,
		"src/assets/icons/production/app_icon.png",
	);
	const targetSplashPath = path.join(targetDir, "src/assets/images/splash.png");

	if (fs.existsSync(splashSource)) {
		// Ensure production app icon exists as a 512x512 fallback
		fs.mkdirSync(path.dirname(targetAppIconPath), { recursive: true });
		await sharp(splashSource)
			.resize(512, 512, { fit: "inside" })
			.toFile(targetAppIconPath);

		// Copy to splash.png base
		fs.mkdirSync(path.dirname(targetSplashPath), { recursive: true });
		fs.copyFileSync(splashSource, targetSplashPath);

		// Generate Android densities using sharp
		const densities = [
			{ name: "drawable-mdpi", size: 320 },
			{ name: "drawable-hdpi", size: 480 },
			{ name: "drawable-xhdpi", size: 720 },
			{ name: "drawable-xxhdpi", size: 960 },
			{ name: "drawable-xxxhdpi", size: 1280 },
		];

		for (const d of densities) {
			const dirPath = path.join(targetDir, "android/app/src/main/res", d.name);
			fs.mkdirSync(dirPath, { recursive: true });
			await sharp(targetSplashPath)
				.resize(d.size, d.size, { fit: "inside" })
				.toFile(path.join(dirPath, "splash.png"));
		}
	} else {
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
	const layoutDir = path.join(targetDir, "android/app/src/main/res/layout");
	fs.mkdirSync(layoutDir, { recursive: true });
	fs.writeFileSync(path.join(layoutDir, "launch_screen.xml"), launchScreenXml);

	// iOS Splash.imageset
	if (fs.existsSync(splashSource)) {
		const splashImagesetDir = path.join(
			targetDir,
			"ios",
			iosProjectName,
			"Images.xcassets",
			"Splash.imageset",
		);
		fs.mkdirSync(splashImagesetDir, { recursive: true });

		const contentsJson = {
			images: [
				{ idiom: "universal", filename: "splash.png", scale: "1x" },
				{ idiom: "universal", filename: "splash@2x.png", scale: "2x" },
				{ idiom: "universal", filename: "splash@3x.png", scale: "3x" },
			],
			info: { author: "xcode", version: 1 },
		};
		fs.writeFileSync(
			path.join(splashImagesetDir, "Contents.json"),
			JSON.stringify(contentsJson, null, 2),
		);

		await sharp(splashSource)
			.resize(120, 120, { fit: "inside" })
			.toFile(path.join(splashImagesetDir, "splash.png"));
		await sharp(splashSource)
			.resize(240, 240, { fit: "inside" })
			.toFile(path.join(splashImagesetDir, "splash@2x.png"));
		await sharp(splashSource)
			.resize(360, 360, { fit: "inside" })
			.toFile(path.join(splashImagesetDir, "splash@3x.png"));
	}

	// iOS LaunchScreen.storyboard
	const launchScreenFiles = require("glob").sync(
		targetDir + "/ios/**/LaunchScreen.storyboard",
	);
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
		fs.writeFileSync(launchScreenFiles[0], storyboardContent);
	}

	// Android MainActivity.kt
	const glob = require("glob");
	const mainActivityPaths = glob.sync(
		targetDir + "/android/app/src/main/java/**/MainActivity.kt",
	);
	if (mainActivityPaths.length > 0) {
		let ma = fs.readFileSync(mainActivityPaths[0], "utf8");
		if (!ma.includes("SplashView")) {
			ma = ma.replace(
				"import com.facebook.react.ReactActivity",
				"import com.facebook.react.ReactActivity\nimport android.os.Bundle\nimport com.splashview.SplashView",
			);
			ma = ma.replace(
				"class MainActivity : ReactActivity() {",
				"class MainActivity : ReactActivity() {\n\n  override fun onCreate(savedInstanceState: Bundle?) {\n    SplashView.showSplashView(this)\n    super.onCreate(null)\n  }",
			);
			fs.writeFileSync(mainActivityPaths[0], ma);
		}
	}

	// iOS AppDelegate.mm
	const appDelegatePath = path.join(
		targetDir,
		"ios",
		iosProjectName,
		"AppDelegate.mm",
	);
	if (fs.existsSync(appDelegatePath)) {
		let ad = fs.readFileSync(appDelegatePath, "utf8");

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
			ad = ad.replace(
				"@implementation AppDelegate",
				"@implementation AppDelegate\n" + objcSplashFunc,
			);
			ad = ad.replace(
				"return [super application:application didFinishLaunchingWithOptions:launchOptions];",
				"  [self showSplashScreen];\n  return [super application:application didFinishLaunchingWithOptions:launchOptions];",
			);
			fs.writeFileSync(appDelegatePath, ad);
		}
	}

	// React SplashScreen
	const commonDir = path.join(targetDir, "src/modules/common");
	const commonScreenDir = path.join(commonDir, "screens");
	const commonComponentsDir = path.join(commonDir, "components");
	const splashDir = path.join(commonScreenDir, "splash");
	fs.mkdirSync(splashDir, { recursive: true });
	fs.mkdirSync(commonComponentsDir, { recursive: true });

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

	fs.writeFileSync(
		path.join(splashDir, "useSplashScreen.ts"),
		useSplashScreenTsx,
	);
	fs.writeFileSync(path.join(splashDir, "styles.ts"), splashStylesTs);
	fs.writeFileSync(
		path.join(splashDir, "SplashScreen.tsx"),
		splashScreenTsxCode,
	);
	fs.writeFileSync(
		path.join(splashDir, "index.ts"),
		"export * from './SplashScreen';\n",
	);

	fs.writeFileSync(
		path.join(commonScreenDir, "index.ts"),
		"export * from './splash';\n",
	);
	fs.writeFileSync(path.join(commonComponentsDir, "index.ts"), "");
	fs.writeFileSync(
		path.join(commonDir, "index.ts"),
		"export * from './screens';\nexport * from './components';\n",
	);
	fs.appendFileSync(
		path.join(targetDir, "src/modules/index.ts"),
		"export * from './common';\n",
	);

	console.log(chalk.cyan("\\nInstalling Pods..."));
	try {
		shell.cd(targetDir);
		shell.exec(
			"yarn install && cd ios && rm -rf Podfile.lock Pods && pod install && cd ..",
		);
	} catch (error) {
		console.warn(
			chalk.yellow(
				"\\nWarning: Failed to install iOS pods. You may need to run pod install manually.",
			),
		);
	}

	console.log(chalk.cyan("Linking fonts with react-native-asset..."));
	if (shell.exec("npx react-native-asset").code !== 0) {
		console.warn(
			chalk.yellow(
				"react-native-asset linking failed. Run 'npx react-native-asset' manually.",
			),
		);
	} else {
		console.log(chalk.green("Fonts linked successfully"));
	}

	console.log(chalk.green("Project setup complete!"));
	console.log(chalk.green(`\nSuccess! RNJet project created at ${targetDir}`));
	console.log(chalk.cyan("\nTo get started:"));
	console.log(chalk.white(`  cd ${folderName}`));
	console.log(chalk.white("  make menu (to choose option)\n"));
}

function copyTemplateDir(
	src: string,
	dest: string,
	vars: Record<string, string>,
) {
	const entries = fs.readdirSync(src, { withFileTypes: true });
	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		if (entry.isDirectory()) {
			fs.mkdirpSync(path.join(dest, entry.name));
			copyTemplateDir(srcPath, path.join(dest, entry.name), vars);
		} else if (entry.name.endsWith(".template")) {
			const destName = entry.name.replace(".template", "");
			const fileContent = fs.readFileSync(srcPath, "utf8");
			fs.writeFileSync(path.join(dest, destName), interpolate(fileContent, vars));
		} else {
			fs.copyFileSync(srcPath, path.join(dest, entry.name));
		}
	}
}

function interpolate(content: string, vars: Record<string, string>): string {
	return content.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}
