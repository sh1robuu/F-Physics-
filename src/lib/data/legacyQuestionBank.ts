// ═══════════════════════════════════════════════════════════════
// NGÂN HÀNG CÂU HỎI VẬT LÝ 12 — THPT QUỐC GIA 2025
// Nguồn tham khảo: VietJack, HOCMAI, Loigiaihay, đề minh họa Bộ GD&ĐT
// ═══════════════════════════════════════════════════════════════

export interface MCQQuestion {
    id: string;
    type: "mcq";
    chapter: number;
    text: string;
    options: { key: string; text: string }[];
    correctAnswer: string;
    explanation: string;
}

export interface TFQuestion {
    id: string;
    type: "tf";
    chapter: number;
    text: string;
    statements: { key: string; text: string; correct: boolean }[];
    explanation: string;
}

export interface ShortAnswer {
    id: string;
    type: "short";
    chapter: number;
    text: string;
    correctAnswer: number;
    tolerance: number;
    explanation: string;
}

export type Question = MCQQuestion | TFQuestion | ShortAnswer;

// ──────────────────────────────────────────────────
// CHƯƠNG 1: DAO ĐỘNG CƠ
// ──────────────────────────────────────────────────
const ch1_mcq: MCQQuestion[] = [
    {
        id: "c1m1", type: "mcq", chapter: 1,
        text: "Một vật dao động điều hòa với phương trình $x = 5\\cos(2\\pi t)$ (cm). Biên độ dao động là",
        options: [
            { key: "A", text: "2π cm" }, { key: "B", text: "5 cm" },
            { key: "C", text: "10 cm" }, { key: "D", text: "π cm" },
        ],
        correctAnswer: "B",
        explanation: "So sánh $x = A\\cos(\\omega t + \\varphi)$, ta có $A = 5$ cm.",
    },
    {
        id: "c1m2", type: "mcq", chapter: 1,
        text: "Trong dao động điều hòa, gia tốc và li độ",
        options: [
            { key: "A", text: "cùng pha" }, { key: "B", text: "ngược pha" },
            { key: "C", text: "vuông pha" }, { key: "D", text: "lệch pha $\\dfrac{\\pi}{4}$" },
        ],
        correctAnswer: "B",
        explanation: "$a = -\\omega^2 x$ → $a$ luôn ngược dấu $x$ → ngược pha.",
    },
    {
        id: "c1m3", type: "mcq", chapter: 1,
        text: "Chu kỳ dao động của con lắc đơn phụ thuộc vào",
        options: [
            { key: "A", text: "khối lượng quả nặng" },
            { key: "B", text: "biên độ dao động" },
            { key: "C", text: "chiều dài dây treo và gia tốc trọng trường" },
            { key: "D", text: "hình dạng quả nặng" },
        ],
        correctAnswer: "C",
        explanation: "$T = 2\\pi\\sqrt{l/g}$. Chỉ phụ thuộc $l$ và $g$.",
    },
    {
        id: "c1m4", type: "mcq", chapter: 1,
        text: "Năng lượng của con lắc lò xo dao động điều hòa",
        options: [
            { key: "A", text: "tỉ lệ với biên độ" },
            { key: "B", text: "tỉ lệ với bình phương biên độ" },
            { key: "C", text: "tỉ lệ với tần số" },
            { key: "D", text: "thay đổi theo thời gian" },
        ],
        correctAnswer: "B",
        explanation: "$W = \\frac{1}{2}kA^2$, tỉ lệ $A^2$ và bảo toàn.",
    },
    {
        id: "c1m5", type: "mcq", chapter: 1,
        text: "Con lắc lò xo treo thẳng đứng, tại VTCB lò xo dãn $\\Delta l = 4$ cm. Lấy $g = 10$ m/s², $\\pi^2 = 10$. Chu kỳ dao động là",
        options: [
            { key: "A", text: "0,2 s" }, { key: "B", text: "0,4 s" },
            { key: "C", text: "0,5 s" }, { key: "D", text: "0,1 s" },
        ],
        correctAnswer: "B",
        explanation: "$T = 2\\pi\\sqrt{\\Delta l/g} = 2\\pi\\sqrt{0{,}04/10} = 2\\pi \\times 0{,}0632 \\approx 0{,}4$ s.",
    },
    {
        id: "c1m6", type: "mcq", chapter: 1,
        text: "Tần số góc của con lắc lò xo có $k$ và $m$ là",
        options: [
            { key: "A", text: "$\\omega = \\sqrt{k/m}$" },
            { key: "B", text: "$\\omega = \\sqrt{m/k}$" },
            { key: "C", text: "$\\omega = 2\\pi\\sqrt{k/m}$" },
            { key: "D", text: "$\\omega = k/m$" },
        ],
        correctAnswer: "A",
        explanation: "Công thức trực tiếp: $\\omega = \\sqrt{k/m}$.",
    },
    {
        id: "c1m7", type: "mcq", chapter: 1,
        text: "Cộng hưởng cơ xảy ra khi",
        options: [
            { key: "A", text: "tần số cưỡng bức bằng tần số riêng" },
            { key: "B", text: "biên độ cưỡng bức bằng biên độ riêng" },
            { key: "C", text: "lực cản bằng 0" },
            { key: "D", text: "chu kỳ cưỡng bức gấp đôi chu kỳ riêng" },
        ],
        correctAnswer: "A",
        explanation: "Cộng hưởng: $f_{cb} = f_0$, khi đó biên độ dao động cưỡng bức đạt cực đại.",
    },
    {
        id: "c1m8", type: "mcq", chapter: 1,
        text: "Vật dao động điều hòa, khi vật đi qua vị trí cân bằng thì",
        options: [
            { key: "A", text: "vận tốc bằng 0, gia tốc cực đại" },
            { key: "B", text: "vận tốc cực đại, gia tốc bằng 0" },
            { key: "C", text: "vận tốc và gia tốc đều cực đại" },
            { key: "D", text: "vận tốc và gia tốc đều bằng 0" },
        ],
        correctAnswer: "B",
        explanation: "Tại VTCB: $x = 0 \\Rightarrow a = -\\omega^2 x = 0$ và $v = v_{max} = \\omega A$.",
    },
];

const ch1_tf: TFQuestion[] = [
    {
        id: "c1t1", type: "tf", chapter: 1,
        text: "Một con lắc lò xo dao động điều hòa với phương trình $x = 4\\cos(5\\pi t)$ (cm). Phát biểu nào đúng?",
        statements: [
            { key: "a", text: "Biên độ dao động là 4 cm", correct: true },
            { key: "b", text: "Tần số góc là $5\\pi$ rad/s", correct: true },
            { key: "c", text: "Chu kỳ dao động là 0,2 s", correct: false },
            { key: "d", text: "Tốc độ cực đại là $20\\pi$ cm/s", correct: true },
        ],
        explanation: "$A = 4$ cm → a) Đúng. $\\omega = 5\\pi$ → b) Đúng. $T = 2\\pi/\\omega = 2\\pi/(5\\pi) = 0{,}4$ s → c) Sai. $v_{max} = \\omega A = 5\\pi \\times 4 = 20\\pi$ cm/s → d) Đúng.",
    },
    {
        id: "c1t2", type: "tf", chapter: 1,
        text: "Về dao động cưỡng bức, phát biểu nào đúng?",
        statements: [
            { key: "a", text: "Biên độ phụ thuộc biên độ lực cưỡng bức", correct: true },
            { key: "b", text: "Tần số dao động cưỡng bức bằng tần số riêng của hệ", correct: false },
            { key: "c", text: "Cộng hưởng xảy ra khi tần số cưỡng bức bằng tần số riêng", correct: true },
            { key: "d", text: "Khi cộng hưởng, biên độ đạt giá trị cực đại", correct: true },
        ],
        explanation: "a) Đúng. b) Sai — tần số dao động cưỡng bức bằng tần số lực cưỡng bức. c,d) Đúng.",
    },
];

const ch1_short: ShortAnswer[] = [
    {
        id: "c1s1", type: "short", chapter: 1,
        text: "Con lắc lò xo có $k = 100$ N/m, $m = 0{,}25$ kg. Tần số dao động riêng là bao nhiêu Hz? (Lấy $\\pi^2 = 10$)",
        correctAnswer: 3.18, tolerance: 0.05,
        explanation: "$\\omega = \\sqrt{100/0{,}25} = 20$ rad/s. $f = 20/(2\\pi) \\approx 3{,}18$ Hz.",
    },
    {
        id: "c1s2", type: "short", chapter: 1,
        text: "Vật DĐĐH với $A = 10$ cm, $\\omega = 5$ rad/s. Tốc độ cực đại bằng bao nhiêu cm/s?",
        correctAnswer: 50, tolerance: 0,
        explanation: "$v_{max} = \\omega A = 5 \\times 10 = 50$ cm/s.",
    },
    {
        id: "c1s3", type: "short", chapter: 1,
        text: "Con lắc đơn $l = 1$ m, $g = 10$ m/s². Chu kỳ dao động nhỏ bằng bao nhiêu giây? (Lấy $\\pi = 3{,}14$)",
        correctAnswer: 1.99, tolerance: 0.05,
        explanation: "$T = 2\\pi\\sqrt{l/g} = 2\\pi\\sqrt{1/10} = 2\\pi/\\sqrt{10} \\approx 1{,}99$ s.",
    },
];

// ──────────────────────────────────────────────────
// CHƯƠNG 2: SÓNG CƠ
// ──────────────────────────────────────────────────
const ch2_mcq: MCQQuestion[] = [
    {
        id: "c2m1", type: "mcq", chapter: 2,
        text: "Sóng cơ không truyền được trong",
        options: [
            { key: "A", text: "chất rắn" }, { key: "B", text: "chất lỏng" },
            { key: "C", text: "chất khí" }, { key: "D", text: "chân không" },
        ],
        correctAnswer: "D",
        explanation: "Sóng cơ cần môi trường vật chất, không truyền được trong chân không.",
    },
    {
        id: "c2m2", type: "mcq", chapter: 2,
        text: "Trong giao thoa sóng, khoảng cách giữa hai cực đại liên tiếp trên đoạn S₁S₂ bằng",
        options: [
            { key: "A", text: "$\\lambda$" }, { key: "B", text: "$\\dfrac{\\lambda}{2}$" },
            { key: "C", text: "$2\\lambda$" }, { key: "D", text: "$\\dfrac{\\lambda}{4}$" },
        ],
        correctAnswer: "B",
        explanation: "Khoảng cách giữa hai cực đại liên tiếp bằng $\\lambda/2$.",
    },
    {
        id: "c2m3", type: "mcq", chapter: 2,
        text: "Tốc độ truyền sóng cơ phụ thuộc vào",
        options: [
            { key: "A", text: "tần số sóng" }, { key: "B", text: "bước sóng" },
            { key: "C", text: "biên độ sóng" }, { key: "D", text: "tính chất môi trường" },
        ],
        correctAnswer: "D",
        explanation: "Tốc độ truyền sóng phụ thuộc bản chất và tính chất môi trường.",
    },
    {
        id: "c2m4", type: "mcq", chapter: 2,
        text: "Sóng dừng trên dây hai đầu cố định, chiều dài dây thỏa mãn",
        options: [
            { key: "A", text: "$l = k\\lambda$" }, { key: "B", text: "$l = k\\dfrac{\\lambda}{2}$" },
            { key: "C", text: "$l = (2k+1)\\dfrac{\\lambda}{4}$" }, { key: "D", text: "$l = (k+\\frac{1}{2})\\lambda$" },
        ],
        correctAnswer: "B",
        explanation: "Dây hai đầu cố định: $l = k\\lambda/2$, $k = 1, 2, 3, ...$",
    },
    {
        id: "c2m5", type: "mcq", chapter: 2,
        text: "Sóng ngang là sóng có phương dao động",
        options: [
            { key: "A", text: "trùng với phương truyền sóng" },
            { key: "B", text: "vuông góc với phương truyền sóng" },
            { key: "C", text: "tạo góc 45° với phương truyền" },
            { key: "D", text: "bất kỳ" },
        ],
        correctAnswer: "B",
        explanation: "Sóng ngang: phương dao động vuông góc với phương truyền sóng.",
    },
    {
        id: "c2m6", type: "mcq", chapter: 2,
        text: "Hai nguồn cùng pha, khoảng cách hai nguồn 10 cm, $\\lambda = 4$ cm. Số đường cực đại trên đoạn nối hai nguồn là",
        options: [
            { key: "A", text: "3" }, { key: "B", text: "5" },
            { key: "C", text: "7" }, { key: "D", text: "9" },
        ],
        correctAnswer: "B",
        explanation: "$|k| \\leq d/\\lambda = 10/4 = 2{,}5$ → $k = -2, -1, 0, 1, 2$ → 5 đường.",
    },
];

const ch2_tf: TFQuestion[] = [
    {
        id: "c2t1", type: "tf", chapter: 2,
        text: "Về sóng cơ, phát biểu nào đúng?",
        statements: [
            { key: "a", text: "Sóng ngang truyền được trong lòng chất lỏng", correct: false },
            { key: "b", text: "Bước sóng là khoảng cách hai điểm gần nhất dao động cùng pha", correct: true },
            { key: "c", text: "Các phần tử môi trường di chuyển cùng sóng", correct: false },
            { key: "d", text: "Tần số sóng bằng tần số nguồn phát", correct: true },
        ],
        explanation: "a) Sai — sóng ngang chỉ truyền trên mặt chất lỏng. b) Đúng. c) Sai — phần tử dao động tại chỗ. d) Đúng.",
    },
];

const ch2_short: ShortAnswer[] = [
    {
        id: "c2s1", type: "short", chapter: 2,
        text: "Hai nguồn cùng pha, $\\lambda = 2$ cm. Điểm M cách hai nguồn $d_1 = 12$ cm, $d_2 = 18$ cm. M nằm trên cực đại bậc mấy?",
        correctAnswer: 3, tolerance: 0,
        explanation: "$d_2 - d_1 = 6 = 3\\lambda$ → cực đại bậc 3.",
    },
    {
        id: "c2s2", type: "short", chapter: 2,
        text: "Sóng dừng trên dây hai đầu cố định có 5 bụng sóng, $v = 4$ m/s, $f = 10$ Hz. Chiều dài dây bằng bao nhiêu m?",
        correctAnswer: 1, tolerance: 0,
        explanation: "$\\lambda = v/f = 0{,}4$ m. $l = 5 \\times \\lambda/2 = 1$ m.",
    },
];

// ──────────────────────────────────────────────────
// CHƯƠNG 3: DÒNG ĐIỆN XOAY CHIỀU
// ──────────────────────────────────────────────────
const ch3_mcq: MCQQuestion[] = [
    {
        id: "c3m1", type: "mcq", chapter: 3,
        text: "Đại lượng đặc trưng cho dòng điện xoay chiều là",
        options: [
            { key: "A", text: "giá trị tức thời" }, { key: "B", text: "giá trị cực đại" },
            { key: "C", text: "giá trị hiệu dụng" }, { key: "D", text: "giá trị trung bình" },
        ],
        correctAnswer: "C",
        explanation: "Giá trị hiệu dụng dùng để đo lường, ghi trên thiết bị điện.",
    },
    {
        id: "c3m2", type: "mcq", chapter: 3,
        text: "Mạch RLC nối tiếp xảy ra cộng hưởng khi",
        options: [
            { key: "A", text: "$Z_L > Z_C$" }, { key: "B", text: "$Z_L < Z_C$" },
            { key: "C", text: "$Z_L = Z_C$" }, { key: "D", text: "$R = Z_L + Z_C$" },
        ],
        correctAnswer: "C",
        explanation: "Cộng hưởng: $Z_L = Z_C \\Rightarrow Z = R$, $I_{max}$.",
    },
    {
        id: "c3m3", type: "mcq", chapter: 3,
        text: "Đơn vị của cảm kháng $Z_L$ là",
        options: [
            { key: "A", text: "Henry (H)" }, { key: "B", text: "Farad (F)" },
            { key: "C", text: "Ohm (Ω)" }, { key: "D", text: "Watt (W)" },
        ],
        correctAnswer: "C",
        explanation: "$Z_L = \\omega L$ có đơn vị Ohm (Ω).",
    },
    {
        id: "c3m4", type: "mcq", chapter: 3,
        text: "Công suất tiêu thụ của mạch RLC nối tiếp là",
        options: [
            { key: "A", text: "$P = UI$" }, { key: "B", text: "$P = UI\\cos\\varphi$" },
            { key: "C", text: "$P = I^2 Z$" }, { key: "D", text: "$P = U^2/Z$" },
        ],
        correctAnswer: "B",
        explanation: "$P = UI\\cos\\varphi = RI^2$. Chỉ $R$ tiêu thụ năng lượng.",
    },
    {
        id: "c3m5", type: "mcq", chapter: 3,
        text: "Trong mạch chỉ có tụ điện $C$, điện áp $u$ so với dòng điện $i$",
        options: [
            { key: "A", text: "cùng pha" }, { key: "B", text: "sớm pha $\\pi/2$" },
            { key: "C", text: "trễ pha $\\pi/2$" }, { key: "D", text: "ngược pha" },
        ],
        correctAnswer: "C",
        explanation: "Mạch chỉ có C: $u$ trễ pha $\\pi/2$ so với $i$ ($\\varphi = -\\pi/2$).",
    },
    {
        id: "c3m6", type: "mcq", chapter: 3,
        text: "Hệ số công suất mạch RLC nối tiếp bằng",
        options: [
            { key: "A", text: "$\\cos\\varphi = R/Z$" }, { key: "B", text: "$\\cos\\varphi = Z/R$" },
            { key: "C", text: "$\\cos\\varphi = Z_L/Z$" }, { key: "D", text: "$\\cos\\varphi = Z_C/Z$" },
        ],
        correctAnswer: "A",
        explanation: "$\\cos\\varphi = R/Z = U_R/U$.",
    },
    {
        id: "c3m7", type: "mcq", chapter: 3,
        text: "Đặt $u = 100\\sqrt{2}\\cos(100\\pi t)$ V vào mạch $R = 100\\Omega$, $Z_L = Z_C = 100\\Omega$. Cường độ hiệu dụng $I$ bằng",
        options: [
            { key: "A", text: "0,5 A" }, { key: "B", text: "1 A" },
            { key: "C", text: "$\\sqrt{2}$ A" }, { key: "D", text: "2 A" },
        ],
        correctAnswer: "B",
        explanation: "$Z_L = Z_C$ → cộng hưởng → $Z = R = 100\\Omega$. $I = U/Z = 100/100 = 1$ A.",
    },
    {
        id: "c3m8", type: "mcq", chapter: 3,
        text: "Trong mạch RLC nối tiếp, khi $Z_L > Z_C$ thì",
        options: [
            { key: "A", text: "u trễ pha so với i" }, { key: "B", text: "u sớm pha so với i" },
            { key: "C", text: "u cùng pha với i" }, { key: "D", text: "u ngược pha với i" },
        ],
        correctAnswer: "B",
        explanation: "$Z_L > Z_C \\Rightarrow \\tan\\varphi > 0 \\Rightarrow \\varphi > 0$ → u sớm pha hơn i.",
    },
];

const ch3_tf: TFQuestion[] = [
    {
        id: "c3t1", type: "tf", chapter: 3,
        text: "Mạch RLC nối tiếp có $R = 100\\Omega$, $Z_L = 200\\Omega$, $Z_C = 100\\Omega$:",
        statements: [
            { key: "a", text: "Tổng trở bằng $100\\sqrt{2}\\;\\Omega$", correct: true },
            { key: "b", text: "Điện áp sớm pha hơn dòng điện", correct: true },
            { key: "c", text: "Mạch xảy ra cộng hưởng", correct: false },
            { key: "d", text: "Hệ số công suất bằng $\\dfrac{\\sqrt{2}}{2}$", correct: true },
        ],
        explanation: "$Z = \\sqrt{100^2 + 100^2} = 100\\sqrt{2}$ → a) Đúng. $Z_L > Z_C$ → b) Đúng. c) Sai. $\\cos\\varphi = \\sqrt{2}/2$ → d) Đúng.",
    },
    {
        id: "c3t2", type: "tf", chapter: 3,
        text: "Về mạch điện xoay chiều chỉ có cuộn cảm thuần L:",
        statements: [
            { key: "a", text: "Cảm kháng $Z_L = \\omega L$", correct: true },
            { key: "b", text: "Dòng điện sớm pha $\\pi/2$ so với điện áp", correct: false },
            { key: "c", text: "Cuộn cảm không tiêu thụ năng lượng", correct: true },
            { key: "d", text: "Điện áp cực đại $U_0 = I_0 Z_L$", correct: true },
        ],
        explanation: "a) Đúng. b) Sai — $u$ sớm pha $\\pi/2$ so với $i$, tức $i$ trễ pha. c) Đúng. d) Đúng.",
    },
];

const ch3_short: ShortAnswer[] = [
    {
        id: "c3s1", type: "short", chapter: 3,
        text: "Mạch RLC: $R = 50\\Omega$, $Z_L = 50\\Omega$, $Z_C = 50\\Omega$. Tổng trở bằng bao nhiêu Ω?",
        correctAnswer: 50, tolerance: 0,
        explanation: "Cộng hưởng: $Z_L = Z_C \\Rightarrow Z = R = 50\\;\\Omega$.",
    },
    {
        id: "c3s2", type: "short", chapter: 3,
        text: "Mạch $R = 30\\Omega$, $Z_L = 40\\Omega$, $Z_C = 0$. Đặt $u = 100\\sqrt{2}\\cos(100\\pi t)$ V. Công suất bằng bao nhiêu W?",
        correctAnswer: 120, tolerance: 0,
        explanation: "$Z = \\sqrt{30^2 + 40^2} = 50\\;\\Omega$. $I = 100/50 = 2$ A. $P = RI^2 = 120$ W.",
    },
    {
        id: "c3s3", type: "short", chapter: 3,
        text: "Mạch RLC cộng hưởng, $R = 25\\Omega$, $U = 50$ V. Công suất tiêu thụ bằng bao nhiêu W?",
        correctAnswer: 100, tolerance: 0,
        explanation: "Cộng hưởng → $P = U^2/R = 2500/25 = 100$ W.",
    },
];

// ──────────────────────────────────────────────────
// CHƯƠNG 4: DAO ĐỘNG VÀ SÓNG ĐIỆN TỪ
// ──────────────────────────────────────────────────
const ch4_mcq: MCQQuestion[] = [
    {
        id: "c4m1", type: "mcq", chapter: 4,
        text: "Tần số riêng của mạch dao động LC lý tưởng là",
        options: [
            { key: "A", text: "$f = 2\\pi\\sqrt{LC}$" },
            { key: "B", text: "$f = \\dfrac{1}{2\\pi\\sqrt{LC}}$" },
            { key: "C", text: "$f = \\dfrac{1}{\\sqrt{LC}}$" },
            { key: "D", text: "$f = \\dfrac{\\sqrt{LC}}{2\\pi}$" },
        ],
        correctAnswer: "B",
        explanation: "$f = 1/(2\\pi\\sqrt{LC})$.",
    },
    {
        id: "c4m2", type: "mcq", chapter: 4,
        text: "Sóng điện từ KHÔNG có tính chất nào sau đây?",
        options: [
            { key: "A", text: "Truyền được trong chân không" },
            { key: "B", text: "Mang năng lượng" },
            { key: "C", text: "Cần môi trường vật chất để truyền" },
            { key: "D", text: "Là sóng ngang" },
        ],
        correctAnswer: "C",
        explanation: "Sóng điện từ truyền được trong chân không, KHÔNG cần môi trường vật chất.",
    },
    {
        id: "c4m3", type: "mcq", chapter: 4,
        text: "Trong mạch LC, năng lượng điện trường cực đại bằng",
        options: [
            { key: "A", text: "$W_{Cmax} = \\frac{1}{2}CU_0^2$" },
            { key: "B", text: "$W_{Cmax} = CU_0$" },
            { key: "C", text: "$W_{Cmax} = \\frac{1}{2}CU_0$" },
            { key: "D", text: "$W_{Cmax} = CU_0^2$" },
        ],
        correctAnswer: "A",
        explanation: "$W_{Cmax} = \\frac{1}{2}CU_0^2 = Q_0^2/(2C)$.",
    },
    {
        id: "c4m4", type: "mcq", chapter: 4,
        text: "Trong thang sóng điện từ, sóng nào có bước sóng lớn nhất?",
        options: [
            { key: "A", text: "Tia gamma" }, { key: "B", text: "Tia X" },
            { key: "C", text: "Ánh sáng nhìn thấy" }, { key: "D", text: "Sóng vô tuyến" },
        ],
        correctAnswer: "D",
        explanation: "Thứ tự tăng dần bước sóng: tia gamma → tia X → tia tử ngoại → ASNT → hồng ngoại → sóng vô tuyến.",
    },
];

const ch4_tf: TFQuestion[] = [
    {
        id: "c4t1", type: "tf", chapter: 4,
        text: "Về mạch dao động LC lý tưởng:",
        statements: [
            { key: "a", text: "Năng lượng điện từ được bảo toàn", correct: true },
            { key: "b", text: "NL điện trường và NL từ trường biến thiên cùng tần số với dòng điện", correct: false },
            { key: "c", text: "Khi NL điện trường cực đại thì NL từ trường bằng 0", correct: true },
            { key: "d", text: "Tần số góc $\\omega = 1/\\sqrt{LC}$", correct: true },
        ],
        explanation: "a) Đúng. b) Sai — NL điện trường/từ trường biến thiên với tần số gấp đôi. c) Đúng — $W = W_C + W_L = const$. d) Đúng.",
    },
];

const ch4_short: ShortAnswer[] = [
    {
        id: "c4s1", type: "short", chapter: 4,
        text: "Mạch LC có $L = 4$ mH, $C = 1$ μF. Tần số riêng bằng bao nhiêu Hz? (Lấy $\\pi \\approx 3{,}14$)",
        correctAnswer: 2517, tolerance: 20,
        explanation: "$f = 1/(2\\pi\\sqrt{LC}) = 1/(2\\pi\\sqrt{4 \\times 10^{-3} \\times 10^{-6}}) = 1/(2\\pi \\times 2 \\times 10^{-4.5}) \\approx 2517$ Hz.",
    },
];

// ──────────────────────────────────────────────────
// CHƯƠNG 5: SÓNG ÁNH SÁNG
// ──────────────────────────────────────────────────
const ch5_mcq: MCQQuestion[] = [
    {
        id: "c5m1", type: "mcq", chapter: 5,
        text: "Trong TN Young, khoảng vân $i$ được tính bằng",
        options: [
            { key: "A", text: "$i = aD/\\lambda$" }, { key: "B", text: "$i = \\lambda D/a$" },
            { key: "C", text: "$i = aD/(2\\lambda)$" }, { key: "D", text: "$i = 2\\lambda D/a$" },
        ],
        correctAnswer: "B",
        explanation: "$i = \\lambda D / a$.",
    },
    {
        id: "c5m2", type: "mcq", chapter: 5,
        text: "Hiện tượng tán sắc ánh sáng chứng tỏ",
        options: [
            { key: "A", text: "ánh sáng trắng là ánh sáng đơn sắc" },
            { key: "B", text: "ánh sáng trắng là tập hợp nhiều ánh sáng đơn sắc" },
            { key: "C", text: "lăng kính có tác dụng nhuộm màu ánh sáng" },
            { key: "D", text: "chiết suất của lăng kính không phụ thuộc bước sóng" },
        ],
        correctAnswer: "B",
        explanation: "Tán sắc chứng tỏ ánh sáng trắng gồm nhiều ánh sáng đơn sắc có bước sóng khác nhau.",
    },
    {
        id: "c5m3", type: "mcq", chapter: 5,
        text: "Ánh sáng đơn sắc có bước sóng dài nhất là",
        options: [
            { key: "A", text: "tím" }, { key: "B", text: "đỏ" },
            { key: "C", text: "lục" }, { key: "D", text: "vàng" },
        ],
        correctAnswer: "B",
        explanation: "Ánh sáng đỏ: $\\lambda \\approx 0{,}76$ μm — dài nhất trong vùng nhìn thấy.",
    },
    {
        id: "c5m4", type: "mcq", chapter: 5,
        text: "Tia tử ngoại có bước sóng",
        options: [
            { key: "A", text: "lớn hơn ánh sáng đỏ" },
            { key: "B", text: "nhỏ hơn ánh sáng tím" },
            { key: "C", text: "bằng ánh sáng vàng" },
            { key: "D", text: "bằng tia hồng ngoại" },
        ],
        correctAnswer: "B",
        explanation: "Tia tử ngoại: $\\lambda < 0{,}38$ μm (nhỏ hơn ánh sáng tím).",
    },
];

const ch5_tf: TFQuestion[] = [
    {
        id: "c5t1", type: "tf", chapter: 5,
        text: "TN Young: $a = 1$ mm, $D = 2$ m, $\\lambda = 0{,}5$ μm. Phát biểu nào đúng?",
        statements: [
            { key: "a", text: "Khoảng vân $i = 1$ mm", correct: true },
            { key: "b", text: "Vân sáng bậc 3 cách vân trung tâm 3 mm", correct: true },
            { key: "c", text: "Tại $x = 2{,}5$ mm có vân sáng", correct: false },
            { key: "d", text: "Tại $x = 2{,}5$ mm có vân tối", correct: true },
        ],
        explanation: "$i = \\lambda D/a = 0{,}5 \\times 10^{-6} \\times 2/(10^{-3}) = 10^{-3}$ m $= 1$ mm → a) Đúng. $x_3 = 3i = 3$ mm → b) Đúng. $x/i = 2{,}5$ → nửa nguyên → vân tối → c) Sai, d) Đúng.",
    },
];

const ch5_short: ShortAnswer[] = [
    {
        id: "c5s1", type: "short", chapter: 5,
        text: "TN Young: $a = 0{,}5$ mm, $D = 1$ m, $\\lambda = 0{,}6$ μm. Khoảng vân bằng bao nhiêu mm?",
        correctAnswer: 1.2, tolerance: 0.01,
        explanation: "$i = \\lambda D/a = 0{,}6 \\times 10^{-6} \\times 1/(0{,}5 \\times 10^{-3}) = 1{,}2 \\times 10^{-3}$ m $= 1{,}2$ mm.",
    },
    {
        id: "c5s2", type: "short", chapter: 5,
        text: "TN Young: $i = 0{,}8$ mm. Khoảng cách từ vân sáng bậc 2 đến vân sáng bậc 5 cùng phía bằng bao nhiêu mm?",
        correctAnswer: 2.4, tolerance: 0,
        explanation: "$\\Delta x = (5 - 2) \\times i = 3 \\times 0{,}8 = 2{,}4$ mm.",
    },
];

// ──────────────────────────────────────────────────
// CHƯƠNG 6: LƯỢNG TỬ ÁNH SÁNG
// ──────────────────────────────────────────────────
const ch6_mcq: MCQQuestion[] = [
    {
        id: "c6m1", type: "mcq", chapter: 6,
        text: "Năng lượng photon được tính bằng",
        options: [
            { key: "A", text: "$\\varepsilon = mc^2$" }, { key: "B", text: "$\\varepsilon = hf$" },
            { key: "C", text: "$\\varepsilon = \\frac{1}{2}mv^2$" }, { key: "D", text: "$\\varepsilon = qU$" },
        ],
        correctAnswer: "B",
        explanation: "$\\varepsilon = hf = hc/\\lambda$.",
    },
    {
        id: "c6m2", type: "mcq", chapter: 6,
        text: "Hiện tượng quang điện xảy ra khi",
        options: [
            { key: "A", text: "$\\lambda \\geq \\lambda_0$" }, { key: "B", text: "$\\lambda \\leq \\lambda_0$" },
            { key: "C", text: "$f \\leq f_0$" }, { key: "D", text: "$\\varepsilon \\leq A$" },
        ],
        correctAnswer: "B",
        explanation: "Điều kiện: $\\lambda \\leq \\lambda_0$ (hay $f \\geq f_0$, $\\varepsilon \\geq A$).",
    },
    {
        id: "c6m3", type: "mcq", chapter: 6,
        text: "Công thoát electron khỏi kim loại bằng",
        options: [
            { key: "A", text: "$A = hf$" }, { key: "B", text: "$A = hc/\\lambda_0$" },
            { key: "C", text: "$A = eU_h$" }, { key: "D", text: "$A = \\frac{1}{2}mv^2$" },
        ],
        correctAnswer: "B",
        explanation: "$A = hc/\\lambda_0$, với $\\lambda_0$ giới hạn quang điện.",
    },
    {
        id: "c6m4", type: "mcq", chapter: 6,
        text: "Dãy Banme nằm trong vùng",
        options: [
            { key: "A", text: "hồng ngoại" },
            { key: "B", text: "tử ngoại" },
            { key: "C", text: "ánh sáng nhìn thấy và một phần tử ngoại" },
            { key: "D", text: "tia X" },
        ],
        correctAnswer: "C",
        explanation: "Dãy Banme: vùng ASNT và một phần tử ngoại.",
    },
    {
        id: "c6m5", type: "mcq", chapter: 6,
        text: "Phương trình Anh-xtanh về hiện tượng quang điện là",
        options: [
            { key: "A", text: "$hf = A + W_{đmax}$" }, { key: "B", text: "$hf = A - W_{đmax}$" },
            { key: "C", text: "$hf = W_{đmax}$" }, { key: "D", text: "$A = W_{đmax}$" },
        ],
        correctAnswer: "A",
        explanation: "$\\varepsilon = A + W_{đmax}$ hay $hf = A + \\frac{1}{2}mv_0^2$.",
    },
];

const ch6_tf: TFQuestion[] = [
    {
        id: "c6t1", type: "tf", chapter: 6,
        text: "Kim loại có giới hạn quang điện $\\lambda_0 = 0{,}66$ μm. Chiếu ánh sáng $\\lambda = 0{,}44$ μm:",
        statements: [
            { key: "a", text: "Hiện tượng quang điện xảy ra", correct: true },
            { key: "b", text: "Năng lượng photon lớn hơn công thoát", correct: true },
            { key: "c", text: "Electron quang điện có động năng ban đầu cực đại bằng 0", correct: false },
            { key: "d", text: "Tăng cường độ ánh sáng thì số electron bật ra tăng", correct: true },
        ],
        explanation: "$\\lambda < \\lambda_0$ → a,b) Đúng. c) Sai — $W_{đmax} = hf - A > 0$. d) Đúng — cường độ tỉ lệ số photon.",
    },
];

const ch6_short: ShortAnswer[] = [
    {
        id: "c6s1", type: "short", chapter: 6,
        text: "Photon có bước sóng $\\lambda = 0{,}5$ μm. Năng lượng photon bằng bao nhiêu eV? ($h = 6{,}625 \\times 10^{-34}$ J·s, $c = 3 \\times 10^8$ m/s, $1$ eV $= 1{,}6 \\times 10^{-19}$ J)",
        correctAnswer: 2.48, tolerance: 0.05,
        explanation: "$\\varepsilon = hc/\\lambda = 6{,}625 \\times 10^{-34} \\times 3 \\times 10^8 / (0{,}5 \\times 10^{-6}) = 3{,}975 \\times 10^{-19}$ J $\\approx 2{,}48$ eV.",
    },
];

// ──────────────────────────────────────────────────
// CHƯƠNG 7: VẬT LÝ HẠT NHÂN
// ──────────────────────────────────────────────────
const ch7_mcq: MCQQuestion[] = [
    {
        id: "c7m1", type: "mcq", chapter: 7,
        text: "Hạt nhân ${}^{238}_{92}U$ có số nơtron là",
        options: [
            { key: "A", text: "92" }, { key: "B", text: "238" },
            { key: "C", text: "146" }, { key: "D", text: "330" },
        ],
        correctAnswer: "C",
        explanation: "$N = A - Z = 238 - 92 = 146$.",
    },
    {
        id: "c7m2", type: "mcq", chapter: 7,
        text: "Trong phóng xạ $\\beta^-$, hạt nhân con so với hạt nhân mẹ",
        options: [
            { key: "A", text: "số khối giảm 4, Z giảm 2" }, { key: "B", text: "A không đổi, Z tăng 1" },
            { key: "C", text: "A không đổi, Z giảm 1" }, { key: "D", text: "A giảm 4, Z không đổi" },
        ],
        correctAnswer: "B",
        explanation: "$\\beta^-$: ${}^A_Z X \\to {}^A_{Z+1} Y + {}^0_{-1}e$. $A$ giữ nguyên, $Z$ tăng 1.",
    },
    {
        id: "c7m3", type: "mcq", chapter: 7,
        text: "Năng lượng liên kết riêng là",
        options: [
            { key: "A", text: "$W_{lkr} = W_{lk} \\times A$" },
            { key: "B", text: "$W_{lkr} = W_{lk} / A$" },
            { key: "C", text: "$W_{lkr} = \\Delta m \\times A$" },
            { key: "D", text: "$W_{lkr} = A / W_{lk}$" },
        ],
        correctAnswer: "B",
        explanation: "$W_{lkr} = W_{lk}/A$. Hạt nhân có $W_{lkr}$ càng lớn càng bền vững.",
    },
    {
        id: "c7m4", type: "mcq", chapter: 7,
        text: "Hằng số phóng xạ liên hệ với chu kỳ bán rã bởi",
        options: [
            { key: "A", text: "$\\lambda = \\ln 2 / T$" }, { key: "B", text: "$\\lambda = T / \\ln 2$" },
            { key: "C", text: "$\\lambda = T \\ln 2$" }, { key: "D", text: "$\\lambda = 2T$" },
        ],
        correctAnswer: "A",
        explanation: "$\\lambda = \\ln 2 / T \\approx 0{,}693/T$.",
    },
    {
        id: "c7m5", type: "mcq", chapter: 7,
        text: "Phóng xạ $\\alpha$: hạt nhân con có $A$ và $Z$ so với hạt nhân mẹ là",
        options: [
            { key: "A", text: "A giảm 4, Z giảm 2" }, { key: "B", text: "A giảm 2, Z giảm 4" },
            { key: "C", text: "A giảm 4, Z giảm 4" }, { key: "D", text: "A không đổi, Z giảm 2" },
        ],
        correctAnswer: "A",
        explanation: "$\\alpha = {}^4_2He$: $A$ giảm 4, $Z$ giảm 2.",
    },
    {
        id: "c7m6", type: "mcq", chapter: 7,
        text: "Trong phản ứng hạt nhân, đại lượng nào KHÔNG bảo toàn?",
        options: [
            { key: "A", text: "Số khối" }, { key: "B", text: "Điện tích" },
            { key: "C", text: "Khối lượng nghỉ" }, { key: "D", text: "Năng lượng toàn phần" },
        ],
        correctAnswer: "C",
        explanation: "Khối lượng nghỉ không bảo toàn (có độ hụt khối). Bảo toàn: số khối, điện tích, năng lượng toàn phần.",
    },
];

const ch7_tf: TFQuestion[] = [
    {
        id: "c7t1", type: "tf", chapter: 7,
        text: "Chất phóng xạ có chu kỳ bán rã $T$. Sau thời gian $t = 2T$:",
        statements: [
            { key: "a", text: "Số nguyên tử còn lại bằng $N_0/4$", correct: true },
            { key: "b", text: "Khối lượng còn lại bằng $m_0/2$", correct: false },
            { key: "c", text: "Độ phóng xạ giảm còn $H_0/4$", correct: true },
            { key: "d", text: "Số hạt nhân bị phân rã bằng $3N_0/4$", correct: true },
        ],
        explanation: "$t = 2T$: $N = N_0/2^2 = N_0/4$ → a) Đúng. $m = m_0/4$ → b) Sai. $H = H_0/4$ → c) Đúng. $\\Delta N = N_0 - N_0/4 = 3N_0/4$ → d) Đúng.",
    },
    {
        id: "c7t2", type: "tf", chapter: 7,
        text: "Về phản ứng hạt nhân:",
        statements: [
            { key: "a", text: "Bảo toàn số khối: $A_1 + A_2 = A_3 + A_4$", correct: true },
            { key: "b", text: "Bảo toàn điện tích: $Z_1 + Z_2 = Z_3 + Z_4$", correct: true },
            { key: "c", text: "Bảo toàn khối lượng: $m_1 + m_2 = m_3 + m_4$", correct: false },
            { key: "d", text: "Nếu $m_1 + m_2 > m_3 + m_4$ thì phản ứng tỏa năng lượng", correct: true },
        ],
        explanation: "a,b) Đúng — các định luật bảo toàn. c) Sai — khối lượng nghỉ KHÔNG bảo toàn. d) Đúng — $W > 0$ → tỏa.",
    },
];

const ch7_short: ShortAnswer[] = [
    {
        id: "c7s1", type: "short", chapter: 7,
        text: "Chất phóng xạ có $T = 8$ ngày. Ban đầu có 16 g. Sau 24 ngày, khối lượng còn lại bằng bao nhiêu gam?",
        correctAnswer: 2, tolerance: 0,
        explanation: "$t/T = 24/8 = 3$ → $m = 16/2^3 = 2$ g.",
    },
    {
        id: "c7s2", type: "short", chapter: 7,
        text: "Hạt nhân ${}^{56}_{26}Fe$ có khối lượng $55{,}9207u$, $m_p = 1{,}0073u$, $m_n = 1{,}0087u$. Độ hụt khối bằng bao nhiêu u?",
        correctAnswer: 0.5285, tolerance: 0.005,
        explanation: "$\\Delta m = 26 \\times 1{,}0073 + 30 \\times 1{,}0087 - 55{,}9207 = 56{,}4492 - 55{,}9207 = 0{,}5285$ u.",
    },
];

// ═══════════════════════════════════════════════════
// EXPORT NGÂN HÀNG
// ═══════════════════════════════════════════════════
export const questionBank: Question[] = [
    ...ch1_mcq, ...ch1_tf, ...ch1_short,
    ...ch2_mcq, ...ch2_tf, ...ch2_short,
    ...ch3_mcq, ...ch3_tf, ...ch3_short,
    ...ch4_mcq, ...ch4_tf, ...ch4_short,
    ...ch5_mcq, ...ch5_tf, ...ch5_short,
    ...ch6_mcq, ...ch6_tf, ...ch6_short,
    ...ch7_mcq, ...ch7_tf, ...ch7_short,
];

// Helper to generate a random exam — optionally filtered by chapter
export function generateExam(chapter?: number): Question[] {
    const pool = chapter
        ? questionBank.filter((q) => q.chapter === chapter)
        : questionBank;

    const mcqs = pool.filter((q): q is MCQQuestion => q.type === "mcq");
    const tfs = pool.filter((q): q is TFQuestion => q.type === "tf");
    const shorts = pool.filter((q): q is ShortAnswer => q.type === "short");

    const shuffle = <T,>(arr: T[]): T[] => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    // When filtering by chapter, take all available; otherwise cap at THPT limits
    const mcqLimit = chapter ? mcqs.length : 18;
    const tfLimit = chapter ? tfs.length : 4;
    const shortLimit = chapter ? shorts.length : 6;

    return [
        ...shuffle(mcqs).slice(0, mcqLimit),
        ...shuffle(tfs).slice(0, tfLimit),
        ...shuffle(shorts).slice(0, shortLimit),
    ];
}

export const chapterNames: Record<number, string> = {
    1: "Dao động cơ",
    2: "Sóng cơ",
    3: "Dòng điện xoay chiều",
    4: "Dao động và sóng điện từ",
    5: "Sóng ánh sáng",
    6: "Lượng tử ánh sáng",
    7: "Vật lý hạt nhân",
};
