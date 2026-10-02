import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = ts.transpileModule(readFileSync(new URL("../src/components/MathRenderer.tsx", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;
const compiled = { exports: {} };
new Function("module", "exports", "require", source)(compiled, compiled.exports, require);
const { renderMathMarkdown } = compiled.exports;

test("raw user/AI HTML is escaped, including in headings and code", () => {
    const html = renderMathMarkdown('# <img src=x onerror="alert(1)">\n<script>alert(2)</script>\n`<svg onload="alert(3)">`\n```html\n<iframe srcdoc="hello"></iframe>\n```');
    assert.doesNotMatch(html, /<(?:img|script|svg|iframe)\b/i);
    assert.match(html, /&lt;img/);
    assert.match(html, /&lt;script/);
    assert.match(html, /<code class="md-inline-code">&lt;svg/);
    assert.match(html, /<pre class="md-code-block"><code class="language-html">&lt;iframe/);
});

test("links accept safe schemes and local paths but reject executable URLs", () => {
    for (const url of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,hello", "vbscript:msgbox(1)", "jav&#x61;script:alert(1)"]) {
        assert.doesNotMatch(renderMathMarkdown(`[link](${url})`), /<a\b/, url);
    }
    for (const url of ["https://example.com/?a=1&b=2", "http://example.com", "mailto:hello@example.com", "/library?grade=10", "#energy"]) {
        const html = renderMathMarkdown(`[link](${url})`);
        assert.match(html, /<a href=/, url);
        assert.match(html, /rel="noopener noreferrer"/);
    }
    assert.doesNotMatch(renderMathMarkdown('[link](https://example.com/" onmouseover="alert(1))'), /<a\b/);
    assert.doesNotMatch(renderMathMarkdown('[link](https://example.com/`code`)'), /<a\b/);
    assert.doesNotMatch(renderMathMarkdown('[link](https://example.com/$x$)'), /<a\b/);
});

test("KaTeX keeps ordinary formulas while refusing trusted HTML extensions", () => {
    const math = renderMathMarkdown('Energy: $E=mc^2$.\n$$F=ma$$');
    assert.match(math, /class="katex"/);
    assert.match(math, /class="math-display"/);
    const unsafe = renderMathMarkdown(String.raw`$\href{javascript:alert(1)}{click}$ $\htmlClass{attacker}{x}$ $\includegraphics{https://example.com/image.png}$`);
    assert.doesNotMatch(unsafe, /<a\b|<img\b|class="attacker"/);
});

test("supported Markdown remains formatted and code remains literal", () => {
    const html = renderMathMarkdown('## Chuyển động\n**Đậm** và *nghiêng*\n> Gợi ý\n- Mục một\n- Mục hai\n`**giữ nguyên**`\n[Thư viện](/library)');
    assert.match(html, /<h2 class="md-heading md-h2">Chuyển động<\/h2>/);
    assert.match(html, /<strong>Đậm<\/strong>/);
    assert.match(html, /<em>nghiêng<\/em>/);
    assert.match(html, /<blockquote class="md-blockquote">/);
    assert.match(html, /<ul class="md-list">/);
    assert.match(html, /<code class="md-inline-code">\*\*giữ nguyên\*\*<\/code>/);
    assert.match(html, /<a href="\/library"/);
});
