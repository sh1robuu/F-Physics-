export type Grade = 10 | 11 | 12;
export const GRADES: Grade[] = [10, 11, 12];

export interface CurriculumTopic {
    id: string;
    title: string;
    titleEn: string;
    summary: string;
    summaryEn: string;
    lessons: string[];
    lessonsEn: string[];
    formulas: string[];
    prompt: string;
    promptEn: string;
}

export interface GradeCurriculum {
    grade: Grade;
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    topics: CurriculumTopic[];
    specialistTopics: string[];
    specialistTopicsEn: string[];
}

type TopicContent = Omit<CurriculumTopic, "prompt" | "promptEn">;
function topic(grade: Grade, content: TopicContent): CurriculumTopic {
    return {
        ...content,
        prompt: `Mình học lớp ${grade}, chương trình GDPT 2018. Hãy giúp mình học chủ đề ${content.title}: giải thích từ hiện tượng thực tế, chỉ rõ điều kiện dùng công thức, rồi đưa một câu hỏi để mình tự thử. Các nội dung cần học: ${content.lessons.join("; ")}.`,
        promptEn: `I am a Grade ${grade} student following Vietnam's GDPT 2018 curriculum. Help me learn ${content.titleEn}: start with a real phenomenon, explain when each formula applies, then ask me one practice question. Learning areas: ${content.lessonsEn.join("; ")}.`,
    };
}

// Learning groups follow curriculum strands, not any one publisher's chapter order.
const curriculum: Record<Grade, GradeCurriculum> = {
    10: {
        grade: 10, title: "Xây nền tảng, hiểu chuyển động", titleEn: "Build foundations. Understand motion.",
        description: "Bắt đầu từ cách đo và quan sát, rồi khám phá lực, chuyển động và những quy luật bảo toàn.",
        descriptionEn: "Start with observation and measurement, then explore forces, motion and conservation laws.",
        specialistTopics: ["Vật lí trong một số ngành nghề", "Trái Đất và bầu trời", "Vật lí với giáo dục về bảo vệ môi trường"],
        specialistTopicsEn: ["Physics and careers", "Earth and the sky", "Physics and environmental education"],
        topics: [
            topic(10, {
                id: "scientific-practice", title: "Mở đầu và phương pháp học Vật lí", titleEn: "Scientific practice",
                summary: "Một kết quả đo luôn đi cùng đơn vị và độ không chắc chắn. Dùng quan sát, giả thuyết và thí nghiệm để kiểm tra cách giải thích một hiện tượng.",
                summaryEn: "A measurement needs a unit and an uncertainty. Use observations, hypotheses and experiments to test explanations.",
                lessons: ["Đại lượng, đơn vị SI và đổi đơn vị", "Giả thuyết, biến kiểm soát và thí nghiệm", "Sai số ngẫu nhiên, sai số hệ thống", "Đọc dụng cụ và an toàn thực hành"],
                lessonsEn: ["Quantities, SI units and conversions", "Hypotheses, controlled variables and experiments", "Random and systematic errors", "Reading instruments and laboratory safety"],
                formulas: ["$\\bar{x}=\\frac{x_1+\\cdots+x_n}{n}$", "$x=\\bar{x}\\pm\\Delta x$", "$\\delta x=\\frac{\\Delta x}{|\\bar{x}|}\\times100\\%$ (khi $\\bar{x}\\ne0$)"],
            }),
            topic(10, {
                id: "kinematics", title: "Động học", titleEn: "Kinematics",
                summary: "Phân biệt quãng đường với độ dịch chuyển, tốc độ với vận tốc. Đọc độ dốc và diện tích đồ thị để mô tả chuyển động mà chưa cần xét nguyên nhân.",
                summaryEn: "Distinguish distance from displacement and speed from velocity. Use graph slopes and areas to describe motion.",
                lessons: ["Độ dịch chuyển và vận tốc trung bình", "Đồ thị độ dịch chuyển – thời gian, vận tốc – thời gian", "Gia tốc và chuyển động thẳng biến đổi đều", "Rơi tự do và chuyển động ném, bỏ qua lực cản"],
                lessonsEn: ["Displacement and average velocity", "Displacement–time and velocity–time graphs", "Acceleration and constant-acceleration motion", "Free fall and projectiles without air resistance"],
                formulas: ["$v_{tb}=\\frac{\\Delta x}{\\Delta t}$", "$v=v_0+at$ (gia tốc không đổi)", "$\\Delta x=v_0t+\\frac12at^2$ (gia tốc không đổi)"],
            }),
            topic(10, {
                id: "dynamics", title: "Động lực học", titleEn: "Forces and dynamics",
                summary: "Hợp lực quyết định sự thay đổi vận tốc. Vẽ sơ đồ lực và chọn hệ quy chiếu để giải thích chuyển động, cân bằng và áp suất trong chất lỏng.",
                summaryEn: "The net force determines how velocity changes. Draw force diagrams to explain motion, equilibrium and fluid pressure.",
                lessons: ["Ba định luật Newton và sơ đồ lực", "Trọng lực, ma sát, lực cản, lực nâng và lực căng", "Tổng hợp lực, moment lực và cân bằng", "Khối lượng riêng và độ chênh lệch áp suất chất lỏng"],
                lessonsEn: ["Newton's three laws and force diagrams", "Weight, friction, drag, upthrust and tension", "Resultant force, moments and equilibrium", "Density and pressure differences in liquids"],
                formulas: ["$\\sum\\vec F=m\\vec a$ (hệ quy chiếu quán tính)", "$M=Fd$ ($d$: cánh tay đòn)", "$\\Delta p=\\rho g\\Delta h$ (chất lỏng đứng yên, $\\rho$ không đổi)"],
            }),
            topic(10, {
                id: "work-energy-power", title: "Công, năng lượng, công suất", titleEn: "Work, energy and power",
                summary: "Lực có thể truyền năng lượng khi vật dịch chuyển. Theo dõi động năng, thế năng và phần năng lượng hao phí để hiểu hiệu suất của một thiết bị.",
                summaryEn: "A force can transfer energy as an object moves. Track kinetic, potential and dissipated energy to understand efficiency.",
                lessons: ["Công của lực không đổi", "Động năng và thế năng trọng trường", "Bảo toàn năng lượng và cơ năng", "Công suất, năng lượng hữu ích và hiệu suất"],
                lessonsEn: ["Work done by a constant force", "Kinetic and gravitational potential energy", "Energy and mechanical energy conservation", "Power, useful energy and efficiency"],
                formulas: ["$A=Fs\\cos\\alpha$ (lực không đổi)", "$W_d=\\frac12mv^2;\\quad W_t=mgh$ (gần mặt đất)", "$P=\\frac{A}{t};\\quad H=\\frac{E_{ich}}{E_{vao}}\\times100\\%$"],
            }),
            topic(10, {
                id: "momentum", title: "Động lượng", titleEn: "Momentum",
                summary: "Động lượng là đại lượng vectơ mô tả trạng thái chuyển động. Khi xung lượng ngoại lực có thể bỏ qua, tổng động lượng của hệ được bảo toàn trong va chạm.",
                summaryEn: "Momentum is a vector. When the external impulse is negligible, the total momentum of a system is conserved through a collision.",
                lessons: ["Vectơ động lượng", "Xung lượng của lực và biến thiên động lượng", "Bảo toàn động lượng của hệ", "Va chạm và sự thay đổi động năng"],
                lessonsEn: ["Momentum as a vector", "Impulse and change in momentum", "Conservation of system momentum", "Collisions and changes in kinetic energy"],
                formulas: ["$\\vec p=m\\vec v$", "$\\Delta\\vec p=\\vec F_{tb}\\Delta t$", "$\\sum\\vec p_{truoc}=\\sum\\vec p_{sau}$ (xung lượng ngoại lực bằng 0)"],
            }),
            topic(10, {
                id: "circular-motion", title: "Chuyển động tròn", titleEn: "Circular motion",
                summary: "Trong chuyển động tròn đều, tốc độ không đổi nhưng hướng vận tốc luôn thay đổi. Gia tốc và hợp lực hướng vào tâm quỹ đạo.",
                summaryEn: "Uniform circular motion has constant speed but changing velocity. Acceleration and the net force point toward the centre.",
                lessons: ["Góc quay, radian và tốc độ góc", "Chu kì và tần số quay", "Gia tốc hướng tâm", "Lực hướng tâm trong các tình huống thực tế"],
                lessonsEn: ["Angle, radians and angular speed", "Period and frequency", "Centripetal acceleration", "Centripetal force in real situations"],
                formulas: ["$\\omega=\\frac{2\\pi}{T}=2\\pi f;\\quad v=\\omega r$", "$a_{ht}=\\frac{v^2}{r}=\\omega^2r$", "$F_{ht}=m\\frac{v^2}{r}$"],
            }),
            topic(10, {
                id: "solid-deformation", title: "Biến dạng của vật rắn", titleEn: "Deformation of solids",
                summary: "Lực kéo hoặc nén có thể làm vật biến dạng. Trong giới hạn đàn hồi, lò xo trở về hình dạng ban đầu và lực đàn hồi tỉ lệ với độ biến dạng.",
                summaryEn: "Tension and compression deform solids. Within its elastic limit, a spring recovers its shape and obeys Hooke's law.",
                lessons: ["Biến dạng kéo và biến dạng nén", "Giới hạn đàn hồi", "Độ cứng, chiều dài tự nhiên và độ biến dạng", "Thực hành kiểm tra định luật Hooke"],
                lessonsEn: ["Tensile and compressive deformation", "Elastic limits", "Stiffness, natural length and extension", "Investigating Hooke's law"],
                formulas: ["$\\Delta l=l-l_0$", "$F_{dh}=k|\\Delta l|$ (trong giới hạn đàn hồi)", "$k=\\frac{F_{dh}}{|\\Delta l|}$ (đơn vị N/m)"],
            }),
        ],
    },
    11: {
        grade: 11, title: "Khám phá dao động, sóng và điện", titleEn: "Explore oscillations, waves and electricity.",
        description: "Kết nối những chuyển động tuần hoàn với sự truyền sóng, rồi tìm hiểu điện trường và các mạch điện quanh ta.",
        descriptionEn: "Connect periodic motion to wave propagation, then discover electric fields and everyday circuits.",
        specialistTopics: ["Trường hấp dẫn", "Truyền thông tin bằng sóng vô tuyến", "Mở đầu về điện tử học"],
        specialistTopicsEn: ["Gravitational fields", "Radio communication", "Introduction to electronics"],
        topics: [
            topic(11, {
                id: "oscillations", title: "Dao động", titleEn: "Oscillations",
                summary: "Mô tả dao động bằng biên độ, chu kì và pha. Dùng đồ thị để theo dõi vận tốc, gia tốc, năng lượng và nhận biết hiện tượng cộng hưởng.",
                summaryEn: "Describe oscillations using amplitude, period and phase. Use graphs to follow velocity, acceleration, energy and resonance.",
                lessons: ["Dao động điều hoà và các đại lượng đặc trưng", "Li độ, vận tốc và gia tốc", "Sự chuyển hoá động năng và thế năng", "Dao động tắt dần, cưỡng bức và cộng hưởng"],
                lessonsEn: ["Simple harmonic motion and its quantities", "Displacement, velocity and acceleration", "Kinetic and potential energy transfer", "Damping, forced oscillations and resonance"],
                formulas: ["$x=A\\cos(\\omega t+\\varphi)$", "$v=-\\omega A\\sin(\\omega t+\\varphi);\\quad a=-\\omega^2x$", "$T=\\frac{2\\pi}{\\omega}=\\frac1f$"],
            }),
            topic(11, {
                id: "waves", title: "Sóng", titleEn: "Waves",
                summary: "Sóng truyền năng lượng từ nơi này đến nơi khác. So sánh sóng ngang, sóng dọc và sóng điện từ; dùng sự chồng chất để giải thích giao thoa và sóng dừng.",
                summaryEn: "Waves transfer energy. Compare transverse, longitudinal and electromagnetic waves, then use superposition to explain interference and standing waves.",
                lessons: ["Bước sóng, tần số, tốc độ và cường độ sóng", "Sóng ngang, sóng dọc và thang sóng điện từ", "Giao thoa sóng và thí nghiệm Young", "Sóng dừng và đo tốc độ truyền âm"],
                lessonsEn: ["Wavelength, frequency, speed and intensity", "Transverse, longitudinal and electromagnetic waves", "Interference and Young's experiment", "Standing waves and measuring sound speed"],
                formulas: ["$v=\\lambda f$", "$i=\\frac{\\lambda D}{a}$ (Young, góc nhỏ)", "$l=n\\frac{\\lambda}{2}$ (dây có hai đầu cố định, $n=1,2,\\ldots$)"],
            }),
            topic(11, {
                id: "electric-field", title: "Điện trường", titleEn: "Electric fields",
                summary: "Điện tích tạo ra điện trường và chịu lực trong điện trường. Điện thế mô tả năng lượng trên mỗi đơn vị điện tích; tụ điện tích trữ điện tích và năng lượng.",
                summaryEn: "Charges create and experience electric fields. Electric potential describes energy per unit charge; capacitors store charge and energy.",
                lessons: ["Lực Coulomb giữa các điện tích điểm", "Cường độ điện trường và đường sức", "Điện thế, hiệu điện thế và điện trường đều", "Điện dung và năng lượng của tụ điện"],
                lessonsEn: ["Coulomb force between point charges", "Electric field strength and field lines", "Potential, voltage and uniform fields", "Capacitance and stored energy"],
                formulas: ["$F=k\\frac{|q_1q_2|}{r^2}$ (trong chân không)", "$\\vec E=\\frac{\\vec F}{q};\\quad E=\\frac{U}{d}$ (điện trường đều, dọc đường sức)", "$C=\\frac{Q}{U};\\quad W=\\frac12CU^2$"],
            }),
            topic(11, {
                id: "current-circuits", title: "Dòng điện và mạch điện", titleEn: "Current and circuits",
                summary: "Dòng điện là sự dịch chuyển có hướng của điện tích. Kết nối dòng điện, điện trở, suất điện động và năng lượng để phân tích một mạch kín.",
                summaryEn: "Electric current is directed charge flow. Connect current, resistance, electromotive force and energy to analyse a complete circuit.",
                lessons: ["Cường độ dòng điện và chuyển động hạt mang điện", "Điện trở, đặc tuyến I–U và định luật Ohm", "Suất điện động và điện trở trong của nguồn", "Điện năng, công suất và đo đặc trưng của pin"],
                lessonsEn: ["Current and charge-carrier motion", "Resistance, I–V curves and Ohm's law", "Electromotive force and internal resistance", "Electrical energy, power and battery measurements"],
                formulas: ["$I=\\frac{\\Delta q}{\\Delta t};\\quad I=Snve$", "$U=IR$ (vật dẫn tuân theo định luật Ohm)", "$I=\\frac{\\mathcal{E}}{R+r};\\quad P=UI;\\quad A=UIt$ (dòng điện không đổi)"],
            }),
        ],
    },
    12: {
        grade: 12, title: "Từ thế giới phân tử đến hạt nhân", titleEn: "From molecules to nuclei.",
        description: "Hiểu nhiệt và chất khí bằng mô hình phân tử, khám phá cảm ứng điện từ và sự biến đổi của hạt nhân.",
        descriptionEn: "Explain heat and gases through molecular models, then investigate induction and nuclear transformations.",
        specialistTopics: ["Dòng điện xoay chiều", "Một số ứng dụng vật lí trong chẩn đoán y học", "Vật lí lượng tử"],
        specialistTopicsEn: ["Alternating current", "Physics in medical diagnostics", "Quantum physics"],
        topics: [
            topic(12, {
                id: "thermal-physics", title: "Vật lí nhiệt", titleEn: "Thermal physics",
                summary: "Nội năng liên quan đến chuyển động và tương tác của các phân tử. Nhiệt và công là hai cách truyền năng lượng; sự chuyển thể còn cần năng lượng dù nhiệt độ có thể không đổi.",
                summaryEn: "Internal energy concerns molecular motion and interactions. Heating and work transfer energy; a phase change can absorb energy without raising temperature.",
                lessons: ["Cấu trúc chất và sự chuyển thể", "Nội năng và định luật I nhiệt động lực học", "Thang Celsius, Kelvin và cân bằng nhiệt", "Nhiệt dung riêng, nhiệt nóng chảy riêng và nhiệt hoá hơi riêng"],
                lessonsEn: ["States of matter and phase changes", "Internal energy and the first law", "Celsius, Kelvin and thermal equilibrium", "Specific heat capacity and latent heats"],
                formulas: ["$\\Delta U=Q+A$ ($Q,A>0$ khi hệ nhận nhiệt, nhận công)", "$Q=mc\\Delta T$ (không chuyển thể, $c$ không đổi)", "$Q=m\\lambda;\\quad Q=mL$ (nóng chảy; hoá hơi)", "$T(\\mathrm K)=t(^{\\circ}\\mathrm C)+273{,}15$"],
            }),
            topic(12, {
                id: "ideal-gases", title: "Khí lí tưởng", titleEn: "Ideal gases",
                summary: "Mô hình phân tử giải thích áp suất và nhiệt độ của chất khí. Theo dõi áp suất, thể tích và nhiệt độ tuyệt đối để dự đoán trạng thái của một lượng khí xác định.",
                summaryEn: "A molecular model explains gas pressure and temperature. Relate pressure, volume and absolute temperature to predict gas states.",
                lessons: ["Chuyển động Brown và mô hình động học phân tử", "Định luật Boyle: quá trình đẳng nhiệt", "Định luật Charles: quá trình đẳng áp", "Phương trình trạng thái và động năng phân tử"],
                lessonsEn: ["Brownian motion and the kinetic model", "Boyle's law at constant temperature", "Charles's law at constant pressure", "The ideal gas equation and molecular kinetic energy"],
                formulas: ["$pV=nRT$ (khí lí tưởng, $T$ tính bằng K)", "$\\frac{p_1V_1}{T_1}=\\frac{p_2V_2}{T_2}$ (lượng khí không đổi)", "$\\overline{E_d}=\\frac32k_BT$ (động năng tịnh tiến trung bình của phân tử)"],
            }),
            topic(12, {
                id: "magnetic-field", title: "Từ trường và cảm ứng điện từ", titleEn: "Magnetism and induction",
                summary: "Từ trường tác dụng lực lên dòng điện; từ thông biến thiên tạo ra suất điện động cảm ứng. Dùng hai ý tưởng này để hiểu máy phát điện và các đại lượng cơ bản của dòng điện xoay chiều.",
                summaryEn: "Magnetic fields exert forces on currents; changing flux induces an emf. These ideas explain generators and basic AC quantities.",
                lessons: ["Cảm ứng từ và lực từ lên đoạn dây mang dòng điện", "Từ thông, định luật Faraday và định luật Lenz", "Sự tạo thành và lan truyền sóng điện từ", "Tạo dòng điện xoay chiều; chu kì, tần số, cực đại và hiệu dụng"],
                lessonsEn: ["Magnetic flux density and force on a current", "Magnetic flux, Faraday's law and Lenz's law", "Generation and propagation of electromagnetic waves", "AC generation; period, frequency, peak and RMS values"],
                formulas: ["$F=BIl\\sin\\theta$ (đoạn dây thẳng trong từ trường đều)", "$\\Phi=BS\\cos\\alpha$ ($\\alpha$: góc giữa $\\vec B$ và pháp tuyến)", "$|e_{tb}|=N\\frac{|\\Delta\\Phi|}{\\Delta t}$", "$I=\\frac{I_0}{\\sqrt2};\\quad U=\\frac{U_0}{\\sqrt2}$ (xoay chiều hình sin)"],
            }),
            topic(12, {
                id: "nuclear-physics", title: "Vật lí hạt nhân và phóng xạ", titleEn: "Nuclear physics and radioactivity",
                summary: "Tìm hiểu cấu trúc hạt nhân, năng lượng liên kết và các quá trình phân rã. Chu kì bán rã mô tả quy luật thống kê của số hạt còn lại, không dự đoán thời điểm phân rã của từng hạt.",
                summaryEn: "Explore nuclear structure, binding energy and decay. Half-life describes a population statistically, not the decay time of an individual nucleus.",
                lessons: ["Cấu trúc hạt nhân, proton, neutron và đồng vị", "Độ hụt khối, năng lượng liên kết, phân hạch và tổng hợp", "Phóng xạ, độ phóng xạ và chu kì bán rã", "Ứng dụng hạt nhân và nguyên tắc an toàn phóng xạ"],
                lessonsEn: ["Nuclear structure, protons, neutrons and isotopes", "Mass defect, binding energy, fission and fusion", "Radioactivity, activity and half-life", "Nuclear applications and radiation safety"],
                formulas: ["$N_n=A-Z$", "$E_{lk}=\\Delta mc^2$", "$N=N_0e^{-\\lambda t}=N_0\\,2^{-t/T}$", "$H=\\lambda N;\\quad \\lambda=\\frac{\\ln2}{T}$"],
            }),
        ],
    },
};

export function getGradeCurriculum(grade: Grade): GradeCurriculum {
    return curriculum[grade];
}

export const CURRICULUM_SOURCES = [
    {
        title: "Chương trình GDPT 2018 môn Vật lí — Bộ GD&ĐT",
        url: "https://thcsandong.haiphong.edu.vn/van-ban-nganh/chuong-trinh-giao-duc-pho-thong-mon-vat-li-ban-hanh-kem-theo-thong-tu-so-322018/ctmb/20405/91189",
    },
    {
        title: "Thông tư 17/2025/TT-BGDĐT — phạm vi sửa đổi",
        url: "https://vanban.chinhphu.vn/?docid=215347&pageid=27160",
    },
];
