#!/usr/bin/env node

/**
 * Kitchen Kettles Project Feature Scanner
 * 
 * This script scans the repository for frontend and backend features required
 * for the Kitchen Kettles client demo. It produces a comprehensive report of
 * what exists and what's missing.
 * 
 * Usage:
 *   node kk-frontend/tools/check-project.js
 *   (or from kk-frontend directory: node tools/check-project.js)
 * 
 * Requirements:
 *   - Node.js (uses only built-in modules: fs, path, child_process)
 * 
 * Output:
 *   - JSON report: kk-frontend/tools/project-check-report.json
 *   - Human-readable summary: stdout
 * 
 * Exit code: 0 (even if items are missing)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Determine repository root (go up from current script location)
const scriptDir = __dirname;
const frontendRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(frontendRoot, '..');

// Configuration
const DIRS_TO_SCAN = [
  path.join(frontendRoot, 'app'),
  path.join(frontendRoot, 'components'),
  path.join(frontendRoot, 'lib'),
  path.join(frontendRoot, 'public'),
  path.join(frontendRoot, 'app', 'assets', 'images'),
  path.join(repoRoot, 'kk-backend', 'src'),
];

const OUTPUT_FILE = path.join(scriptDir, 'project-check-report.json');

// Initialize report structure
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalChecks: 0,
    found: 0,
    missing: 0
  },
  frontend: {},
  backend: {},
  keywordSearches: {},
  suggestions: []
};

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dirPath, fileList = []) {
  if (!fs.existsSync(dirPath)) {
    return fileList;
  }

  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        // Skip node_modules, .next, .git, etc.
        if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
          getAllFiles(filePath, fileList);
        }
      } else {
        fileList.push(filePath);
      }
    } catch (err) {
      // Skip files we can't read
    }
  });

  return fileList;
}

/**
 * Search for pattern in files
 */
function searchInFiles(files, pattern, options = {}) {
  const { isRegex = false, fileExtensions = null } = options;
  const matches = [];

  files.forEach(filePath => {
    // Filter by extension if specified
    if (fileExtensions && !fileExtensions.some(ext => filePath.endsWith(ext))) {
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const regex = isRegex ? pattern : new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      
      let match;
      while ((match = regex.exec(content)) !== null) {
        // Get context (line containing the match)
        const lines = content.split('\n');
        const lineIndex = content.substring(0, match.index).split('\n').length - 1;
        const line = lines[lineIndex]?.trim();
        
        matches.push({
          file: path.relative(repoRoot, filePath),
          line: lineIndex + 1,
          snippet: line?.substring(0, 100) || ''
        });
        
        // Limit matches per file to avoid huge reports
        if (matches.filter(m => m.file === path.relative(repoRoot, filePath)).length >= 3) {
          break;
        }
      }
    } catch (err) {
      // Skip files we can't read
    }
  });

  return matches;
}

/**
 * Check for file existence with pattern
 */
function checkFiles(files, patterns, description) {
  const found = [];
  const samples = [];

  patterns.forEach(pattern => {
    const regex = new RegExp(pattern);
    files.forEach(filePath => {
      const relativePath = path.relative(repoRoot, filePath);
      if (regex.test(relativePath)) {
        found.push(relativePath);
        
        // Get a small sample of the file
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.split('\n').slice(0, 5).join('\n');
          samples.push({
            file: relativePath,
            sample: lines.substring(0, 200)
          });
        } catch (err) {
          // Skip
        }
      }
    });
  });

  report.summary.totalChecks++;
  
  const result = {
    description,
    status: found.length > 0 ? 'found' : 'missing',
    paths: [...new Set(found)].sort(),
    sampleMatches: samples.slice(0, 3)
  };

  if (result.status === 'found') {
    report.summary.found++;
  } else {
    report.summary.missing++;
  }

  return result;
}

/**
 * Count keyword occurrences
 */
function countKeyword(files, keyword, fileExtensions = null) {
  const matches = searchInFiles(files, keyword, { fileExtensions });
  return {
    keyword,
    count: matches.length,
    files: [...new Set(matches.map(m => m.file))],
    samples: matches.slice(0, 3)
  };
}

// Main execution
console.log('🔍 Kitchen Kettles Project Scanner');
console.log('=' .repeat(60));
console.log(`📂 Repository root: ${repoRoot}`);
console.log(`📂 Frontend root: ${frontendRoot}`);
console.log(`📂 Scanning directories...`);
console.log('');

// Get all files
const allFiles = [];
DIRS_TO_SCAN.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`   ✓ Scanning ${path.relative(repoRoot, dir)}`);
    getAllFiles(dir, allFiles);
  } else {
    console.log(`   ✗ Directory not found: ${path.relative(repoRoot, dir)}`);
  }
});

console.log(`\n📄 Found ${allFiles.length} files to analyze\n`);
console.log('=' .repeat(60));
console.log('\n🎨 FRONTEND CHECKS\n');

// FRONTEND CHECKS

// App Router pages
report.frontend.appRouterPages = checkFiles(
  allFiles,
  ['kk-frontend/app/page\\.(tsx|jsx)$'],
  'App Router root page (app/page.tsx)'
);
console.log(`✓ App Router pages: ${report.frontend.appRouterPages.status}`);

// Auth/Account pages
report.frontend.authPages = checkFiles(
  allFiles,
  [
    'kk-frontend/app/(auth|account|auth|profile|orders|addresses|wishlist)/',
    'kk-frontend/app/account/',
    'kk-frontend/app/orders/',
    'kk-frontend/app/login/',
    'kk-frontend/app/register/',
    'kk-frontend/app/signup/'
  ],
  'Auth/Account related pages'
);
console.log(`✓ Auth/Account pages: ${report.frontend.authPages.status}`);

// DashboardLayout
report.frontend.dashboardLayout = checkFiles(
  allFiles,
  ['kk-frontend/components/DashboardLayout\\.(tsx|jsx)$'],
  'DashboardLayout component'
);
console.log(`✓ DashboardLayout: ${report.frontend.dashboardLayout.status}`);

// ProtectedRoute
report.frontend.protectedRoute = checkFiles(
  allFiles,
  ['kk-frontend/components/ProtectedRoute\\.(tsx|jsx)$'],
  'ProtectedRoute component'
);
console.log(`✓ ProtectedRoute: ${report.frontend.protectedRoute.status}`);

// Cart components
report.frontend.cartComponents = checkFiles(
  allFiles,
  [
    'kk-frontend/components/CartButton\\.(tsx|jsx)$',
    'kk-frontend/components/FloatingCart\\.(tsx|jsx)$',
    'kk-frontend/components/.*CartContext\\.(tsx|jsx)$',
    'kk-frontend/contexts/CartContext\\.(tsx|jsx)$'
  ],
  'Cart components (CartButton, FloatingCart, CartContext)'
);
console.log(`✓ Cart components: ${report.frontend.cartComponents.status}`);

// Hero components
report.frontend.heroComponents = checkFiles(
  allFiles,
  [
    'kk-frontend/components/HeroBanner\\.(tsx|jsx)$',
    'kk-frontend/components/HeroCarousel\\.(tsx|jsx)$'
  ],
  'Hero components (HeroBanner, HeroCarousel)'
);
console.log(`✓ Hero components: ${report.frontend.heroComponents.status}`);

// Orders components
report.frontend.ordersComponents = checkFiles(
  allFiles,
  [
    'kk-frontend/components/(OrdersList|OrderDetail|OrderCard)\\.(tsx|jsx)$'
  ],
  'Orders components (OrdersList, OrderDetail)'
);
console.log(`✓ Orders components: ${report.frontend.ordersComponents.status}`);

// Profile components
report.frontend.profileComponents = checkFiles(
  allFiles,
  [
    'kk-frontend/components/(UserProfileForm|ProfileForm|UserProfile)\\.(tsx|jsx)$'
  ],
  'User profile components'
);
console.log(`✓ Profile components: ${report.frontend.profileComponents.status}`);

// API utilities
report.frontend.apiUtilities = checkFiles(
  allFiles,
  [
    'kk-frontend/lib/api/.*\\.api\\.(ts|js)$',
    'kk-frontend/lib/api/(brands|orders|auth|products)\\.api\\.(ts|js)$'
  ],
  'API utility files (lib/api/*.api.ts)'
);
console.log(`✓ API utilities: ${report.frontend.apiUtilities.status}`);

// Adapters
report.frontend.adapters = checkFiles(
  allFiles,
  [
    'kk-frontend/lib/adapters/.*\\.(ts|js)$',
    'kk-frontend/lib/adapters/(brand|order|product)\\.adapter\\.(ts|js)$'
  ],
  'Data adapters (lib/adapters/*.adapter.ts)'
);
console.log(`✓ Adapters: ${report.frontend.adapters.status}`);

// Brand placeholder image
report.frontend.brandPlaceholder = checkFiles(
  allFiles,
  [
    'kk-frontend/(public|app/assets)/images/brands/',
    'kk-frontend/(public|app/assets)/.*brand.*\\.(png|jpg|jpeg|svg|webp)$'
  ],
  'Brand placeholder images'
);
console.log(`✓ Brand placeholders: ${report.frontend.brandPlaceholder.status}`);

// Tailwind config
report.frontend.tailwindConfig = checkFiles(
  allFiles,
  ['kk-frontend/tailwind\\.config\\.(ts|js)$'],
  'Tailwind configuration'
);
console.log(`✓ Tailwind config: ${report.frontend.tailwindConfig.status}`);

// TypeScript config
report.frontend.typescriptConfig = checkFiles(
  allFiles,
  [
    'kk-frontend/tsconfig\\.json$',
    'kk-frontend/next-env\\.d\\.ts$'
  ],
  'TypeScript configuration (tsconfig.json, next-env.d.ts)'
);
console.log(`✓ TypeScript config: ${report.frontend.typescriptConfig.status}`);

// App API routes
report.frontend.appApiRoutes = checkFiles(
  allFiles,
  [
    'kk-frontend/app/api/(orders|auth|brands)/.*/route\\.(ts|js)$',
    'kk-frontend/app/api/(orders|auth|brands)/route\\.(ts|js)$'
  ],
  'Next.js App Router API routes (app/api/*/route.ts)'
);
console.log(`✓ App API routes: ${report.frontend.appApiRoutes.status}`);

console.log('\n' + '=' .repeat(60));
console.log('\n⚙️  BACKEND CHECKS\n');

// BACKEND CHECKS

// Brand routes
report.backend.brandRoutes = checkFiles(
  allFiles,
  ['kk-backend/src/routes/brand\\.routes\\.(js|ts)$'],
  'Brand routes (brand.routes.js)'
);
console.log(`✓ Brand routes: ${report.backend.brandRoutes.status}`);

// Controllers
report.backend.controllers = checkFiles(
  allFiles,
  [
    'kk-backend/src/controllers/(brand|order|product|auth)\\.controller\\.(js|ts)$'
  ],
  'Main controllers (brand, order, product, auth)'
);
console.log(`✓ Controllers: ${report.backend.controllers.status}`);

// Models
report.backend.models = checkFiles(
  allFiles,
  [
    'kk-backend/src/models/(Brand|Order|Product|User)\\.js$'
  ],
  'Data models (Brand, Order, Product, User)'
);
console.log(`✓ Models: ${report.backend.models.status}`);

// Services
report.backend.services = checkFiles(
  allFiles,
  [
    'kk-backend/src/services/(order|product)\\.service\\.(js|ts)$'
  ],
  'Business logic services'
);
console.log(`✓ Services: ${report.backend.services.status}`);

// Database config
report.backend.databaseConfig = checkFiles(
  allFiles,
  [
    'kk-backend/src/config/db\\.(js|ts)$',
    'kk-backend/src/seed/seed\\.(js|ts)$'
  ],
  'Database configuration and seed files'
);
console.log(`✓ Database config: ${report.backend.databaseConfig.status}`);

// Environment files
report.backend.envFiles = checkFiles(
  allFiles,
  [
    'kk-backend/(\\.env|\\.env\\.example)$'
  ],
  'Environment configuration files'
);
console.log(`✓ Environment files: ${report.backend.envFiles.status}`);

console.log('\n' + '=' .repeat(60));
console.log('\n🔎 KEYWORD SEARCHES\n');

// Keyword searches
const keywords = [
  { keyword: 'getOrders\\(', extensions: ['.ts', '.tsx', '.js', '.jsx'] },
  { keyword: 'createOrder\\(', extensions: ['.ts', '.tsx', '.js', '.jsx'] },
  { keyword: 'POST /orders', extensions: ['.ts', '.tsx', '.js', '.jsx'] },
  { keyword: "fetch\\(['\"]/(api/)?brands", extensions: ['.ts', '.tsx', '.js', '.jsx'] },
  { keyword: 'getBrands\\(', extensions: ['.ts', '.tsx', '.js', '.jsx'] },
  { keyword: 'ProtectedRoute', extensions: ['.ts', '.tsx', '.js', '.jsx'] },
  { keyword: 'FloatingCart', extensions: ['.ts', '.tsx', '.js', '.jsx'] },
  { keyword: 'CartContext', extensions: ['.ts', '.tsx', '.js', '.jsx'] },
  { keyword: 'SupabaseCartContext', extensions: ['.ts', '.tsx', '.js', '.jsx'] },
  { keyword: '\\botp\\b', extensions: ['.ts', '.tsx', '.js', '.jsx'] },
  { keyword: 'otpToken', extensions: ['.ts', '.tsx', '.js', '.jsx'] },
  { keyword: 'verify.*otp', extensions: ['.ts', '.tsx', '.js', '.jsx'] }
];

keywords.forEach(({ keyword, extensions }) => {
  const result = countKeyword(allFiles, keyword, extensions);
  report.keywordSearches[keyword] = result;
  console.log(`  ${keyword.padEnd(30)} → ${result.count} occurrences in ${result.files.length} files`);
});

console.log('\n' + '=' .repeat(60));
console.log('\n📊 SUMMARY\n');

console.log(`Total checks: ${report.summary.totalChecks}`);
console.log(`✓ Found: ${report.summary.found} (${Math.round(report.summary.found / report.summary.totalChecks * 100)}%)`);
console.log(`✗ Missing: ${report.summary.missing} (${Math.round(report.summary.missing / report.summary.totalChecks * 100)}%)`);

// Generate suggestions
console.log('\n' + '=' .repeat(60));
console.log('\n💡 SUGGESTIONS\n');

if (report.frontend.dashboardLayout.status === 'missing') {
  report.suggestions.push('Create DashboardLayout component for user account pages');
  console.log('⚠️  Create DashboardLayout component for user account pages');
}

if (report.frontend.ordersComponents.status === 'missing') {
  report.suggestions.push('Create OrdersList and OrderDetail components');
  console.log('⚠️  Create OrdersList and OrderDetail components');
}

if (report.frontend.profileComponents.status === 'missing') {
  report.suggestions.push('Create UserProfileForm component');
  console.log('⚠️  Create UserProfileForm component');
}

if (report.frontend.authPages.paths.length === 0) {
  report.suggestions.push('Create app/account/orders/page.tsx for order history');
  console.log('⚠️  Create app/account/orders/page.tsx for order history');
}

if (report.backend.services.status === 'missing') {
  report.suggestions.push('Implement business logic services for orders and products');
  console.log('⚠️  Implement business logic services for orders and products');
}

if (report.keywordSearches['getOrders\\(']?.count === 0) {
  report.suggestions.push('Implement GET /api/orders endpoint');
  console.log('⚠️  Implement GET /api/orders endpoint');
}

if (report.backend.envFiles.status === 'missing') {
  report.suggestions.push('Create .env.example file in backend with required variables');
  console.log('⚠️  Create .env.example file in backend with required variables');
}

if (report.suggestions.length === 0) {
  console.log('✅ All critical features are present!');
  report.suggestions.push('All critical features detected. Project looks ready for demo.');
}

// Write JSON report
console.log('\n' + '=' .repeat(60));
console.log(`\n💾 Writing report to: ${path.relative(repoRoot, OUTPUT_FILE)}\n`);

try {
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2), 'utf8');
  console.log('✅ Report generated successfully!\n');
} catch (err) {
  console.error('❌ Error writing report:', err.message);
  process.exit(0); // Still exit with 0 as per requirements
}

console.log('=' .repeat(60));
console.log('✨ Scan complete!\n');

process.exit(0);
