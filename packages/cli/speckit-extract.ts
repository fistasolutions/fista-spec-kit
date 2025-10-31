#!/usr/bin/env node
/**
 * speckit extract - Scan existing codebase and generate SpecKit artifacts
 * 
 * Usage: pnpm speckit:extract <INPUT_PATH>
 * 
 * Scans Next.js routes, React components, and OpenAPI specs,
 * then generates spec.yaml, inventory.md, and tasks.md files.
 */

import * as fs from 'fs';
import * as path from 'path';
import glob from 'fast-glob';
import * as yaml from 'yaml';

// Type definitions
interface RouteHit {
  path: string;
  file: string;
  kind: 'page' | 'route';
}

interface ComponentHit {
  name: string;
  file: string;
}

interface ApiEndpoint {
  method: string;
  path: string;
  summary?: string;
}

interface ExtractResults {
  routes: RouteHit[];
  components: ComponentHit[];
  apis: ApiEndpoint[];
}

// Normalize path separators for web paths
function normalizeWebPath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

// Derive web path from Next.js App Router file path
function deriveWebPath(filePath: string, root: string): string {
  const relative = normalizeWebPath(path.relative(root, filePath));
  
  // Remove file extension
  let webPath = relative.replace(/\.(tsx?|jsx?)$/, '');
  
  // Handle Next.js App Router patterns
  // Remove /app prefix if present
  if (webPath.startsWith('app/')) {
    webPath = webPath.substring(4);
  }
  
  // Handle route groups: (group)/page.tsx -> remove (group) folders
  webPath = webPath.replace(/\([^)]+\)\//g, '');
  
  // Handle page routes
  if (webPath.endsWith('/page')) {
    const parent = path.dirname(webPath);
    if (parent === '.' || parent === 'app') {
      webPath = '/';
    } else {
      webPath = '/' + parent;
    }
  } else if (webPath.endsWith('/route')) {
    // API route handlers: route.tsx -> parent directory
    const parent = path.dirname(webPath);
    if (parent === '.' || parent === 'app') {
      webPath = '/';
    } else {
      webPath = '/' + parent;
    }
  } else {
    // Handle other patterns - just use the directory path
    const dir = path.dirname(webPath);
    if (dir === '.' || dir === 'app') {
      webPath = '/';
    } else {
      webPath = '/' + dir;
    }
  }
  
  // Ensure single leading slash
  if (!webPath.startsWith('/')) {
    webPath = '/' + webPath;
  }
  
  // Normalize double slashes and trailing slashes (except root)
  webPath = webPath.replace(/\/+/g, '/');
  if (webPath.length > 1 && webPath.endsWith('/')) {
    webPath = webPath.slice(0, -1);
  }
  
  return webPath;
}

// Find Next.js App Router routes
function findNextRoutes(root: string): RouteHit[] {
  const patterns = [
    'app/**/page.{ts,tsx,js,jsx}',
    'app/**/route.{ts,tsx,js,jsx}',
  ];
  
  const routes: RouteHit[] = [];
  
  for (const pattern of patterns) {
    const files = glob.sync(pattern, {
      cwd: root,
      absolute: false,
      onlyFiles: true,
    });
    
    for (const file of files) {
      const fullPath = path.join(root, file);
      const isPage = file.includes('/page.');
      const isRoute = file.includes('/route.');
      
      if (isPage) {
        routes.push({
          path: deriveWebPath(fullPath, root),
          file: normalizeWebPath(file),
          kind: 'page',
        });
      } else if (isRoute) {
        routes.push({
          path: deriveWebPath(fullPath, root),
          file: normalizeWebPath(file),
          kind: 'route',
        });
      }
    }
  }
  
  return routes;
}

// Find React components
function findComponents(root: string): ComponentHit[] {
  const patterns = [
    'components/**/*.{tsx,jsx}',
    'ui/**/*.{tsx,jsx}',
    'shared/**/*.{tsx,jsx}',
  ];
  
  const components: ComponentHit[] = [];
  
  for (const pattern of patterns) {
    const files = glob.sync(pattern, {
      cwd: root,
      absolute: false,
      onlyFiles: true,
    });
    
    for (const file of files) {
      // Extract component name from filename (without extension)
      const basename = path.basename(file, path.extname(file));
      
      components.push({
        name: basename,
        file: normalizeWebPath(file),
      });
    }
  }
  
  return components;
}

// Try to load OpenAPI JSON from common locations
function tryLoadOpenAPI(inputRoot: string, projectRoot: string): ApiEndpoint[] {
  const candidates = [
    // Search in project root
    { root: projectRoot, path: 'apps/api/openapi.json' },
    { root: projectRoot, path: 'public/openapi.json' },
    // Search in input path
    { root: inputRoot, path: 'openapi.json' },
  ];
  
  for (const candidate of candidates) {
    const filePath = path.join(candidate.root, candidate.path);
    
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const openapi = JSON.parse(content);
        
        if (openapi.paths && typeof openapi.paths === 'object') {
          const endpoints: ApiEndpoint[] = [];
          
          for (const [apiPath, methods] of Object.entries(openapi.paths)) {
            if (methods && typeof methods === 'object') {
              for (const [method, operation] of Object.entries(methods as Record<string, any>)) {
                if (['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method.toLowerCase())) {
                  endpoints.push({
                    method: method.toUpperCase(),
                    path: apiPath,
                    summary: operation?.summary || undefined,
                  });
                }
              }
            }
          }
          
          return endpoints;
        }
      } catch (error) {
        // Silently fail and try next candidate
        continue;
      }
    }
  }
  
  return [];
}

// Write spec.yaml
function writeSpecYaml(
  results: ExtractResults,
  outputDir: string
): void {
  const spec = {
    version: '1.0.0',
    extracted: new Date().toISOString(),
    routes: results.routes.map(r => ({
      path: r.path,
      file: r.file,
      kind: r.kind,
    })),
    components: results.components.map(c => ({
      name: c.name,
      file: c.file,
    })),
    api: {
      endpoints: results.apis.map(a => ({
        method: a.method,
        path: a.path,
        summary: a.summary || null,
      })),
    },
  };
  
  const yamlContent = yaml.stringify(spec, {
    indent: 2,
    lineWidth: 0,
  });
  
  fs.writeFileSync(
    path.join(outputDir, 'spec.yaml'),
    yamlContent,
    'utf-8'
  );
}

// Write inventory.md
function writeInventoryMd(
  results: ExtractResults,
  outputDir: string
): void {
  const lines: string[] = [];
  
  lines.push('# Codebase Inventory');
  lines.push('');
  lines.push(`**Extracted:** ${new Date().toISOString()}`);
  lines.push('');
  
  // Routes section
  lines.push('## Next.js Routes');
  lines.push('');
  if (results.routes.length === 0) {
    lines.push('_None detected_');
  } else {
    lines.push('| Path | Kind | File |');
    lines.push('|------|------|------|');
    for (const route of results.routes) {
      lines.push(`| ${route.path} | ${route.kind} | \`${route.file}\` |`);
    }
  }
  lines.push('');
  
  // Components section
  lines.push('## React Components');
  lines.push('');
  if (results.components.length === 0) {
    lines.push('_None detected_');
  } else {
    lines.push('| Name | File |');
    lines.push('|------|------|');
    for (const comp of results.components) {
      lines.push(`| ${comp.name} | \`${comp.file}\` |`);
    }
  }
  lines.push('');
  
  // API Endpoints section
  lines.push('## API Endpoints');
  lines.push('');
  if (results.apis.length === 0) {
    lines.push('_None detected_');
  } else {
    lines.push('| Method | Path | Summary |');
    lines.push('|--------|------|---------|');
    for (const api of results.apis) {
      const summary = api.summary || '_No summary_';
      lines.push(`| ${api.method} | ${api.path} | ${summary} |`);
    }
  }
  lines.push('');
  
  fs.writeFileSync(
    path.join(outputDir, 'inventory.md'),
    lines.join('\n'),
    'utf-8'
  );
}

// Append tasks.md with timestamped checklist
function appendTasks(
  results: ExtractResults,
  outputDir: string
): void {
  const tasksFile = path.join(outputDir, 'tasks.md');
  
  const timestamp = new Date().toISOString();
  const lines: string[] = [];
  
  lines.push(`## Extraction Reconciliation - ${timestamp}`);
  lines.push('');
  lines.push('### Routes to Review');
  lines.push('');
  
  if (results.routes.length === 0) {
    lines.push('- [ ] No routes detected');
  } else {
    for (const route of results.routes) {
      lines.push(`- [ ] Verify route \`${route.path}\` (\`${route.file}\`) matches spec`);
    }
  }
  
  lines.push('');
  lines.push('### Components to Review');
  lines.push('');
  
  if (results.components.length === 0) {
    lines.push('- [ ] No components detected');
  } else {
    for (const comp of results.components) {
      lines.push(`- [ ] Verify component \`${comp.name}\` (\`${comp.file}\`) is documented`);
    }
  }
  
  lines.push('');
  lines.push('### API Endpoints to Review');
  lines.push('');
  
  if (results.apis.length === 0) {
    lines.push('- [ ] No API endpoints detected');
  } else {
    for (const api of results.apis) {
      lines.push(`- [ ] Verify endpoint ${api.method} \`${api.path}\` is documented`);
    }
  }
  
  lines.push('');
  lines.push('---');
  lines.push('');
  
  const content = lines.join('\n');
  
  // Append to existing file or create new
  if (fs.existsSync(tasksFile)) {
    const existing = fs.readFileSync(tasksFile, 'utf-8');
    fs.writeFileSync(tasksFile, existing + '\n' + content, 'utf-8');
  } else {
    fs.writeFileSync(tasksFile, content, 'utf-8');
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const inputPath = args[0] || './src';
  
  // Resolve absolute paths
  const root = path.resolve(process.cwd(), inputPath);
  const outputDir = path.resolve(process.cwd(), 'packages/specs/active/extracted');
  
  // Validate input path exists
  if (!fs.existsSync(root)) {
    console.error(`❌ Error: Input path does not exist: ${inputPath}`);
    process.exit(1);
  }
  
  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });
  
  console.log(`🔍 Scanning codebase in: ${inputPath}`);
  
  // Extract information
  const routes = findNextRoutes(root);
  const components = findComponents(root);
  const apis = tryLoadOpenAPI(root, process.cwd()); // Search from both input path and project root
  
  const results: ExtractResults = {
    routes,
    components,
    apis,
  };
  
  // Write artifacts
  writeSpecYaml(results, outputDir);
  writeInventoryMd(results, outputDir);
  appendTasks(results, outputDir);
  
  // Print summary
  console.log(`✅ Extracted ${routes.length} routes, ${components.length} components, ${apis.length} API endpoints.`);
  console.log('');
  console.log('📄 Written files:');
  console.log(`   ${path.relative(process.cwd(), path.join(outputDir, 'spec.yaml'))}`);
  console.log(`   ${path.relative(process.cwd(), path.join(outputDir, 'inventory.md'))}`);
  console.log(`   ${path.relative(process.cwd(), path.join(outputDir, 'tasks.md'))}`);
}

// Run if executed directly
if (require.main === module) {
  main();
}

