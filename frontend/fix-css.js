const fs = require('fs');
let css = fs.readFileSync('src/app/globals.css', 'utf8');

css = css.replace(/(--[a-zA-Z0-9-]+):\s*oklch\(([^)]+)\);/g, (match, varName, vals) => {
    // Just a basic fallback, browsers will use this if oklch is not supported
    // Since it's a generic theme, we can just use a simple hsl(0,0%,50%) 
    // or we can just emit a comment that the project should use postcss-preset-env.
    // Wait, let's parse the L value from OKLCH. L is from 0 to 1.
    const parts = vals.split(' ');
    const l = parseFloat(parts[0]);
    const lightness = Math.round(l * 100);
    return `${varName}: hsl(0, 0%, ${lightness}%);\n  ${match}`;
});

fs.writeFileSync('src/app/globals.css', css);
console.log('OKLCH fallbacks added.');
