#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Version Update Script for IamHereApp
 * Updates version across all project files and creates git tag
 */

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadVersionConfig() {
  try {
    const versionData = fs.readFileSync('./version.json', 'utf8');
    return JSON.parse(versionData);
  } catch (error) {
    log('❌ Error loading version.json', 'red');
    process.exit(1);
  }
}

function saveVersionConfig(config) {
  try {
    fs.writeFileSync('./version.json', JSON.stringify(config, null, 2));
    log('✅ Updated version.json', 'green');
  } catch (error) {
    log('❌ Error saving version.json', 'red');
    process.exit(1);
  }
}

function updatePackageJson(filePath, version) {
  try {
    if (fs.existsSync(filePath)) {
      const packageData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      packageData.version = version;
      fs.writeFileSync(filePath, JSON.stringify(packageData, null, 2));
      log(`✅ Updated ${filePath}`, 'green');
    }
  } catch (error) {
    log(`❌ Error updating ${filePath}: ${error.message}`, 'red');
  }
}

function updateManifest(version, buildNumber) {
  const manifestPath = './frontend/static/manifest.webmanifest';
  try {
    if (fs.existsSync(manifestPath)) {
      const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      manifestData.version = version;
      manifestData.version_name = `v${version} (${buildNumber})`;
      fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2));
      log('✅ Updated PWA manifest', 'green');
    }
  } catch (error) {
    log(`❌ Error updating manifest: ${error.message}`, 'red');
  }
}

function updateServiceWorker(version, buildNumber) {
  const swPath = './frontend/static/sw.js';
  try {
    if (fs.existsSync(swPath)) {
      let swContent = fs.readFileSync(swPath, 'utf8');
      
      // Update cache version
      swContent = swContent.replace(
        /const CACHE_VERSION = ['"][^'"]*['"];?/,
        `const CACHE_VERSION = 'v${version}-${buildNumber}';`
      );
      
      // Update app version
      swContent = swContent.replace(
        /const APP_VERSION = ['"][^'"]*['"];?/,
        `const APP_VERSION = '${version}';`
      );
      
      fs.writeFileSync(swPath, swContent);
      log('✅ Updated Service Worker', 'green');
    }
  } catch (error) {
    log(`❌ Error updating service worker: ${error.message}`, 'red');
  }
}

function updateAppHtml(version) {
  const appHtmlPath = './frontend/src/app.html';
  try {
    if (fs.existsSync(appHtmlPath)) {
      let htmlContent = fs.readFileSync(appHtmlPath, 'utf8');
      
      // Update meta version tag
      htmlContent = htmlContent.replace(
        /<meta name="version" content="[^"]*">/,
        `<meta name="version" content="${version}">`
      );
      
      // Add version meta tag if it doesn't exist
      if (!htmlContent.includes('<meta name="version"')) {
        htmlContent = htmlContent.replace(
          '<meta name="description"',
          `<meta name="version" content="${version}">\n\t\t<meta name="description"`
        );
      }
      
      fs.writeFileSync(appHtmlPath, htmlContent);
      log('✅ Updated app.html', 'green');
    }
  } catch (error) {
    log(`❌ Error updating app.html: ${error.message}`, 'red');
  }
}

function updateBackendConstants(version, buildNumber) {
  const constantsPath = './backend/constants.js';
  try {
    if (fs.existsSync(constantsPath)) {
      let constantsContent = fs.readFileSync(constantsPath, 'utf8');
      
      // Update or add version constants
      if (constantsContent.includes('APP_VERSION')) {
        constantsContent = constantsContent.replace(
          /APP_VERSION:\s*['"][^'"]*['"],?/,
          `APP_VERSION: '${version}',`
        );
      } else {
        constantsContent = constantsContent.replace(
          'module.exports = {',
          `module.exports = {\n  APP_VERSION: '${version}',\n  BUILD_NUMBER: ${buildNumber},`
        );
      }
      
      if (constantsContent.includes('BUILD_NUMBER')) {
        constantsContent = constantsContent.replace(
          /BUILD_NUMBER:\s*\d+,?/,
          `BUILD_NUMBER: ${buildNumber},`
        );
      }
      
      fs.writeFileSync(constantsPath, constantsContent);
      log('✅ Updated backend constants', 'green');
    }
  } catch (error) {
    log(`❌ Error updating backend constants: ${error.message}`, 'red');
  }
}

function updateFrontendConfig(version) {
  const configPath = './frontend/src/lib/config.js';
  try {
    if (fs.existsSync(configPath)) {
      let configContent = fs.readFileSync(configPath, 'utf8');
      
      // Update or add version in config
      if (configContent.includes('APP_VERSION')) {
        configContent = configContent.replace(
          /APP_VERSION:\s*['"][^'"]*['"],?/,
          `APP_VERSION: '${version}',`
        );
      } else {
        configContent = configContent.replace(
          'export const',
          `export const APP_VERSION = '${version}';\n\nexport const`
        );
      }
      
      fs.writeFileSync(configPath, configContent);
      log('✅ Updated frontend config', 'green');
    }
  } catch (error) {
    log(`❌ Error updating frontend config: ${error.message}`, 'red');
  }
}

function createGitTag(version, description) {
  try {
    // Check if git is available
    execSync('git --version', { stdio: 'ignore' });
    
    // Check if we're in a git repository
    execSync('git status', { stdio: 'ignore' });
    
    const tagName = `v${version}`;
    const tagMessage = `Release ${version}: ${description}`;
    
    // Create annotated tag
    execSync(`git tag -a "${tagName}" -m "${tagMessage}"`, { stdio: 'inherit' });
    log(`✅ Created git tag: ${tagName}`, 'green');
    
    return tagName;
  } catch (error) {
    log('⚠️  Git not available or not in git repository', 'yellow');
    return null;
  }
}

function incrementVersion(currentVersion, type = 'patch') {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

function showCurrentVersion() {
  const config = loadVersionConfig();
  log('\n📋 Current Version Information:', 'cyan');
  log(`   Version: ${config.version}`, 'bright');
  log(`   Build: ${config.buildNumber}`, 'bright');
  log(`   Code Name: ${config.codeName}`, 'bright');
  log(`   Release Date: ${config.releaseDate}`, 'bright');
  log(`   Description: ${config.description}`, 'bright');
}

function main() {
  log('🚀 IamHereApp Version Update Tool', 'cyan');
  log('=====================================\n', 'cyan');
  
  const args = process.argv.slice(2);
  
  if (args.includes('--show') || args.includes('-s')) {
    showCurrentVersion();
    return;
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    log('Usage:', 'yellow');
    log('  node update-version.js [options]', 'bright');
    log('\nOptions:', 'yellow');
    log('  --show, -s           Show current version', 'bright');
    log('  --patch, -p          Increment patch version (1.0.0 → 1.0.1)', 'bright');
    log('  --minor, -m          Increment minor version (1.0.0 → 1.1.0)', 'bright');
    log('  --major, -M          Increment major version (1.0.0 → 2.0.0)', 'bright');
    log('  --version <version>  Set specific version', 'bright');
    log('  --description <desc> Set release description', 'bright');
    log('  --codename <name>    Set release codename', 'bright');
    log('  --help, -h           Show this help', 'bright');
    log('\nExamples:', 'yellow');
    log('  node update-version.js --patch', 'bright');
    log('  node update-version.js --version 2.0.0 --description "Major release"', 'bright');
    return;
  }
  
  const config = loadVersionConfig();
  let newVersion = config.version;
  let updateType = 'patch';
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--patch':
      case '-p':
        updateType = 'patch';
        newVersion = incrementVersion(config.version, 'patch');
        break;
      case '--minor':
      case '-m':
        updateType = 'minor';
        newVersion = incrementVersion(config.version, 'minor');
        break;
      case '--major':
      case '-M':
        updateType = 'major';
        newVersion = incrementVersion(config.version, 'major');
        break;
      case '--version':
        if (i + 1 < args.length) {
          newVersion = args[i + 1];
          i++; // Skip next argument
        }
        break;
      case '--description':
        if (i + 1 < args.length) {
          config.description = args[i + 1];
          i++; // Skip next argument
        }
        break;
      case '--codename':
        if (i + 1 < args.length) {
          config.codeName = args[i + 1];
          i++; // Skip next argument
        }
        break;
    }
  }
  
  // If no arguments provided, default to patch increment
  if (args.length === 0) {
    newVersion = incrementVersion(config.version, 'patch');
  }
  
  log(`📈 Updating version: ${config.version} → ${newVersion}`, 'yellow');
  log(`🔧 Update type: ${updateType}`, 'yellow');
  
  // Update version config
  config.version = newVersion;
  config.buildNumber += 1;
  config.releaseDate = new Date().toISOString().split('T')[0];
  
  log('\n🔄 Updating files...', 'blue');
  
  // Update all files
  saveVersionConfig(config);
  updatePackageJson('./package.json', newVersion);
  updatePackageJson('./frontend/package.json', newVersion);
  updatePackageJson('./backend/package.json', newVersion);
  updateManifest(newVersion, config.buildNumber);
  updateServiceWorker(newVersion, config.buildNumber);
  updateAppHtml(newVersion);
  updateBackendConstants(newVersion, config.buildNumber);
  updateFrontendConfig(newVersion);
  
  log('\n🏷️  Creating git tag...', 'blue');
  const tagName = createGitTag(newVersion, config.description);
  
  log('\n✅ Version update completed!', 'green');
  log(`📦 New version: ${newVersion}`, 'bright');
  log(`🔢 Build number: ${config.buildNumber}`, 'bright');
  if (tagName) {
    log(`🏷️  Git tag: ${tagName}`, 'bright');
  }
  
  log('\n📝 Next steps:', 'cyan');
  log('1. Review changes: git diff', 'bright');
  log('2. Commit changes: git add . && git commit -m "Release v' + newVersion + '"', 'bright');
  log('3. Push to remote: git push origin main --tags', 'bright');
  log('4. Deploy to production', 'bright');
}

if (require.main === module) {
  main();
}

module.exports = {
  loadVersionConfig,
  incrementVersion,
  updatePackageJson,
  updateManifest,
  updateServiceWorker
}; 