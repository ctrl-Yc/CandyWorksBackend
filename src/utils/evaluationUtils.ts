// src/utils/evaluationUtils.ts

// ✅ スキルレベル判定（passed_count → level）
export function getSkillLevel(passed: number): number {
  if (passed >= 15) return 5;
  if (passed >= 10) return 4;
  if (passed >= 5) return 3;
  if (passed >= 3) return 2;
  if (passed >= 1) return 1;
  return 0;
}

// ✅ スキルレベル件数をカウント
export function countLevels(levels: number[]) {
  return {
    l1: levels.filter((l) => l >= 1).length,
    l2: levels.filter((l) => l >= 2).length,
    l3: levels.filter((l) => l >= 3).length,
    l4: levels.filter((l) => l >= 4).length,
    l5: levels.filter((l) => l >= 5).length,
  };
}

// ✅ 段階的ランク昇格（飛び級防止）
export function getUserRankSequential({
  l1,
  l2,
  l3,
  l4,
  l5,
}: {
  l1: number;
  l2: number;
  l3: number;
  l4: number;
  l5: number;
}): number {
  if (l5 >= 20) return 10;
  if (l5 >= 10) return 9;
  if (l4 >= 10) return 8;
  if (l4 >= 5) return 7;
  if (l3 >= 10) return 6;
  if (l3 >= 5) return 5;
  if (l2 >= 10) return 4;
  if (l2 >= 5) return 3;
  if (l1 >= 5) return 2;
  return 1;
}