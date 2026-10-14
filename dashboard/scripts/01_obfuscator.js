          function parseImportBindings(importStr) {
              const cleanStr = importStr.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
              const content = cleanStr
                  .replace(/^import\s+/, '')
                  .replace(/\s+from\s+["'].*?["'];?$/, '')
                  .trim();

              const bindings = [];

              if (content.startsWith('*')) {
                  const match = content.match(/\*\s+as\s+(\w+)/);
                  if (match) bindings.push({ name: match[1], isNamespace: true });
                  return bindings;
              }

              const braceStart = content.indexOf('{');
              if (braceStart !== -1) {
                  const defaultPart = content.slice(0, braceStart).replace(/,/, '').trim();
                  if (defaultPart) {
                      bindings.push({ name: defaultPart, isDefault: true });
                  }
                  const bracePart = content.slice(braceStart + 1, content.lastIndexOf('}')).trim();
                  const namedImports = bracePart.split(',').map(s => s.trim()).filter(Boolean);
                  namedImports.forEach(item => {
                      if (item.includes(' as ')) {
                          const parts = item.split(/\s+as\s+/);
                           bindings.push({ name: parts[1], original: parts[0] });
                      } else {
                          bindings.push({ name: item });
                      }
                  });
              } else {
                  bindings.push({ name: content, isDefault: true });
              }

              return bindings;
          }

          function obfuscateCode(srcText) {
              const importRegex = /import\s+[\s\S]*?from\s+["'].*?["'];?/g;
              const imports = [];
              let match;

              while ((match = importRegex.exec(srcText)) !== null) {
                  imports.push(match[0]);
              }

              let cleanCode = srcText.replace(importRegex, '');

              const bindings = [];
              imports.forEach(imp => {
                  const parsed = parseImportBindings(imp);
                  bindings.push(...parsed);
              });

              const uniqueBindings = [];
              const seenNames = new Set();
              bindings.forEach(b => {
                  if (!seenNames.has(b.name)) {
                      seenNames.add(b.name);
                      uniqueBindings.push(b);
                  }
              });

              cleanCode = cleanCode.replace(/export\s+default\s+/g, 'const _0xNahanModule = ');
              cleanCode += '\nreturn _0xNahanModule;';

              const randKey = Math.floor(Math.random() * 80) + 64;

              const encoder = new TextEncoder();
              const bytes = encoder.encode(cleanCode);

              let hexOutput = '';
              for (let i = 0; i < bytes.length; i++) {
                  const xorByte = bytes[i] ^ randKey;
                  hexOutput += xorByte.toString(16).padStart(2, '0');
               }

              const rawImportsStr = imports.join('\n');
              const bindingNames = uniqueBindings.map(b => b.name);

              const finalLoaderCode = rawImportsStr + '\n\n' +
                  '// Nahan Gateway - Obfuscated Loader Context (v2.5.4.2 Optimized)\n' +
                  'const _0xNahanPayload = "' + hexOutput + '";\n' +
                  'const _0xNahanKey = ' + randKey + ';\n\n' +
                  'const _0xNahanBytes = new Uint8Array((_0xNahanPayload.match(/.{1,2}/g) || []).map(x => parseInt(x, 16) ^ _0xNahanKey));\n' +
                  'const _0xNahanCode = new TextDecoder().decode(_0xNahanBytes);\n' +
                  'const _0xNahanRuntime = new Function(' + bindingNames.map(name => '"' + name + '"').join(', ') + ', _0xNahanCode)(' + bindingNames.join(', ') + ');\n\n' +
                  'export default _0xNahanRuntime;';

              return finalLoaderCode;
          }

