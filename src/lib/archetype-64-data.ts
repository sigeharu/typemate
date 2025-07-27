// 🎵 TypeMate 64Type Archetype System
// 64タイプアーキタイプデータ（16基本型 × 4称号）

import type { 
  BaseArchetype, 
  TitleType, 
  FullArchetype64, 
  ArchetypeData64 
} from '@/types';
import { ARCHETYPE_DATA } from './diagnostic-data';
import { TITLE_DATA } from './title-data';

// 64タイプアーキタイプデータ生成
export function generateArchetypeData64(
  base: BaseArchetype, 
  title: TitleType
): ArchetypeData64 {
  const baseData = ARCHETYPE_DATA[base];
  const titleData = TITLE_DATA[title];
  
  return {
    base,
    title,
    name: baseData.name,
    nameEn: baseData.nameEn,
    fullName: `${titleData.name}${baseData.name}`,
    description: `${titleData.description} ${baseData.description}`,
    traits: [...baseData.traits],
    titleTraits: [...titleData.traits],
    combinedPersonality: `${titleData.characteristics} ${baseData.personality}`,
    loveStyle: `${titleData.approach} ${baseData.loveStyle}`,
    uniqueCharm: `${titleData.name}の特性を持った${baseData.name}として、${baseData.loveStyle}`,
  };
}

// 全64タイプのデータマップ
export const ARCHETYPE_64_DATA: Record<FullArchetype64, ArchetypeData64> = {} as Record<FullArchetype64, ArchetypeData64>;

// データ初期化
function initializeArchetypeData64() {
  const baseTypes: BaseArchetype[] = [
    'ARC', 'ALC', 'SOV', 'INV',  // 分析家
    'SAG', 'DRM', 'HER', 'BAR',  // 外交官  
    'GUA', 'DEF', 'EXE', 'PRO',  // 番人
    'ART', 'ARS', 'PIO', 'PER'   // 探検家
  ];
  
  const titleTypes: TitleType[] = ['HARMONIC', 'PIONEERING', 'SOLITARY', 'CHALLENGING'];
  
  baseTypes.forEach(base => {
    titleTypes.forEach(title => {
      const fullType = `${title}_${base}` as FullArchetype64;
      ARCHETYPE_64_DATA[fullType] = generateArchetypeData64(base, title);
    });
  });
}

// データ初期化実行
initializeArchetypeData64();

// 64タイプデータ取得関数
export function getArchetypeData64(fullArchetype: FullArchetype64): ArchetypeData64 {
  return ARCHETYPE_64_DATA[fullArchetype];
}

// 基本型と称号から64タイプデータ取得
export function getArchetypeDataByComponents(
  base: BaseArchetype, 
  title: TitleType
): ArchetypeData64 {
  const fullType = `${title}_${base}` as FullArchetype64;
  return getArchetypeData64(fullType);
}

// 特別な組み合わせ例（ENFP → 開拓の吟遊詩人）
export const SPECIAL_COMBINATIONS = {
  'PIONEERING_BAR': {
    specialDescription: '新しい出会いと冒険を求めながらも、仲間との絆を大切にする自由な魂。',
    uniqueCharm: '好奇心旺盛で創造性に富み、人々にインスピレーションを与える魅力的な存在',
    loveMessage: 'あなたとの毎日を新鮮な発見で満たし、共に成長していきたい冒険好きなパートナー'
  },
  'HARMONIC_SAG': {
    specialDescription: '深い洞察力で人々を理解し、調和の取れた関係を築きながら導く賢者。',
    uniqueCharm: '静かながら深い魅力を持ち、安定した関係の中で真の理解を示す',
    loveMessage: '穏やかで深い愛情を持ち、あなたの本質を理解し支え続けるパートナー'
  }
} as const;

// 特別な組み合わせかチェック
export function hasSpecialCombination(fullArchetype: FullArchetype64): boolean {
  return fullArchetype in SPECIAL_COMBINATIONS;
}

// 特別な組み合わせデータ取得
export function getSpecialCombination(fullArchetype: FullArchetype64) {
  return SPECIAL_COMBINATIONS[fullArchetype as keyof typeof SPECIAL_COMBINATIONS];
}