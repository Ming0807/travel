const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'components', 'admin');

function traverseAndFix(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseAndFix(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Simple RegExp to match `if (state?.success) { ... }` or `if (state?.success && isEditing) { ... }` at the top level of component
            const regex = /if\s*\((state\?\.success(?:[^)]*))\)\s*\{([^}]+router\.push[^}]+)\}/g;
            
            if (regex.test(content)) {
                content = content.replace(regex, (match, condition, body) => {
                    // remove `return null;` if present
                    let newBody = body.replace(/return null;?/g, '').trim();
                    return `useEffect(() => {\n    if (${condition}) {\n      ${newBody}\n    }\n  }, [${condition.includes('isEditing') ? 'state?.success, isEditing' : 'state?.success'}, router]);`;
                });
                
                // add useEffect to import from react if not there
                if (!content.includes('useEffect') && content.includes('from "react"')) {
                    content = content.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*"react"/, (m, imports) => {
                        return `import { ${imports}, useEffect } from "react"`;
                    });
                } else if (!content.includes('useEffect')) {
                    content = `import { useEffect } from "react";\n` + content;
                }
                
                modified = true;
            }

            if (modified) {
                console.log(`Fixed ${fullPath}`);
                fs.writeFileSync(fullPath, content, 'utf8');
            }
        }
    }
}

traverseAndFix(directoryPath);
console.log('Done');
