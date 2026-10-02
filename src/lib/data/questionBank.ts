import { getGradeCurriculum, type Grade } from "./curriculum";

interface QuestionBase {
    id: string;
    grade: Grade;
    topicId: string;
    /** One-based topic index within this grade. */
    chapter: number;
    text: string;
    explanation: string;
}
export interface MCQQuestion extends QuestionBase {
    type: "mcq";
    options: { key: string; text: string }[];
    correctAnswer: string;
}
export interface TFQuestion extends QuestionBase {
    type: "tf";
    statements: { key: string; text: string; correct: boolean }[];
}
export interface ShortAnswer extends QuestionBase {
    type: "short";
    correctAnswer: number;
    tolerance: number;
}
export type Question = MCQQuestion | TFQuestion | ShortAnswer;

function base(grade: Grade, chapter: number, suffix: string, text: string, explanation: string): QuestionBase {
    const topicId = getGradeCurriculum(grade).topics[chapter - 1].id;
    return { id: `g${grade}-${topicId}-${suffix}`, grade, topicId, chapter, text, explanation };
}
function mcq(grade: Grade, chapter: number, index: number, text: string, options: [string, string, string, string], answer: "A" | "B" | "C" | "D", explanation: string): MCQQuestion {
    return { ...base(grade, chapter, `m${index}`, text, explanation), type: "mcq", options: options.map((text, i) => ({ key: String.fromCharCode(65 + i), text })), correctAnswer: answer };
}
function tf(grade: Grade, chapter: number, text: string, statements: [string, boolean][], explanation: string): TFQuestion {
    return { ...base(grade, chapter, "t1", text, explanation), type: "tf", statements: statements.map(([text, correct], i) => ({ key: String.fromCharCode(97 + i), text, correct })) };
}
function short(grade: Grade, chapter: number, text: string, answer: number, tolerance: number, explanation: string): ShortAnswer {
    return { ...base(grade, chapter, "s1", text, explanation), type: "short", correctAnswer: answer, tolerance };
}

/** Original starter exercises, not Ministry-issued questions or a complete exam bank. */
export const questionBank: Question[] = [
    // Grade 10: scientific practice.
    mcq(10, 1, 1, "Để tìm ảnh hưởng của chiều dài dây lên chu kì con lắc ở góc lệch nhỏ, một nhóm thay đổi chiều dài và đo chu kì. Đại lượng nào nên giữ không đổi?", ["Chiều dài dây", "Khối lượng quả nặng và góc lệch ban đầu", "Chu kì đo được", "Số đo chiều dài sau mỗi lần thay đổi"], "B", "Chiều dài là biến được thay đổi; chu kì là đại lượng được đo. Giữ khối lượng và góc lệch ban đầu như nhau giúp việc so sánh tập trung vào ảnh hưởng của chiều dài."),
    mcq(10, 1, 2, "Một cân chưa đặt vật đã chỉ 5 g. Nếu không chỉnh về 0, các kết quả đo mắc lỗi chủ yếu nào?", ["Sai số ngẫu nhiên làm kết quả lúc lớn lúc nhỏ", "Không có sai số", "Sai số hệ thống làm số đo lớn hơn giá trị đúng 5 g", "Sai số do đổi đơn vị"], "C", "Độ lệch điểm 0 cộng thêm cùng một lượng 5 g vào các số đo. Đây là sai số hệ thống; lấy trung bình nhiều lần đo không tự loại bỏ độ lệch này."),
    tf(10, 1, "Ba lần đo chiều dài cùng một vật cho kết quả 19,8 cm; 20,0 cm; 20,2 cm.", [["Giá trị trung bình là 20,0 cm.", true], ["Lấy trung bình loại bỏ được mọi sai số hệ thống.", false], ["Cần ghi đơn vị bên cạnh kết quả đo.", true], ["20,0 cm bằng 2,00 m.", false]], "Trung bình là (19,8 + 20,0 + 20,2)/3 = 20,0 cm. Lấy trung bình không xoá độ lệch hệ thống. Kết quả phải có đơn vị; 20,0 cm = 0,200 m."),
    short(10, 1, "Thời gian xe đi cùng một quãng đường được đo ba lần là 1,8 s; 2,0 s; 2,2 s. Giá trị trung bình bằng bao nhiêu giây?", 2, 0, "Thời gian trung bình là (1,8 + 2,0 + 2,2)/3 = 2,0 s."),
    // Kinematics.
    mcq(10, 2, 1, "Một học sinh đi 30 m về đông rồi 10 m về tây trên cùng đường thẳng. Độ dịch chuyển là", ["40 m về đông", "20 m về đông", "20 m về tây", "40 m về tây"], "B", "Chọn chiều đông là dương: độ dịch chuyển là 30 − 10 = 20 m về đông. Quãng đường là 30 + 10 = 40 m."),
    mcq(10, 2, 2, "Một xe chuyển động thẳng có vận tốc tăng đều từ 2 m/s lên 8 m/s trong 3 s. Gia tốc bằng", ["2 m/s²", "3 m/s²", "6 m/s²", "10 m/s²"], "A", "a = (v − v₀)/Δt = (8 − 2)/3 = 2 m/s²."),
    tf(10, 2, "Một xe chuyển động thẳng theo chiều dương, xuất phát từ nghỉ và có gia tốc không đổi 2 m/s² trong 4 s.", [["Vận tốc cuối là 8 m/s.", true], ["Độ dịch chuyển là 8 m.", false], ["Đồ thị vận tốc – thời gian là đoạn thẳng qua gốc toạ độ.", true], ["Diện tích dưới đồ thị vận tốc – thời gian là 16 m.", true]], "v = at = 8 m/s. Độ dịch chuyển là at²/2 = 16 m, cũng bằng diện tích tam giác dưới đồ thị: 4 × 8/2 = 16 m."),
    short(10, 2, "Thả một vật từ nghỉ, bỏ qua lực cản không khí. Lấy g = 10 m/s². Sau 2 s, vật rơi được bao nhiêu mét?", 20, 0, "s = gt²/2 = 10 × 2²/2 = 20 m."),
    // Dynamics, including moments and hydrostatic pressure.
    mcq(10, 3, 1, "Hợp lực nằm ngang 6 N tác dụng lên một vật 2 kg. Trong hệ quy chiếu quán tính, gia tốc của vật bằng", ["12 m/s²", "0,33 m/s²", "4 m/s²", "3 m/s²"], "D", "Theo định luật II Newton: a = F/m = 6/2 = 3 m/s², cùng hướng hợp lực."),
    mcq(10, 3, 2, "Hai điểm trong nước đứng yên chênh lệch độ sâu 0,5 m. Biết ρ = 1000 kg/m³, g = 10 m/s². Áp suất tại điểm sâu hơn lớn hơn bao nhiêu?", ["500 Pa", "5000 Pa", "2000 Pa", "50 000 Pa"], "B", "Δp = ρgΔh = 1000 × 10 × 0,5 = 5000 Pa."),
    tf(10, 3, "Một quyển sách nằm yên trên bàn ngang. Chỉ xét trọng lực lên sách và lực đỡ của bàn.", [["Hợp lực lên sách bằng 0.", true], ["Lực đỡ và trọng lực là một cặp lực theo định luật III Newton.", false], ["Độ lớn lực đỡ bằng độ lớn trọng lực.", true], ["Lực sách lên bàn và lực bàn lên sách đặt lên hai vật khác nhau.", true]], "Sách cân bằng nên lực đỡ và trọng lực cùng tác dụng lên sách, ngược hướng và bằng độ lớn. Cặp lực theo định luật III phải đặt lên hai vật khác nhau: bàn lên sách và sách lên bàn."),
    short(10, 3, "Một lực 12 N có phương vuông góc với cánh cửa, tác dụng tại điểm cách trục quay 0,25 m. Moment lực bằng bao nhiêu N·m?", 3, 0, "Cánh tay đòn d = 0,25 m. M = Fd = 12 × 0,25 = 3 N·m."),
    // Work, energy and power.
    mcq(10, 4, 1, "Một lực không đổi 20 N kéo vật đi 3 m theo đúng hướng lực. Công của lực bằng", ["60 J", "6,67 J", "23 J", "0 J"], "A", "Góc giữa lực và độ dịch chuyển là 0°, nên A = Fs cos 0° = 20 × 3 = 60 J."),
    mcq(10, 4, 2, "Thiết bị nhận 500 J năng lượng, cung cấp 350 J năng lượng hữu ích. Hiệu suất là", ["150%", "35%", "70%", "143%"], "C", "H = Eích/Evào × 100% = 350/500 × 100% = 70%."),
    tf(10, 4, "Một quả bóng 0,5 kg được thả từ nghỉ ở độ cao 4 m. Bỏ qua lực cản, lấy g = 10 m/s² và mặt đất làm mốc thế năng.", [["Thế năng ban đầu bằng 20 J.", true], ["Cơ năng giảm dần khi rơi.", false], ["Ngay trước khi chạm đất, động năng bằng 20 J.", true], ["Ở độ cao 2 m, thế năng bằng 10 J.", true]], "Thế năng đầu mgh = 20 J. Chỉ trọng lực thực hiện công nên cơ năng bảo toàn. Ở mặt đất toàn bộ 20 J là động năng; ở độ cao 2 m, thế năng là 0,5 × 10 × 2 = 10 J."),
    short(10, 4, "Động cơ thực hiện công hữu ích 3600 J trong 12 s. Công suất hữu ích trung bình bằng bao nhiêu watt?", 300, 0, "P = A/t = 3600/12 = 300 W."),
    // Momentum.
    mcq(10, 5, 1, "Một xe 0,4 kg có tốc độ 5 m/s. Độ lớn động lượng của xe bằng", ["12,5 kg·m/s", "2 kg·m/s", "0,08 kg·m/s", "5,4 kg·m/s"], "B", "p = mv = 0,4 × 5 = 2 kg·m/s."),
    mcq(10, 5, 2, "Điều kiện nào cho phép dùng bảo toàn tổng động lượng của hai vật trong va chạm?", ["Động năng từng vật không đổi", "Hai vật cùng khối lượng", "Hai vật chuyển động cùng chiều", "Xung lượng ngoại lực lên hệ có thể bỏ qua"], "D", "Biến thiên tổng động lượng bằng xung lượng ngoại lực. Khi xung lượng này có thể bỏ qua, tổng động lượng trước và sau va chạm bằng nhau."),
    tf(10, 5, "Xe A 1 kg chạy với vận tốc 4 m/s, va chạm với xe B 1 kg đang đứng yên. Hai xe dính nhau sau va chạm; bỏ qua xung lượng ngoại lực.", [["Tổng động lượng đầu là 4 kg·m/s theo hướng chuyển động của A.", true], ["Tốc độ chung sau va chạm là 4 m/s.", false], ["Tổng động năng trước va chạm bằng 8 J.", true], ["Tổng động năng giảm sau va chạm.", true]], "Bảo toàn động lượng: 1 × 4 = (1 + 1)v, nên v = 2 m/s. Động năng trước là 8 J, sau là 4 J; phần giảm chuyển sang nội năng, biến dạng và các dạng khác."),
    short(10, 5, "Một hợp lực trung bình 15 N tác dụng theo cùng một hướng trong 0,2 s. Độ lớn xung lượng bằng bao nhiêu N·s?", 3, 0, "J = Ftb Δt = 15 × 0,2 = 3 N·s."),
    // Circular motion.
    mcq(10, 6, 1, "Vật chuyển động tròn đều tốc độ 4 m/s trên quỹ đạo bán kính 2 m. Gia tốc hướng tâm bằng", ["2 m/s²", "4 m/s²", "8 m/s²", "16 m/s²"], "C", "aht = v²/r = 4²/2 = 8 m/s²."),
    mcq(10, 6, 2, "Trong chuyển động tròn đều, vectơ gia tốc luôn", ["hướng vào tâm quỹ đạo", "cùng hướng vận tốc", "hướng ra xa tâm", "bằng 0 vì tốc độ không đổi"], "A", "Tốc độ không đổi nhưng hướng vận tốc thay đổi. Gia tốc hướng tâm vuông góc vận tốc và hướng vào tâm."),
    tf(10, 6, "Một điểm trên vành bánh xe bán kính 0,5 m quay đều quanh trục cố định với tốc độ góc 4 rad/s.", [["Tốc độ dài là 2 m/s.", true], ["Gia tốc hướng tâm là 8 m/s².", true], ["Chu kì quay là 4 s.", false], ["Lực hướng tâm luôn là một loại lực mới, độc lập với các lực đang tác dụng.", false]], "v = ωr = 2 m/s; aht = ω²r = 8 m/s²; T = 2π/ω = π/2 s. Lực hướng tâm là hợp lực hướng vào tâm, có thể do lực căng, ma sát hoặc lực khác cung cấp."),
    short(10, 6, "Vật 0,5 kg chuyển động tròn đều bán kính 2 m, tốc độ 4 m/s. Lực hướng tâm bằng bao nhiêu newton?", 4, 0, "Fht = mv²/r = 0,5 × 16/2 = 4 N."),
    // Deformation.
    mcq(10, 7, 1, "Lò xo độ cứng 100 N/m dãn 2 cm trong giới hạn đàn hồi. Lực đàn hồi có độ lớn", ["200 N", "0,2 N", "50 N", "2 N"], "D", "2 cm = 0,02 m. F = kΔl = 100 × 0,02 = 2 N."),
    mcq(10, 7, 2, "Lò xo trở về chiều dài ban đầu sau khi bỏ lực kéo. Biến dạng vừa xảy ra gọi là", ["biến dạng dẻo", "biến dạng đàn hồi", "chuyển động tròn", "biến đổi nhiệt"], "B", "Biến dạng đàn hồi cho phép vật lấy lại hình dạng, kích thước ban đầu khi bỏ lực tác dụng."),
    tf(10, 7, "Lò xo chiều dài tự nhiên 20 cm, độ cứng 50 N/m, dài 24 cm khi chịu lực kéo trong giới hạn đàn hồi.", [["Độ dãn là 0,04 m.", true], ["Độ lớn lực đàn hồi là 2 N.", true], ["Nhân độ cứng với chiều dài 0,24 m sẽ cho đúng lực đàn hồi.", false], ["Định luật Hooke chắc chắn vẫn đúng khi kéo vượt giới hạn đàn hồi.", false]], "Δl = l − l₀ = 0,04 m; F = kΔl = 2 N. Phải dùng độ biến dạng, không dùng toàn bộ chiều dài. Định luật Hooke chỉ áp dụng trong giới hạn đàn hồi."),
    short(10, 7, "Trong giới hạn đàn hồi, lực 3 N làm lò xo dãn 1,5 cm. Độ cứng bằng bao nhiêu N/m?", 200, 0, "k = F/Δl = 3/0,015 = 200 N/m."),
    // Grade 11: oscillations.
    mcq(11, 1, 1, "Cảm biến ghi dao động có li độ lớn nhất 3 cm và nhỏ nhất −3 cm. Biên độ dao động bằng", ["6 cm", "3 cm", "0 cm", "1,5 cm"], "B", "Biên độ là độ lệch lớn nhất so với vị trí cân bằng. Khoảng cách hai biên là 2A = 6 cm, nên A = 3 cm."),
    mcq(11, 1, 2, "Một vật dao động điều hoà có chu kì 0,5 s. Tần số là", ["0,5 Hz", "π Hz", "2 Hz", "4π Hz"], "C", "f = 1/T = 1/0,5 = 2 Hz. Không nhầm tần số f với tần số góc ω = 2πf."),
    tf(11, 1, "Một vật dao động điều hoà theo phương trình $x=2\\cos(4\\pi t)$ cm, t tính bằng giây.", [["Biên độ là 2 cm.", true], ["Chu kì là 0,5 s.", true], ["Tại t = 0, tốc độ đạt giá trị lớn nhất.", false], ["Gia tốc luôn cùng dấu với li độ.", false]], "A = 2 cm; ω = 4π rad/s; T = 2π/ω = 0,5 s. Tại t = 0 vật ở biên nên vận tốc bằng 0. Gia tốc a = −ω²x ngược dấu li độ khi x khác 0."),
    short(11, 1, "Vật dao động điều hoà có biên độ 0,04 m, tần số góc 5 rad/s. Tốc độ cực đại bằng bao nhiêu m/s?", 0.2, 0.001, "vmax = ωA = 5 × 0,04 = 0,20 m/s."),
    // Waves.
    mcq(11, 2, 1, "Một sóng có tần số 5 Hz, tốc độ truyền 10 m/s. Bước sóng bằng", ["0,5 m", "50 m", "15 m", "2 m"], "D", "λ = v/f = 10/5 = 2 m."),
    mcq(11, 2, 2, "Phát biểu nào đúng về sóng điện từ?", ["Có thể truyền trong chân không", "Mọi sóng điện từ đều là sóng âm", "Chỉ truyền trong chất rắn", "Tần số trong chân không luôn bằng 50 Hz"], "A", "Sóng điện từ không cần môi trường vật chất để lan truyền. Sóng âm là sóng cơ; 50 Hz không phải tần số chung của mọi sóng điện từ."),
    tf(11, 2, "Sợi dây hai đầu cố định dài 1,2 m xuất hiện sóng dừng với đúng ba bụng sóng. Tốc độ truyền sóng là 24 m/s.", [["Bước sóng là 0,8 m.", true], ["Tần số là 30 Hz.", true], ["Chỉ có ba nút sóng, kể cả hai đầu.", false], ["Khoảng cách hai nút liên tiếp là 0,4 m.", true]], "l = 3λ/2 nên λ = 0,8 m; f = v/λ = 30 Hz. Có bốn nút kể cả hai đầu, cách nhau λ/2 = 0,4 m."),
    short(11, 2, "Thí nghiệm Young dùng ánh sáng bước sóng 600 nm, hai khe cách nhau 1 mm, màn cách khe 2 m. Với xấp xỉ góc nhỏ, khoảng vân bằng bao nhiêu milimét?", 1.2, 0.01, "i = λD/a = 600 × 10⁻⁹ × 2/(10⁻³) = 1,2 × 10⁻³ m = 1,2 mm."),
    // Electric fields.
    mcq(11, 3, 1, "Điện tích thử dương 2 μC chịu lực điện 0,006 N. Cường độ điện trường tại đó bằng", ["3000 N/C", "12 N/C", "0,003 N/C", "300 N/C"], "A", "E = F/q = 0,006/(2 × 10⁻⁶) = 3000 N/C. Hướng điện trường cùng hướng lực lên điện tích thử dương."),
    mcq(11, 3, 2, "Tụ điện có điện dung 4 μF được đặt dưới hiệu điện thế 12 V. Độ lớn điện tích trên mỗi bản bằng", ["3 μC", "16 μC", "48 μC", "0,33 μC"], "C", "Q = CU = 4 × 12 = 48 μC. Hai bản mang điện tích bằng độ lớn, trái dấu trong mô hình tụ điện thông thường."),
    tf(11, 3, "Một điện tích điểm dương cố định tạo điện trường trong chân không. Xét các điểm cách nó r và 2r.", [["Vectơ điện trường hướng ra xa điện tích nguồn.", true], ["Điện trường ở 2r có độ lớn bằng một nửa ở r.", false], ["Điện tích thử âm chịu lực ngược hướng điện trường.", true], ["Cường độ điện trường phụ thuộc điện tích thử dù điện tích thử đủ nhỏ để không làm thay đổi nguồn.", false]], "E = k|Q|/r² nên tăng khoảng cách hai lần làm E giảm bốn lần. Với q âm, F = qE ngược hướng E. Điện trường là đặc trưng của nguồn và vị trí, không do điện tích thử quyết định."),
    short(11, 3, "Hai bản phẳng song song cách nhau 0,02 m, hiệu điện thế 100 V. Bỏ qua hiệu ứng mép. Cường độ điện trường đều giữa hai bản bằng bao nhiêu V/m?", 5000, 0, "E = U/d = 100/0,02 = 5000 V/m."),
    // Current and circuits.
    mcq(11, 4, 1, "Trong 10 s có điện lượng 6 C qua tiết diện dây dẫn. Cường độ dòng điện trung bình bằng", ["60 A", "1,67 A", "6 A", "0,6 A"], "D", "I = Δq/Δt = 6/10 = 0,6 A."),
    mcq(11, 4, 2, "Nguồn điện suất điện động 12 V, điện trở trong 1 Ω, nối với điện trở ngoài 5 Ω. Dòng điện trong mạch bằng", ["2,4 A", "2 A", "12 A", "6 A"], "B", "Tổng điện trở R + r = 6 Ω. I = ℰ/(R + r) = 12/6 = 2 A."),
    tf(11, 4, "Điện trở thuần 6 Ω được đặt dưới hiệu điện thế không đổi 12 V trong 10 s; coi điện trở không đổi.", [["Dòng điện là 2 A.", true], ["Công suất tiêu thụ là 24 W.", true], ["Điện năng tiêu thụ trong 10 s là 24 J.", false], ["Tăng hiệu điện thế lên 24 V làm công suất tăng bốn lần.", true]], "I = U/R = 2 A; P = UI = 24 W; A = Pt = 240 J. Với R không đổi, P = U²/R nên tăng U hai lần làm P tăng bốn lần."),
    short(11, 4, "Nguồn điện suất điện động 9 V, điện trở trong 0,5 Ω, đang cung cấp dòng 2 A. Hiệu điện thế giữa hai cực nguồn bằng bao nhiêu volt?", 8, 0, "Khi nguồn phát điện: U = ℰ − Ir = 9 − 2 × 0,5 = 8 V."),
    // Grade 12: thermal physics.
    mcq(12, 1, 1, "Nhiệt độ 27 °C gần bằng giá trị nào theo thang Kelvin? Lấy T = t + 273.", ["246 K", "300 K", "27 K", "327 K"], "B", "Theo phép đổi gần đúng đã cho, T = 27 + 273 = 300 K. Kelvin không dùng kí hiệu độ."),
    mcq(12, 1, 2, "Một hệ nhận nhiệt lượng 100 J và thực hiện công 40 J lên môi trường. Độ biến thiên nội năng bằng", ["140 J", "−140 J", "60 J", "−60 J"], "C", "Dùng ΔU = Q + A, với A là công hệ nhận: Q = 100 J, A = −40 J vì hệ thực hiện công. Vậy ΔU = 60 J."),
    tf(12, 1, "Đun 0,2 kg nước từ 20 °C lên 30 °C. Biết c = 4200 J/(kg·K), bỏ qua mất nhiệt và chưa có chuyển thể.", [["Độ tăng nhiệt độ là 10 K.", true], ["Nhiệt lượng nước nhận là 8400 J.", true], ["Có thể dùng Q = mcΔT cho quá trình này.", true], ["Nhiệt lượng cần không phụ thuộc khối lượng nước.", false]], "Chênh lệch 10 °C tương ứng 10 K. Q = mcΔT = 0,2 × 4200 × 10 = 8400 J. Với c và ΔT giữ nguyên, Q tỉ lệ thuận khối lượng."),
    short(12, 1, "Cần bao nhiêu kilojoule để làm nóng chảy hoàn toàn 0,1 kg nước đá ở 0 °C? Nhiệt nóng chảy riêng là 334 kJ/kg, bỏ qua mất nhiệt.", 33.4, 0.01, "Nước đá đã ở nhiệt độ nóng chảy. Q = mλ = 0,1 × 334 = 33,4 kJ."),
    // Ideal gases.
    mcq(12, 2, 1, "Một lượng khí lí tưởng xác định được nén đẳng nhiệt từ 4 lít xuống 2 lít. Áp suất cuối so với áp suất đầu", ["tăng hai lần", "giảm hai lần", "không đổi", "tăng bốn lần"], "A", "Đẳng nhiệt: p₁V₁ = p₂V₂. Với lượng khí không đổi, p₂/p₁ = V₁/V₂ = 2."),
    mcq(12, 2, 2, "Động năng tịnh tiến trung bình của phân tử khí lí tưởng phụ thuộc trực tiếp vào", ["nhiệt độ Celsius", "thể tích bình bất kể nhiệt độ", "màu sắc bình", "nhiệt độ tuyệt đối của khí"], "D", "Động năng tịnh tiến trung bình bằng (3/2)kBT, với T là nhiệt độ tuyệt đối tính bằng Kelvin."),
    tf(12, 2, "Một lượng khí lí tưởng được nung từ 300 K lên 450 K ở áp suất không đổi. Thể tích ban đầu là 2 lít.", [["Thể tích cuối là 3 lít.", true], ["Tỉ số V/T không đổi.", true], ["Nhiệt độ tuyệt đối tăng 50%.", true], ["Có thể thay Kelvin bằng Celsius trong tỉ số V₂/V₁ = T₂/T₁.", false]], "Đẳng áp: V₂ = V₁T₂/T₁ = 2 × 450/300 = 3 lít. Nhiệt độ tuyệt đối tăng 150/300 = 50%; tỉ số nhiệt độ phải dùng Kelvin."),
    short(12, 2, "Một mol khí lí tưởng ở 300 K chiếm thể tích 0,024 m³. Lấy R = 8,31 J/(mol·K). Áp suất bằng bao nhiêu kilopascal? Làm tròn đến 0,1 kPa.", 103.9, 0.05, "p = nRT/V = 8,31 × 300/0,024 = 103875 Pa = 103,875 kPa, làm tròn được 103,9 kPa."),
    // Magnetism and induction, including core AC fundamentals.
    mcq(12, 3, 1, "Dây thẳng dài 0,2 m mang dòng 3 A đặt vuông góc từ trường đều B = 0,5 T. Lực từ lên đoạn dây có độ lớn", ["3 N", "0,3 N", "0,03 N", "1,2 N"], "B", "F = BIl sin 90° = 0,5 × 3 × 0,2 = 0,3 N."),
    mcq(12, 3, 2, "Dòng điện xoay chiều hình sin có cường độ cực đại $I_0=2\\sqrt2$ A. Cường độ hiệu dụng bằng", ["$4$ A", "$\\sqrt2$ A", "$2$ A", "$2\\sqrt2$ A"], "C", "Với dòng hình sin, I = I₀/√2 = 2 A. Giá trị hiệu dụng liên hệ tác dụng nhiệt, không phải trung bình đại số trong một chu kì."),
    tf(12, 3, "Từ thông qua một vòng dây kín giảm đều từ 0,06 Wb xuống 0,02 Wb trong 0,2 s.", [["Độ lớn biến thiên từ thông là 0,04 Wb.", true], ["Suất điện động cảm ứng trung bình có độ lớn 0,2 V.", true], ["Nếu cùng độ biến thiên diễn ra trong 0,4 s, suất điện động cảm ứng trung bình tăng gấp đôi.", false], ["Dòng điện cảm ứng có tác dụng chống lại sự biến thiên từ thông sinh ra nó.", true]], "|e| = |ΔΦ|/Δt = 0,04/0,2 = 0,2 V. Thời gian tăng hai lần làm suất điện động giảm một nửa. Chiều dòng điện tuân theo định luật Lenz."),
    short(12, 3, "Khung dây phẳng một vòng diện tích 0,02 m² đặt trong từ trường đều 0,3 T. Vectơ cảm ứng từ song song pháp tuyến mặt khung. Độ lớn từ thông bằng bao nhiêu miliweber (mWb)?", 6, 0.001, "|Φ| = BS = 0,3 × 0,02 = 0,006 Wb = 6 mWb."),
    // Nuclear physics.
    mcq(12, 4, 1, "Hạt nhân có số khối 23 và 11 proton. Số neutron là", ["12", "11", "23", "34"], "A", "Số khối bằng tổng proton và neutron: N = A − Z = 23 − 11 = 12."),
    mcq(12, 4, 2, "Mẫu phóng xạ có chu kì bán rã 6 giờ. Sau 12 giờ, số hạt nhân chưa phân rã còn lại bằng", ["một nửa ban đầu", "ba phần tư ban đầu", "một phần tám ban đầu", "một phần tư ban đầu"], "D", "12 giờ ứng với hai chu kì bán rã. N = N₀/2² = N₀/4."),
    tf(12, 4, "Hạt nhân có số khối A = 210, số proton Z = 84, phân rã bằng cách phát ra một hạt alpha.", [["Hạt alpha gồm hai proton và hai neutron.", true], ["Hạt nhân con có số khối 206.", true], ["Hạt nhân con có 86 proton.", false], ["Chu kì bán rã cho phép dự đoán chính xác lúc phân rã của từng hạt nhân.", false]], "Hạt alpha là hạt nhân helium-4: A = 4, Z = 2. Bảo toàn số khối và điện tích cho hạt nhân con A = 206, Z = 82. Phân rã từng hạt là ngẫu nhiên; chu kì bán rã mô tả quy luật thống kê của nhiều hạt."),
    short(12, 4, "Mẫu có độ phóng xạ ban đầu 800 Bq, chu kì bán rã 3 ngày. Sau 9 ngày, độ phóng xạ của chất ban đầu còn bao nhiêu Bq?", 100, 0, "Sau 9/3 = 3 chu kì, H = H₀/2³ = 800/8 = 100 Bq."),
];

export function getQuestionsForGrade(grade: Grade): Question[] {
    return questionBank.filter((question) => question.grade === grade);
}

/** Uses the available pool: no repeats, no questions borrowed from another grade. */
export function generateExam(chapter?: number, grade: Grade = 12): Question[] {
    const pool = getQuestionsForGrade(grade).filter((q) => chapter === undefined || q.chapter === chapter);
    const shuffle = <T,>(items: T[]): T[] => {
        const result = [...items];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    };
    return [
        ...shuffle(pool.filter((q) => q.type === "mcq")).slice(0, 18),
        ...shuffle(pool.filter((q) => q.type === "tf")).slice(0, 4),
        ...shuffle(pool.filter((q) => q.type === "short")).slice(0, 6),
    ];
}

export function getChapterNames(grade: Grade): Record<number, string> {
    return Object.fromEntries(getGradeCurriculum(grade).topics.map((topic, i) => [i + 1, topic.title]));
}
/** Backward-compatible default; current views use getChapterNames(grade). */
export const chapterNames = getChapterNames(12);
