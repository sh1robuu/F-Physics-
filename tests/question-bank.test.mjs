import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";
import katex from "katex";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));

// Run the real data modules without adding a test-runner dependency or changing
// the app's bundler-oriented TypeScript configuration.
const cache = new Map();
function loadDataModule(filename) {
    const fullPath = path.resolve(testDirectory, "../src/lib/data", filename);
    if (cache.has(fullPath)) return cache.get(fullPath);
    const output = ts.transpileModule(readFileSync(fullPath, "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const compiledModule = { exports: {} };
    const localRequire = (name) => {
        if (name === "./curriculum") return loadDataModule("curriculum.ts");
        throw new Error(`Unexpected data-module dependency: ${name}`);
    };
    new Function("module", "exports", "require", output)(compiledModule, compiledModule.exports, localRequire);
    cache.set(fullPath, compiledModule.exports);
    return compiledModule.exports;
}
const { GRADES, getGradeCurriculum } = loadDataModule("curriculum.ts");
const { questionBank, getQuestionsForGrade, generateExam, getChapterNames } = loadDataModule("questionBank.ts");

test("all 15 curriculum strands have distinct exercises of every supported type", () => {
    assert.equal(questionBank.length, 60);
    assert.equal(new Set(questionBank.map((q) => q.id)).size, 60);
    assert.equal(new Set(questionBank.map((q) => q.text)).size, 60);
    for (const grade of GRADES) {
        const { topics } = getGradeCurriculum(grade);
        assert.equal(topics.length, grade === 10 ? 7 : 4);
        assert.equal(getQuestionsForGrade(grade).length, topics.length * 4);
        topics.forEach((topic, index) => {
            assert.equal(getChapterNames(grade)[index + 1], topic.title);
            const questions = getQuestionsForGrade(grade).filter((q) => q.topicId === topic.id);
            assert.deepEqual(questions.map((q) => q.type).sort(), ["mcq", "mcq", "short", "tf"]);
            assert.ok(questions.every((q) => q.chapter === index + 1 && q.grade === grade));
            assert.ok(topic.summary && topic.summaryEn && topic.prompt && topic.promptEn);
            assert.equal(topic.lessons.length, topic.lessonsEn.length);
        });
    }
});

test("answer structure is valid and every exercise has an explanation", () => {
    for (const q of questionBank) {
        assert.ok(q.explanation.length > 15, q.id);
        if (q.type === "mcq") {
            assert.equal(q.options.map((o) => o.key).join(""), "ABCD");
            assert.equal(new Set(q.options.map((o) => o.text)).size, 4);
            assert.equal(q.options.filter((o) => o.key === q.correctAnswer).length, 1);
        } else if (q.type === "tf") {
            assert.equal(q.statements.map((s) => s.key).join(""), "abcd");
            assert.ok(q.statements.every((s) => typeof s.correct === "boolean"));
        } else {
            assert.ok(Number.isFinite(q.correctAnswer));
            assert.ok(Number.isFinite(q.tolerance) && q.tolerance >= 0);
        }
    }
});

test("generated sets cannot mix grades, duplicate questions or mutate the bank", () => {
    const snapshot = JSON.stringify(questionBank);
    for (let repeat = 0; repeat < 20; repeat++) {
        for (const grade of GRADES) {
            const mixed = generateExam(undefined, grade);
            assert.equal(mixed.length, grade === 10 ? 24 : 16);
            assert.ok(mixed.every((q) => q.grade === grade));
            assert.equal(new Set(mixed.map((q) => q.id)).size, mixed.length);
            for (const [type, limit] of [["mcq", 18], ["tf", 4], ["short", 6]]) {
                assert.ok(mixed.filter((q) => q.type === type).length <= limit);
            }
            getGradeCurriculum(grade).topics.forEach((topic, i) => {
                const selected = generateExam(i + 1, grade);
                assert.equal(selected.length, 4);
                assert.ok(selected.every((q) => q.grade === grade && q.topicId === topic.id));
                assert.equal(new Set(selected.map((q) => q.id)).size, 4);
            });
            assert.deepEqual(generateExam(999, grade), []);
            assert.deepEqual(generateExam(0, grade), []);
        }
    }
    assert.ok(generateExam().every((q) => q.grade === 12));
    assert.equal(JSON.stringify(questionBank), snapshot);
});

test("short-answer keys agree with independently calculated physical quantities", () => {
    const expected = {
        "g10-scientific-practice-s1": (1.8 + 2 + 2.2) / 3,
        "g10-kinematics-s1": 0.5 * 10 * 2 ** 2,
        "g10-dynamics-s1": 12 * 0.25,
        "g10-work-energy-power-s1": 3600 / 12,
        "g10-momentum-s1": 15 * 0.2,
        "g10-circular-motion-s1": 0.5 * 4 ** 2 / 2,
        "g10-solid-deformation-s1": 3 / (1.5 / 100),
        "g11-oscillations-s1": 5 * 0.04,
        "g11-waves-s1": (600e-9 * 2 / 0.001) * 1000,
        "g11-electric-field-s1": 100 / 0.02,
        "g11-current-circuits-s1": 9 - 2 * 0.5,
        "g12-thermal-physics-s1": 0.1 * 334,
        "g12-ideal-gases-s1": 8.31 * 300 / 0.024 / 1000,
        "g12-magnetic-field-s1": 0.3 * 0.02 * 1000,
        "g12-nuclear-physics-s1": 800 / (2 ** (9 / 3)),
    };
    const shorts = questionBank.filter((q) => q.type === "short");
    assert.equal(shorts.length, Object.keys(expected).length);
    shorts.forEach((q) => {
        assert.ok(q.id in expected, q.id);
        assert.ok(Math.abs(q.correctAnswer - expected[q.id]) <= q.tolerance + 1e-10, q.id);
    });
});

test("all inline formulas in curriculum and question text render with KaTeX", () => {
    const values = [
        ...questionBank.flatMap((q) => [q.text, q.explanation, ...(q.type === "mcq" ? q.options.map((o) => o.text) : q.type === "tf" ? q.statements.map((s) => s.text) : [])]),
        ...GRADES.flatMap((grade) => getGradeCurriculum(grade).topics.flatMap((t) => t.formulas)),
    ];
    for (const value of values) {
        for (const match of value.matchAll(/\$([^$]+)\$/g)) {
            assert.doesNotThrow(() => katex.renderToString(match[1], { throwOnError: true }), value);
        }
    }
});
