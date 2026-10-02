import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import ts from 'typescript';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const cache = new Map();
const calls = [];

function load(file) {
  const absolute = path.resolve(project, file);
  if (cache.has(absolute)) return cache.get(absolute).exports;
  const compiledModule = { exports: {} };
  cache.set(absolute, compiledModule);
  const javascript = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const localRequire = (specifier) => {
    if (specifier === './provider') return {
      generateCompletion: async (messages, config) => {
        calls.push({ messages, config });
        return '📊 **Chẩn đoán:**\n- Chủ đề: Động học\n- Khái niệm kiểm tra: Vận tốc trung bình\n- Điểm vướng mắc: Cần phân biệt quãng đường với độ dịch chuyển\n\n💡 Hãy chọn chiều dương.';
      },
    };
    if (specifier === 'next/server') return {
      NextResponse: { json: (data, options = {}) => ({ status: options.status || 200, data }) },
    };
    if (specifier.startsWith('@/')) return load(`src/${specifier.slice(2)}.ts`);
    if (specifier.startsWith('.')) return load(`${path.relative(project, path.resolve(path.dirname(absolute), specifier))}.ts`);
    return require(specifier);
  };
  vm.runInThisContext(`(function(require,module,exports){${javascript}\n})`, { filename: absolute })(localRequire, compiledModule, compiledModule.exports);
  return compiledModule.exports;
}

test('Tutor grade context, request validation and progression (mock provider)', async () => {
  const { getSystemPrompt } = load('src/lib/ai/prompts.ts');
  const { getGradeCurriculum } = load('src/lib/data/curriculum.ts');
  const { POST } = load('src/app/api/tutoring/route.ts');
  const { getNextMode } = load('src/lib/ai/engine.ts');
  for (const grade of [10, 11, 12]) {
    const prompt = getSystemPrompt('CONCEPT', { grade: String(grade), nickname: 'An', style: 'concise' });
    assert(prompt.includes(`Lớp đang chọn: ${grade}`));
    for (const topic of getGradeCurriculum(grade).topics) assert(prompt.includes(topic.title));
    for (const specialist of getGradeCurriculum(grade).specialistTopics) assert(prompt.includes(specialist));
    assert(prompt.includes('Gọi học sinh là "An"'));
  }
  const history = [{ role: 'user', content: 'Mình từng học lớp 12.' }, { role: 'assistant', content: 'Hãy chọn chủ đề.' }];
  const response = await POST({ json: async () => ({ question: 'Giải thích vận tốc trung bình', grade: 10, aiPrefs: { grade: '12' }, mode: 'AUTO', history, imageBase64: ['test-image'], model: 'existing-model' }) });
  assert.equal(response.status, 200);
  assert.equal(response.data.mode, 'AUTO');
  assert.equal(response.data.suggestedNextMode, 'GUIDED');
  assert.equal(response.data.isGrounded, false);
  assert.equal(response.data.confidence, undefined);
  assert.equal(response.data.diagnosis.topic, 'Động học');
  assert(calls[0].messages[0].content.includes('Lớp đang chọn: 10'));
  assert(calls[0].messages[0].content.includes('CHẾ ĐỘ HIỆN TẠI: TỰ ĐỘNG'));
  assert.deepEqual(calls[0].messages.slice(1, 3), history);
  assert.deepEqual(calls[0].messages.at(-1).images, ['test-image']);
  assert.equal(calls[0].config.model, 'existing-model');
  const invalid = await POST({ json: async () => ({ question: 'Test', grade: 9 }) });
  assert.equal(invalid.status, 400);
  assert.equal(calls.length, 1);
  assert.equal(getNextMode('HINT'), 'CONCEPT');
  assert.equal(getNextMode('GUIDED'), 'FULL_SOLUTION');
  assert.equal(getNextMode('FULL_SOLUTION'), null);
  console.log('PASS: grades 10/11/12, canonical core/specialist context, stale-grade override, AUTO and progression, history, images/model, diagnosis, honest grounding, invalid-grade rejection. Provider mocked; no external AI calls.');
});

