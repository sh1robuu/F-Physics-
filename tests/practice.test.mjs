import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";

const libraryDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/lib");
const modules = new Map();

// Exercise the production TypeScript without adding a runtime dependency or
// changing Next's bundler-oriented tsconfig. Type-only imports are erased.
function loadModule(filename) {
    const fullPath = path.resolve(libraryDirectory, filename);
    if (modules.has(fullPath)) return modules.get(fullPath);
    const source = ts.transpileModule(readFileSync(fullPath, "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const compiledModule = { exports: {} };
    const localRequire = (name) => {
        if (name === "./curriculum") return loadModule("data/curriculum.ts");
        throw new Error(`Unexpected practice dependency: ${name}`);
    };
    new Function("module", "exports", "require", source)(compiledModule, compiledModule.exports, localRequire);
    modules.set(fullPath, compiledModule.exports);
    return compiledModule.exports;
}

const { parseNumericAnswer, isQuestionAnswered, scoreQuestion, scorePractice, getPracticeMinutes } = loadModule("practice.ts");
const { generateExam, getQuestionsForGrade } = loadModule("data/questionBank.ts");
const { GRADES, getGradeCurriculum } = loadModule("data/curriculum.ts");
const emptyAnswers = () => ({ mcq: {}, tf: {}, short: {} });
const base = { grade: 10, chapter: 1, topicId: "test-topic", text: "Test question", explanation: "Explanation" };
const mcq = { ...base, id: "mcq", type: "mcq", options: [{ key: "A", text: "First" }, { key: "B", text: "Second" }], correctAnswer: "B" };
const short = { ...base, id: "short", type: "short", correctAnswer: 3.14, tolerance: 0.01 };
const tf = {
    ...base, id: "tf", type: "tf",
    statements: [
        { key: "a", text: "One", correct: false },
        { key: "b", text: "Two", correct: true },
        { key: "c", text: "Three", correct: false },
        { key: "d", text: "Four", correct: true },
    ],
};

function correctAnswers(questions) {
    const answers = emptyAnswers();
    for (const question of questions) {
        if (question.type === "mcq") answers.mcq[question.id] = question.correctAnswer;
        else if (question.type === "tf") answers.tf[question.id] = Object.fromEntries(question.statements.map((statement) => [statement.key, statement.correct]));
        else answers.short[question.id] = String(question.correctAnswer);
    }
    return answers;
}

test("numerical answers accept decimal commas, zero and scientific notation without partial parsing", () => {
    for (const [input, expected] of [["0", 0], [" 0,00 ", 0], ["3,14", 3.14], ["-2.5", -2.5], ["+.5", 0.5], ["-1,2e3", -1200], ["2E-2", 0.02]]) {
        assert.equal(parseNumericAnswer(input), expected, input);
    }
    for (const input of ["", " ", ".", ",", "3,14 cm", "3.14.5", "1,2,3", "12abc", "0x10", "1 000", "Infinity", "NaN", "1e999", "--3", "2/3"]) {
        assert.ok(Number.isNaN(parseNumericAnswer(input)), `must reject ${JSON.stringify(input)}`);
    }
});

test("blank or malformed short answers never earn points for an expected zero", () => {
    const zeroQuestion = { ...short, correctAnswer: 0, tolerance: 0 };
    for (const input of [undefined, "", " ", "oops", "0 cm", "0x0"]) {
        const answers = emptyAnswers();
        if (input !== undefined) answers.short[zeroQuestion.id] = input;
        assert.equal(scoreQuestion(zeroQuestion, answers).rawScore, 0, String(input));
        assert.equal(scoreQuestion(zeroQuestion, answers).correct, false, String(input));
    }
    for (const input of ["0", "0,0", "-0"]) {
        const answers = emptyAnswers(); answers.short[zeroQuestion.id] = input;
        assert.equal(scoreQuestion(zeroQuestion, answers).rawScore, 0.5);
        assert.equal(isQuestionAnswered(zeroQuestion, answers), true);
    }
});

test("short-answer tolerance includes its boundary but rejects values beyond it", () => {
    for (const input of ["3,14", "3.15", "3.13"]) {
        const answers = emptyAnswers(); answers.short[short.id] = input;
        assert.equal(scoreQuestion(short, answers).correct, true, input);
    }
    for (const input of ["3.151", "3,129", "3.14 meters"]) {
        const answers = emptyAnswers(); answers.short[short.id] = input;
        assert.equal(scoreQuestion(short, answers).correct, false, input);
    }
});

test("True/False scoring awards partial credit and never treats missing choices as false", () => {
    const expectedPoints = [0, 0.1, 0.25, 0.5, 1];
    for (let correctCount = 0; correctCount <= 4; correctCount++) {
        const answers = emptyAnswers();
        answers.tf[tf.id] = Object.fromEntries(tf.statements.slice(0, correctCount).map((statement) => [statement.key, statement.correct]));
        const result = scoreQuestion(tf, answers);
        assert.equal(result.correctStatements, correctCount);
        assert.equal(result.rawScore, expectedPoints[correctCount]);
        assert.equal(result.correct, correctCount === 4);
        assert.equal(isQuestionAnswered(tf, answers), correctCount === 4);
    }
    const allWrong = emptyAnswers();
    allWrong.tf[tf.id] = Object.fromEntries(tf.statements.map((statement) => [statement.key, !statement.correct]));
    assert.equal(scoreQuestion(tf, allWrong).rawScore, 0);
    assert.equal(isQuestionAnswered(tf, allWrong), true, "completed is distinct from correct");
    const unrelatedKeys = emptyAnswers();
    unrelatedKeys.tf[tf.id] = { a: false, b: true, c: false, unrelated: true };
    assert.equal(isQuestionAnswered(tf, unrelatedKeys), false, "four properties are not necessarily four valid answers");
    assert.equal(scoreQuestion(tf, unrelatedKeys).correctStatements, 3);
});

test("short topic sets normalize their actual maximum to ten rather than an assumed full paper", () => {
    const questions = [mcq, { ...mcq, id: "mcq-2" }, tf, short];
    const perfect = scorePractice(questions, correctAnswers(questions));
    assert.equal(perfect.maxScore, 2);
    assert.equal(perfect.rawScore, 2);
    assert.equal(perfect.score, 10);
    assert.deepEqual(perfect.sections.map((section) => section.count), [2, 1, 1]);

    const partial = emptyAnswers();
    partial.mcq[mcq.id] = "B";
    partial.tf[tf.id] = { a: false, b: true };
    partial.short[short.id] = "3,14";
    const result = scorePractice(questions, partial);
    assert.equal(result.rawScore, 1);
    assert.equal(result.score, 5);
    assert.equal(result.answered, 2, "a partly answered True/False item remains unfinished");
    assert.deepEqual(result.sections.map((section) => section.rawScore), [0.25, 0.25, 0.5]);
    assert.equal(scorePractice([mcq], correctAnswers([mcq])).score, 10, "a single-type set also normalizes correctly");
});

test("empty and entirely unanswered sets return finite zero scores", () => {
    for (const questions of [[], [mcq, tf, short]]) {
        const result = scorePractice(questions, emptyAnswers());
        assert.equal(result.score, 0);
        assert.equal(result.rawScore, 0);
        assert.equal(result.answered, 0);
        assert.ok(Number.isFinite(result.score));
    }
});

test("real sets for every grade and topic score perfect answers as ten without mutating the attempt", () => {
    for (const grade of GRADES) {
        const chapters = [undefined, ...getGradeCurriculum(grade).topics.map((_, index) => index + 1)];
        for (const chapter of chapters) {
            const questions = generateExam(chapter, grade);
            const answers = correctAnswers(questions);
            const before = JSON.stringify({ questions, answers });
            const result = scorePractice(questions, answers);
            assert.equal(result.score, 10, `grade ${grade}, chapter ${chapter ?? "all"}`);
            assert.equal(result.answered, questions.length);
            assert.equal(scorePractice(questions, emptyAnswers()).score, 0);
            assert.equal(JSON.stringify({ questions, answers }), before);
            // Visiting another grade must not change the captured set or scores.
            for (const otherGrade of GRADES) getQuestionsForGrade(otherGrade);
            assert.ok(questions.every((question) => question.grade === grade));
            assert.equal(scorePractice(questions, answers).score, 10);
        }
    }
});

test("practice duration scales with actual response count including four True/False statements", () => {
    assert.equal(getPracticeMinutes([mcq, { ...mcq, id: "mcq-2" }, tf, short]), 9);
    assert.equal(getPracticeMinutes(generateExam(undefined, 10)), 45);
    assert.equal(getPracticeMinutes(generateExam(undefined, 11)), 35);
    assert.equal(getPracticeMinutes(generateExam(undefined, 12)), 35);
    assert.equal(getPracticeMinutes([mcq]), 5, "short sessions retain a five-minute minimum");
    assert.equal(getPracticeMinutes([
        ...Array.from({ length: 18 }, (_, index) => ({ ...mcq, id: `m${index}` })),
        ...Array.from({ length: 4 }, (_, index) => ({ ...tf, id: `t${index}` })),
        ...Array.from({ length: 6 }, (_, index) => ({ ...short, id: `s${index}` })),
    ]), 50);
});
