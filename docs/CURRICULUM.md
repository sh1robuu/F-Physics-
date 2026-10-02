# Curriculum alignment

Reviewed 15 September 2026. G-Physics uses the Physics curriculum attached to Circular 32/2018/TT-BGDĐT (GDPT 2018). This is a learning map, not a universal textbook chapter sequence.

## Scope

- Grade 10: scientific practice; kinematics; dynamics; work/energy/power; momentum; circular motion; deformation.
- Grade 11: oscillations; waves; electric fields; current and circuits.
- Grade 12: thermal physics; ideal gases; magnetism/induction; nuclear physics/radioactivity.
- Specialist strands: careers, astronomy, environment (10); gravitation, radio communication, electronics (11); alternating current, medical imaging, quantum physics (12).

Basic AC generation and quantities remain within Grade 12 magnetism. RLC investigation, transformers and rectification belong to the specialist strand. Do not move all AC material out of the core curriculum. Oscillations and waves belong in Grade 11; thermal physics and ideal gases belong in Grade 12.

## Sources

- [Ministry-authored Physics curriculum, official Hải Phòng school publication](https://thcsandong.haiphong.edu.vn/van-ban-nganh/chuong-trinh-giao-duc-pho-thong-mon-vat-li-ban-hanh-kem-theo-thong-tu-so-322018/ctmb/20405/91189), [attached PDF](https://admintruong.haiphong.shieldix.app/data/haiphong/thcsandong/2023_5/31/12-ctvat-li_315202322.pdf). Pages 8–9: strands; 10–31: requirements. Page 4 permits flexible ordering.
- [Circular 17/2025/TT-BGDĐT](https://vanban.chinhphu.vn/?docid=215347&pageid=27160): amendments concern History, Geography and Civic Education, not Physics. [Government explanation](https://xaydungchinhsach.chinhphu.vn/thong-tu-so-17-2025-tt-bgddt-sua-doi-bo-sung-mot-so-noi-dung-trong-chuong-trinh-giao-duc-pho-thong-119250916145653739.htm).
- [August 2026 draft amendment](https://xaydungchinhsach.chinhphu.vn/toan-van-du-thao-thong-tu-sua-doi-bo-sung-mot-so-noi-dung-trong-chuong-trinh-giao-duc-pho-thong-119260820174117596.htm): foreign-language education; a draft, not a new Physics syllabus.

## Product content

The bilingual summaries, lesson groupings, formulas and practice questions are original G-Physics learning material. They are not Ministry-issued questions, a complete textbook, or an official exam bank. Specialist strands are listed for orientation; the starter practice bank covers the main strands. Formula conditions are stated where required.

The previous Grade 12 bank is preserved in `src/lib/data/legacyQuestionBank.ts` for editorial reference and is not imported by the current practice flow. Its old source comments and curriculum classifications have not been independently verified. New questions carry explicit grade and stable topic IDs. Practice sets use available questions without duplication; their displayed count and normalized score must reflect the actual set.

The starter bank contains 60 original Vietnamese exercises: 28 for Grade 10, 16 for Grade 11 and 16 for Grade 12. Every main topic has two multiple-choice questions, one four-statement true/false question and one numerical question. A mixed set currently contains 24, 16 or 16 questions respectively; topic sets contain four. Specialist topics are not included in these sets. Expansion should add genuinely different questions rather than copies with changed numbers.

## Validation

Run `node --test tests/question-bank.test.mjs`. Tests verify complete topic coverage, unique question IDs/text, answer structure, grade/topic isolation, set limits, nonmutation, independently calculated numerical answers and KaTeX formula rendering. The data modules also pass strict standalone TypeScript checking and ESLint. The numerical check is not a substitute for editorial review of the full bank before use for high-stakes assessment.
