#!/usr/bin/env node

/**
 * سكريبت النشر التلقائي
 * يساعد في أتمتة عملية النشر والإدارة
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ألوان للطباعة
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

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function runCommand(command, description) {
  try {
    log(`\n🔄 ${description}...`, 'blue');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} مكتمل!`, 'green');
    return true;
  } catch (error) {
    log(`❌ خطأ في ${description}: ${error.message}`, 'red');
    return false;
  }
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description} موجود`, 'green');
    return true;
  } else {
    log(`❌ ${description} غير موجود: ${filePath}`, 'red');
    return false;
  }
}

async function checkEnvironment() {
  log('\n🔍 فحص البيئة...', 'cyan');
  
  const checks = [
    { file: 'package.json', desc: 'ملف package.json' },
    { file: '.env', desc: 'ملف إعدادات البيئة' },
    { file: 'src', desc: 'مجلد المصدر' }
  ];
  
  let allGood = true;
  checks.forEach(check => {
    if (!checkFile(check.file, check.desc)) {
      allGood = false;
    }
  });
  
  if (!allGood) {
    log('\n⚠️  يرجى إصلاح المشاكل أعلاه قبل المتابعة', 'yellow');
    return false;
  }
  
  return true;
}

async function installDependencies() {
  log('\n📦 تثبيت المكتبات...', 'cyan');
  return runCommand('npm install', 'تثبيت المكتبات');
}

async function runTests() {
  log('\n🧪 تشغيل الاختبارات...', 'cyan');
  
  // فحص TypeScript
  if (!runCommand('npx tsc --noEmit', 'فحص TypeScript')) {
    return false;
  }
  
  // فحص ESLint (إذا كان موجود)
  if (fs.existsSync('.eslintrc.js') || fs.existsSync('.eslintrc.json')) {
    if (!runCommand('npx eslint src --ext .ts,.tsx', 'فحص ESLint')) {
      return false;
    }
  }
  
  return true;
}

async function buildProject() {
  log('\n🏗️  بناء المشروع...', 'cyan');
  return runCommand('npm run build', 'بناء المشروع');
}

async function deployToVercel() {
  log('\n🚀 النشر على Vercel...', 'cyan');
  
  // فحص إذا كان Vercel CLI مثبت
  try {
    execSync('vercel --version', { stdio: 'ignore' });
  } catch {
    log('📥 تثبيت Vercel CLI...', 'blue');
    if (!runCommand('npm install -g vercel', 'تثبيت Vercel CLI')) {
      return false;
    }
  }
  
  // النشر
  return runCommand('vercel --prod', 'النشر على Vercel');
}

async function deployToNetlify() {
  log('\n🚀 النشر على Netlify...', 'cyan');
  
  // فحص إذا كان Netlify CLI مثبت
  try {
    execSync('netlify --version', { stdio: 'ignore' });
  } catch {
    log('📥 تثبيت Netlify CLI...', 'blue');
    if (!runCommand('npm install -g netlify-cli', 'تثبيت Netlify CLI')) {
      return false;
    }
  }
  
  // النشر
  return runCommand('netlify deploy --prod --dir=dist', 'النشر على Netlify');
}

async function setupGitHubPages() {
  log('\n🚀 إعداد GitHub Pages...', 'cyan');
  
  // إنشاء workflow file
  const workflowDir = '.github/workflows';
  const workflowFile = path.join(workflowDir, 'deploy.yml');
  
  if (!fs.existsSync(workflowDir)) {
    fs.mkdirSync(workflowDir, { recursive: true });
  }
  
  const workflowContent = `name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: \${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
`;
  
  fs.writeFileSync(workflowFile, workflowContent);
  log('✅ تم إنشاء ملف GitHub Actions', 'green');
  
  // إضافة base في vite.config.ts
  const viteConfigPath = 'vite.config.ts';
  if (fs.existsSync(viteConfigPath)) {
    let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
    if (!viteConfig.includes('base:')) {
      const repoName = await question('ما هو اسم repository على GitHub؟ ');
      viteConfig = viteConfig.replace(
        'export default defineConfig({',
        `export default defineConfig({\n  base: '/${repoName}/',`
      );
      fs.writeFileSync(viteConfigPath, viteConfig);
      log('✅ تم تحديث vite.config.ts', 'green');
    }
  }
  
  log('\n📝 الخطوات التالية:', 'yellow');
  log('1. ارفع التغييرات على GitHub:', 'yellow');
  log('   git add .', 'yellow');
  log('   git commit -m "Setup GitHub Pages"', 'yellow');
  log('   git push', 'yellow');
  log('2. اذهب إلى Settings > Pages في repository', 'yellow');
  log('3. اختر "Deploy from a branch" و "gh-pages"', 'yellow');
  
  return true;
}

async function createBackup() {
  log('\n💾 إنشاء نسخة احتياطية...', 'cyan');
  
  const backupDir = 'backups';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `backup-${timestamp}`);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  
  // نسخ الملفات المهمة
  const filesToBackup = [
    'src',
    'public',
    'package.json',
    'package-lock.json',
    'vite.config.ts',
    'tsconfig.json',
    '.env.example'
  ];
  
  fs.mkdirSync(backupPath, { recursive: true });
  
  filesToBackup.forEach(file => {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      if (stats.isDirectory()) {
        runCommand(`cp -r ${file} ${backupPath}/`, `نسخ ${file}`);
      } else {
        runCommand(`cp ${file} ${backupPath}/`, `نسخ ${file}`);
      }
    }
  });
  
  log(`✅ تم إنشاء نسخة احتياطية في: ${backupPath}`, 'green');
  return true;
}

async function updateDependencies() {
  log('\n🔄 تحديث المكتبات...', 'cyan');
  
  // فحص التحديثات المتاحة
  runCommand('npm outdated', 'فحص التحديثات المتاحة');
  
  const shouldUpdate = await question('\nهل تريد تحديث المكتبات؟ (y/n): ');
  if (shouldUpdate.toLowerCase() === 'y') {
    return runCommand('npm update', 'تحديث المكتبات');
  }
  
  return true;
}

async function main() {
  log('🎮 مرحباً بك في أداة إدارة لعبة الأطفال التعليمية!', 'bright');
  log('================================================', 'cyan');
  
  while (true) {
    log('\n📋 اختر العملية التي تريد تنفيذها:', 'bright');
    log('1. فحص البيئة والإعدادات', 'cyan');
    log('2. تثبيت/تحديث المكتبات', 'cyan');
    log('3. تشغيل الاختبارات', 'cyan');
    log('4. بناء المشروع', 'cyan');
    log('5. النشر على Vercel', 'cyan');
    log('6. النشر على Netlify', 'cyan');
    log('7. إعداد GitHub Pages', 'cyan');
    log('8. إنشاء نسخة احتياطية', 'cyan');
    log('9. تحديث المكتبات', 'cyan');
    log('10. نشر كامل (فحص + بناء + نشر)', 'cyan');
    log('0. خروج', 'red');
    
    const choice = await question('\nاختر رقم العملية: ');
    
    switch (choice) {
      case '1':
        await checkEnvironment();
        break;
      case '2':
        await installDependencies();
        break;
      case '3':
        await runTests();
        break;
      case '4':
        await buildProject();
        break;
      case '5':
        if (await checkEnvironment() && await buildProject()) {
          await deployToVercel();
        }
        break;
      case '6':
        if (await checkEnvironment() && await buildProject()) {
          await deployToNetlify();
        }
        break;
      case '7':
        await setupGitHubPages();
        break;
      case '8':
        await createBackup();
        break;
      case '9':
        await updateDependencies();
        break;
      case '10':
        if (await checkEnvironment() && 
            await installDependencies() && 
            await runTests() && 
            await buildProject()) {
          
          const platform = await question('\nاختر منصة النشر (vercel/netlify/github): ');
          switch (platform.toLowerCase()) {
            case 'vercel':
              await deployToVercel();
              break;
            case 'netlify':
              await deployToNetlify();
              break;
            case 'github':
              await setupGitHubPages();
              break;
            default:
              log('منصة غير مدعومة', 'red');
          }
        }
        break;
      case '0':
        log('\n👋 شكراً لاستخدام الأداة!', 'green');
        rl.close();
        process.exit(0);
        break;
      default:
        log('اختيار غير صحيح، يرجى المحاولة مرة أخرى', 'red');
    }
    
    await question('\nاضغط Enter للمتابعة...');
  }
}

// تشغيل البرنامج
if (require.main === module) {
  main().catch(error => {
    log(`خطأ غير متوقع: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  checkEnvironment,
  installDependencies,
  runTests,
  buildProject,
  deployToVercel,
  deployToNetlify,
  setupGitHubPages,
  createBackup,
  updateDependencies
};