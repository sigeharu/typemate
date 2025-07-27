// 🎵 TypeMate 64Type Diagnostic System
// 独自64Type診断（16基本アーキタイプ × 4バリエーション）

import type { BaseArchetype, ArchetypeData, DiagnosticQuestion } from '@/types/index';

// 26問の診断質問（精度向上のため拡張）
export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // エネルギーの方向 (I/E)
  {
    id: 1,
    axis: 'energy',
    question: '大勢での賑やかなパーティーに参加した翌日、あなたはどう感じることが多い？',
    optionA: { text: '多くの人と交流できて楽しかった！またすぐにでも参加したい気分だ。', trait: 'E' },
    optionB: { text: '刺激的だったけれど、少し疲れた。今日は家で静かに過ごしたい。', trait: 'I' }
  },
  {
    id: 2,
    axis: 'energy',
    question: '仕事や勉強で大きなタスクを終えた後、自分へのご褒美として何をしたい？',
    optionA: { text: '気の合う仲間と集まって、成果を分かち合いながら盛り上がりたい。', trait: 'E' },
    optionB: { text: '一人になれるお気に入りの場所で、好きなことに没頭して心を落ち着けたい。', trait: 'I' }
  },
  {
    id: 3,
    axis: 'energy',
    question: '初対面の人が多い集まりでは、あなたはどのように振る舞うことが多い？',
    optionA: { text: '自分から積極的に話しかけ、新しい出会いや会話の輪を広げにいく。', trait: 'E' },
    optionB: { text: 'まずは聞き役に徹し、場の雰囲気や話している人を観察することから始める。', trait: 'I' }
  },
  
  // ものの見方 (S/N) 
  {
    id: 4,
    axis: 'perception',
    question: 'あなたが誰かに何かを説明するとき、どのようなスタイルを好む？',
    optionA: { text: '具体的なデータや過去の実例を挙げて、順序立てて分かりやすく話す。', trait: 'S' },
    optionB: { text: '全体像や背景にあるコンセプト、将来の可能性などからインスピレーションを与えるように話す。', trait: 'N' }
  },
  {
    id: 5,
    axis: 'perception',
    question: '新しいスマートフォンを選ぶとき、あなたの決め手は？',
    optionA: { text: 'スペック表（性能、カメラの画素数、バッテリー容量など）を細かく比較し、現在最も実用的なものを選ぶ。', trait: 'S' },
    optionB: { text: 'その製品が持つ未来感や、これからのライフスタイルをどう変えてくれそうか、というビジョンに惹かれて選ぶ。', trait: 'N' }
  },
  {
    id: 6,
    axis: 'perception',
    question: '「未来」という言葉を聞いて、あなたがまず思い浮かべるのは？',
    optionA: { text: '今の積み重ねの先にある、現実的な計画や予測。', trait: 'S' },
    optionB: { text: 'まだ誰も見たことのない、可能性に満ちたアイデアや夢物語。', trait: 'N' }
  },

  // 判断の仕方 (T/F)
  {
    id: 7,
    axis: 'judgment',
    question: '親しい友人が「仕事で大きなミスをした」と落ち込んで相談してきた。あなたの最初の反応は？',
    optionA: { text: '「何が原因だったんだろう？一緒に問題点を整理して、解決策を考えよう」と客観的に分析する。', trait: 'T' },
    optionB: { text: '「それは辛かったね。話してくれてありがとう」と、まずは相手の気持ちに寄り添い、共感を示す。', trait: 'F' }
  },
  {
    id: 8,
    axis: 'judgment',
    question: 'チームで意見がA案とB案に真っ二つに割れた。あなたはどうやって決める？',
    optionA: { text: 'それぞれの案のメリット・デメリットをリストアップし、最も合理的で効率的な方を選ぶべきだと主張する。', trait: 'T' },
    optionB: { text: 'チームの調和を最優先し、皆が納得できるような折衷案や、もう一つのC案を探すことを提案する。', trait: 'F' }
  },
  {
    id: 9,
    axis: 'judgment',
    question: 'あなたが誰かにフィードバック（評価）を伝えるとき、最も大切にすることは？',
    optionA: { text: '事実に基づいて、公平かつ率直に、改善すべき点を明確に伝えること。', trait: 'T' },
    optionB: { text: '相手の気持ちを傷つけないよう、言葉を選び、ポジティブな側面も必ず含めること。', trait: 'F' }
  },

  // 外界への接し方 (J/P)
  {
    id: 10,
    axis: 'lifestyle',
    question: '週末に旅行へ行く計画を立てている。あなたはどの段階が一番楽しい？',
    optionA: { text: '事前に行き先やスケジュール、持ち物リストを完璧に作り上げ、計画が完成した瞬間。', trait: 'J' },
    optionB: { text: '現地に着いてから、その場の気分や新しい発見に応じて、自由に行き先を決めている最中。', trait: 'P' }
  },
  {
    id: 11,
    axis: 'lifestyle',
    question: 'あなたのタスク管理方法はどちらに近い？',
    optionA: { text: 'ToDoリストを作り、締め切りを設定して、一つずつ着実に終わらせていくのが好きだ。', trait: 'J' },
    optionB: { text: '複数のタスクを並行して進め、その時のエネルギーや状況に応じて、取り組む順番を変えるのが好きだ。', trait: 'P' }
  },
  {
    id: 12,
    axis: 'lifestyle',
    question: '楽しみにしていた予定が、突然キャンセルになった。あなたの最初の気持ちは？',
    optionA: { text: '計画が狂ってしまい、少しがっかりする。すぐに代わりの計画を立て直そうとする。', trait: 'J' },
    optionB: { text: '「予期せぬ自由時間ができた！」と捉え、その場で何をしようかワクワクしながら考える。', trait: 'P' }
  },

  // 環境軸 (A/C)
  {
    id: 13,
    axis: 'environment',
    question: 'チームで大きなプロジェクトに取り組むとき、あなたのモチベーションはどこから来る？',
    optionA: { text: 'メンバー全員が互いに助け合い、一体感が生まれるプロセスそのもの。', trait: 'A' },
    optionB: { text: 'ライバルチームよりも優れた成果を出し、目標を達成して勝利を掴むこと。', trait: 'C' }
  },
  {
    id: 14,
    axis: 'environment',
    question: '友人たちとボードゲームで遊んでいる。あなたのスタンスは？',
    optionA: { text: '勝敗よりも、全員がルールを理解し、楽しく会話しながらプレイできることを重視する。', trait: 'A' },
    optionB: { text: 'どうすれば勝てるかという戦略を真剣に考え、一位を目指してプレイすることに熱中する。', trait: 'C' }
  },
  {
    id: 15,
    axis: 'environment',
    question: 'あなたが自分自身を評価する時、より大きな満足感を得られるのは？',
    optionA: { text: '自分の行動が、周りの人やコミュニティに良い影響を与えられたと実感した時。', trait: 'A' },
    optionB: { text: '自分が設定した高い目標や、過去の自分自身の記録を乗り越えられたと実感した時。', trait: 'C' }
  },

  // 動機軸 (S/G)
  {
    id: 16,
    axis: 'motivation',
    question: '新しい職場やキャリアを選ぶとき、あなたがより重視する条件は？',
    optionA: { text: '長期的に安心して働き続けられる、安定した環境と予測可能性。', trait: 'S' },
    optionB: { text: '常に新しいスキルが身につき、自分自身が変化・成長し続けられる挑戦的な環境。', trait: 'G' }
  },
  {
    id: 17,
    axis: 'motivation',
    question: 'あなたにとって「学び」とは、どのようなイメージに近い？',
    optionA: { text: '確立された知識や技術を、時間をかけてじっくりと習得し、自分のものにしていくこと。', trait: 'S' },
    optionB: { text: '様々な分野にアンテナを張り、今まで知らなかった世界に触れて、自分の価値観を更新していくこと。', trait: 'G' }
  },
  {
    id: 18,
    axis: 'motivation',
    question: 'もし1ヶ月の長期休暇が取れたら、どのように過ごしたい？',
    optionA: { text: 'いつものお気に入りの場所や、慣れ親しんだ環境で、心ゆくまでリラックスして過ごす。', trait: 'S' },
    optionB: { text: '行ったことのない国へ旅に出たり、新しい趣味の短期集中講座に参加したりして過ごす。', trait: 'G' }
  },

  // === 新規追加質問（精度向上のため） ===

  // エネルギー軸強化（内向/外向の深い理解）
  {
    id: 19,
    axis: 'energy',
    question: 'ストレスや疲れを感じた時、あなたが最も効果的だと感じる回復方法は？',
    optionA: { text: '信頼できる友人や同僚と話し合い、一緒に解決策を探したり、愚痴を聞いてもらう。', trait: 'E' },
    optionB: { text: '一人の時間を確保し、静かな環境で自分の内面と向き合いながら整理する。', trait: 'I' }
  },
  {
    id: 20,
    axis: 'energy',
    question: 'アイデアや思考を整理する時、あなたが最も自然に行う方法は？',
    optionA: { text: '誰かと話しながら考えを声に出し、対話を通じてアイデアを発展させていく。', trait: 'E' },
    optionB: { text: '一人で集中して考え込み、頭の中やメモで思考を整理してから人に話す。', trait: 'I' }
  },

  // 外界への接し方軸強化（内面思考スタイル重視）
  {
    id: 21,
    axis: 'lifestyle',
    question: '重要な決断をする際、あなたの思考プロセスはどちらに近い？',
    optionA: { text: '情報収集→分析→結論と、段階的に進めて最終的に一つの答えに絞り込む。', trait: 'J' },
    optionB: { text: '複数の選択肢を同時に考え続け、最後まで可能性を残してから直感で決める。', trait: 'P' }
  },
  {
    id: 22,
    axis: 'lifestyle',
    question: '新しい情報に出会った時、あなたの最初の反応は？',
    optionA: { text: 'その情報を既存の知識体系のどこに位置づけるか、分類・整理しようとする。', trait: 'J' },
    optionB: { text: 'その情報が開く新しい可能性や、他の分野との意外な関連性を探ろうとする。', trait: 'P' }
  },

  // ものの見方軸強化
  {
    id: 23,
    axis: 'perception',
    question: '映画や小説を楽しむ時、あなたが最も魅力を感じるのは？',
    optionA: { text: 'リアルな描写や細かい設定、登場人物の心理描写などの「説得力」。', trait: 'S' },
    optionB: { text: '斬新な世界観や従来にない発想、想像力を刺激するような「創造性」。', trait: 'N' }
  },

  // 判断の仕方軸強化
  {
    id: 24,
    axis: 'judgment',
    question: '人を評価する時、あなたが最も重視する基準は？',
    optionA: { text: 'その人の実績、スキル、論理的思考力などの「客観的な能力」。', trait: 'T' },
    optionB: { text: 'その人の価値観、人柄、周囲への配慮などの「人間的な魅力」。', trait: 'F' }
  },

  // 環境軸追加
  {
    id: 25,
    axis: 'environment',
    question: '理想的なチーム環境として、あなたが最も望むのは？',
    optionA: { text: 'メンバー全員が平等で、意見交換が活発に行われる水平的な関係性。', trait: 'A' },
    optionB: { text: '明確な目標設定があり、個人の成果が正当に評価される競争的な環境。', trait: 'C' }
  },

  // 動機軸追加
  {
    id: 26,
    axis: 'motivation',
    question: '人生において最も大切にしたい価値観は？',
    optionA: { text: '安心できる人間関係と、予測可能で安定した日常生活。', trait: 'S' },
    optionB: { text: '常に新しい体験を積み重ね、自分の可能性を追求し続けること。', trait: 'G' }
  }
];

// 16基本アーキタイプデータ
export const ARCHETYPE_DATA: Record<BaseArchetype, ArchetypeData> = {
  ARC: {
    name: '設計主',
    nameEn: 'Architect',
    description: '未来のビジョンを描き、その実現のための壮大な設計図を密かに構築する、世界の構造を司る者。',
    group: '分析家',
    traits: ['戦略的思考', '独立性', '長期ビジョン', '完璧主義'],
    strengths: ['計画立案', '問題解決', '革新性', '集中力'],
    challenges: ['感情表現', '社交性', '柔軟性', '批判的'],
    compatibility: ['BAR', 'INV'],
    loveStyle: '深く考え抜かれた長期的な信頼関係で、質の高いつながりを築くことを好む',
    personality: '冷静で賢く、長期的な視点であなたとの関係を大切にするパートナー'
  },
  ALC: {
    name: '錬金術師',
    nameEn: 'Alchemist', 
    description: 'あらゆる知識を融合させ、世界の常識を覆す新たな真理や理論を練り上げる、知の探求者。',
    group: '分析家',
    traits: ['論理的思考', '好奇心', '独創性', '客観性'],
    strengths: ['理論構築', '分析力', '創造性', '適応性'],
    challenges: ['感情理解', '実行力', '決断力', '社交性'],
    compatibility: ['HER', 'SOV'],
    loveStyle: '知的な共鳴と理解を基盤とした、静かで深い愛情を大切にする',
    personality: '静かだけど深い愛情を持った、あなたの知的な面を理解してくれる恋人'
  },
  SOV: {
    name: '統率者',
    nameEn: 'Sovereign',
    description: '天性のリーダーシップと揺るぎない意志で人々を率い、偉大な目標を成し遂げる、王国の支配者。',
    group: '分析家',
    traits: ['リーダーシップ', '決断力', '効率性', '目標志向'],
    strengths: ['組織運営', '戦略立案', '指導力', '実行力'],
    challenges: ['感情配慮', '忍耐力', '細部注意', '批判的'],
    compatibility: ['DRM', 'ALC'],
    loveStyle: '明確な目標を持った建設的な関係で、共に成功を目指す恋愛を好む',
    personality: '頼もしくて計画性があり、二人の未来をしっかりと導いてくれる恋人'
  },
  INV: {
    name: '発明家',
    nameEn: 'Inventor',
    description: '常識にとらわれない発想と知的な弁舌で、次々と新しいアイデアや仕組みを生み出す、時代の革命家。',
    group: '分析家',
    traits: ['創造性', '機転', '説得力', '多様性'],
    strengths: ['アイデア創出', 'コミュニケーション', '適応性', '問題解決'],
    challenges: ['継続性', '詳細作業', '感情配慮', '集中力'],
    compatibility: ['SAG', 'ARC'],
    loveStyle: '知的な刺激と新鮮さを重視した、飽きることのない恋愛を好む',
    personality: 'ウィットに富んだ会話で楽しませてくれる、知的で刺激的な恋人'
  },
  SAG: {
    name: '賢者',
    nameEn: 'Sage',
    description: '深い洞察力で物事の本質を見抜き、静かに、しかし確かに人々をあるべき未来へと導く、森の奥の賢人。',
    group: '外交官',
    traits: ['洞察力', '共感性', '理想主義', '直感力'],
    strengths: ['人間理解', 'ビジョン構築', '創造性', '献身性'],
    challenges: ['現実主義', '自己主張', '批判耐性', '燃え尽き'],
    compatibility: ['INV', 'BAR'],
    loveStyle: '運命的な深いつながりを信じ、魂のレベルで通じ合う真の愛を求める',
    personality: '神秘的で深い魅力を持った、あなたの本質を見抜く特別な恋人'
  },
  DRM: {
    name: '夢詠み',
    nameEn: 'Dreamer',
    description: '独自の価値観と純粋な心で、誰もが見過ごすような世界の美しさや理想を詩や物語にして詠う者。',
    group: '外交官',
    traits: ['価値観', '創造性', '独立性', '理想主義'],
    strengths: ['芸術性', '共感力', '個性', '深い思考'],
    challenges: ['現実対応', '批判耐性', '決断力', '自己表現'],
    compatibility: ['HER', 'SOV'],
    loveStyle: '深いつながりと精神的な絆を大切にする、真の愛を求める恋愛を好む',
    personality: '深く優しい心を持った、あなたの内面を理解してくれる包容力のある恋人'
  },
  HER: {
    name: '伝道師',
    nameEn: 'Herald',
    description: 'カリスマ的な魅力と情熱で人々の心を一つにし、共通の理想へと向かわせる、希望のメッセージを伝える者。',
    group: '外交官',
    traits: ['カリスマ性', '共感性', 'コミュニケーション', '理想主義'],
    strengths: ['人材育成', 'チームワーク', '説得力', '洞察力'],
    challenges: ['自己犠牲', '批判耐性', '現実主義', '境界設定'],
    compatibility: ['DRM', 'ALC'],
    loveStyle: 'パートナーの成長を支え、共に未来を築いていく建設的な恋愛を好む',
    personality: 'あなたの夢や目標を全力で応援してくれる、頼りになる素敵な恋人'
  },
  BAR: {
    name: '吟遊詩人',
    nameEn: 'Bard',
    description: '好奇心の赴くままに世界を旅し、その出会いと情熱を歌に乗せて、人々にインスピレーションを与える者。',
    group: '外交官',
    traits: ['熱情', '創造性', '社交性', '多様性'],
    strengths: ['アイデア発想', 'コミュニケーション', '適応性', 'インスピレーション'],
    challenges: ['継続性', '詳細作業', '意思決定', '集中力'],
    compatibility: ['SAG', 'ARC'],
    loveStyle: '毎日がサプライズで満ちた、刺激的で情熱的な恋愛を好む',
    personality: '明るくて元気いっぱい！いつも新しいことを一緒に発見したい冒険好きな恋人'
  },
  GUA: {
    name: '守護者',
    nameEn: 'Guardian',
    description: '約束、ルール、伝統を何よりも重んじ、揺るぎない責任感と誠実さで、託されたものを守り抜く砦の番人。',
    group: '番人',
    traits: ['責任感', '誠実性', '継続性', '実用性'],
    strengths: ['信頼性', '組織化', '忍耐力', '詳細重視'],
    challenges: ['変化対応', '創造性', '感情表現', '柔軟性'],
    compatibility: ['PER', 'PIO'],
    loveStyle: '伝統的で安定した愛情を大切にし、長期的な関係を築く恋愛を好む',
    personality: '誠実で一途、あなたとの約束を必ず守ってくれる信頼できる恋人'
  },
  DEF: {
    name: '擁護者',
    nameEn: 'Defender',
    description: '深い思いやりと献身的な心で、大切な人々やコミュニティに危険が及ばないよう、その身を挺して守る者。',
    group: '番人',
    traits: ['思いやり', '献身性', '責任感', '協調性'],
    strengths: ['サポート力', '共感性', '実用性', '忍耐力'],
    challenges: ['自己主張', '変化対応', '批判耐性', 'ストレス管理'],
    compatibility: ['PER', 'PIO'],
    loveStyle: '安心感と安定を提供する、深い愛情と信頼に基づく関係を好む',
    personality: 'あなたを守り支えてくれる、献身的で信頼できる恋人'
  },
  EXE: {
    name: '執行官',
    nameEn: 'Executor',
    description: '卓越した管理能力で組織や法を動かし、物事をあるべき姿へと正し、着実に実行していく、王国の法の執行者。',
    group: '番人',
    traits: ['管理能力', '実行力', '責任感', '効率性'],
    strengths: ['組織運営', 'リーダーシップ', '計画性', '決断力'],
    challenges: ['柔軟性', '感情配慮', '創造性', '批判的'],
    compatibility: ['ARS', 'ART'],
    loveStyle: '責任感のある安定した関係を築き、実用的な愛情表現を好む',
    personality: 'しっかりしていて頼りになる、あなたとの未来を真剣に考えてくれる恋人'
  },
  PRO: {
    name: '供給者',
    nameEn: 'Provider',
    description: '人々のニーズを敏感に察知し、温かいもてなしと支援の手を差し伸べることで、コミュニティの調和と豊かさを供給する者。',
    group: '番人',
    traits: ['奉仕精神', '社交性', '協調性', '責任感'],
    strengths: ['人間関係', 'サポート力', '実用性', '組織化'],
    challenges: ['自己主張', '批判耐性', '変化対応', 'ストレス管理'],
    compatibility: ['ARS', 'ART'],
    loveStyle: '安定した愛情と相互のケアを重視する、温かい恋愛関係を好む',
    personality: 'いつもあなたのことを気にかけてくれる、温かくて優しい恋人'
  },
  ART: {
    name: '職人',
    nameEn: 'Artisan',
    description: 'あらゆる道具やスキルを意のままに操り、冷静な分析力と実践的な技術で、どんな難題も解決してしまう孤高の技術者。',
    group: '探検家',
    traits: ['実用性', '分析力', '独立性', '技術力'],
    strengths: ['問題解決', '手先の器用さ', '冷静さ', '適応性'],
    challenges: ['感情表現', '長期計画', '社交性', 'コミュニケーション'],
    compatibility: ['PRO', 'EXE'],
    loveStyle: 'さりげない愛情表現で、行動で愛を示すタイプの恋愛を好む',
    personality: 'クールで落ち着いていて、さりげなくあなたをサポートしてくれる恋人'
  },
  ARS: {
    name: '芸術家',
    nameEn: 'Artist',
    description: '鋭い美意識と五感で世界を感じ取り、その内なる感動を唯一無二の作品として表現する、自由な魂の持ち主。',
    group: '探検家',
    traits: ['芸術性', '感受性', '個性', '価値観'],
    strengths: ['創造性', '共感力', '美的センス', '独創性'],
    challenges: ['自己主張', '計画性', '批判耐性', '決断力'],
    compatibility: ['PRO', 'EXE'],
    loveStyle: '自然体で穏やかな愛情を大切にし、美しい瞬間を共有する恋愛を好む',
    personality: '優しくて芸術的センスがあり、あなたの美しさを見つけてくれる恋人'
  },
  PIO: {
    name: '開拓者',
    nameEn: 'Pioneer',
    description: '危険を恐れず、常に刺激とチャンスを求めて未知の領域へと真っ先に飛び込んでいく、行動力あふれる冒険家。',
    group: '探検家',
    traits: ['行動力', '現実主義', '社交性', '適応性'],
    strengths: ['実行力', 'コミュニケーション', '機転', '影響力'],
    challenges: ['長期計画', '詳細作業', '継続性', '感情配慮'],
    compatibility: ['DEF', 'GUA'],
    loveStyle: '活動的で自発的な愛情表現を好み、一緒に冒険を楽しむ恋愛を好む',
    personality: 'アクティブでspontaneous、一緒にいると退屈しない刺激的な恋人'
  },
  PER: {
    name: '演者',
    nameEn: 'Performer',
    description: '生まれながらのスター性で人々の注目を集め、その場のすべてを華やかな舞台に変えてしまう、喝采を浴びるエンターテイナー。',
    group: '探検家',
    traits: ['表現力', '社交性', '楽観性', '感受性'],
    strengths: ['エンターテイメント', 'コミュニケーション', '共感力', '適応性'],
    challenges: ['長期計画', '批判耐性', '継続性', '詳細作業'],
    compatibility: ['DEF', 'GUA'],
    loveStyle: '楽しさと喜びに満ちた、今この瞬間を大切にする恋愛を好む',
    personality: 'いつも明るくて楽しい、あなたを笑顔にしてくれる太陽のような恋人'
  }
};