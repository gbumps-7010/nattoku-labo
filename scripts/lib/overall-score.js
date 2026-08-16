/**
 * 総合点 = 機能平均点 × 0.85 ＋ 口コミ信頼度 × 0.15
 * 機能平均点 = performanceAnalysis 各軸 score の単純平均
 */

const AXIS_KEYS = [
  "floorCleaning",
  "carpetCleaning",
  "petHairRemoval",
  "quietness",
  "stepClimbing",
  "maintenance",
  "appStability",
  "batteryLife",
];

function round1(n) {
  return Math.round(n * 10) / 10;
}

function formatScore(n) {
  if (!Number.isFinite(n)) return null;
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function collectFeatureScores(performanceAnalysis) {
  if (!performanceAnalysis || typeof performanceAnalysis !== "object") return [];

  const scores = [];
  const seen = new Set();

  for (const key of AXIS_KEYS) {
    const alt =
      key === "petHairRemoval"
        ? performanceAnalysis.petHairRemoval || performanceAnalysis.petHair
        : key === "quietness"
          ? performanceAnalysis.quietness || performanceAnalysis.nightQuietness
          : performanceAnalysis[key];
    const raw = alt?.score;
    const n = Number(raw);
    if (!Number.isFinite(n)) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    scores.push(n);
  }

  // Fallback: any remaining *.score under performanceAnalysis
  if (scores.length === 0) {
    for (const value of Object.values(performanceAnalysis)) {
      const n = Number(value?.score);
      if (Number.isFinite(n)) scores.push(n);
    }
  }

  return scores;
}

function computeOverallScores(data) {
  const scores = collectFeatureScores(data?.performanceAnalysis);
  if (!scores.length) return null;

  const featureAverageScore = round1(scores.reduce((a, b) => a + b, 0) / scores.length);
  const reliability = Number(data.reliabilityScore ?? data.reliability?.score);
  if (!Number.isFinite(reliability)) {
    return {
      featureAverageScore,
      featureAverageScoreDisplay: formatScore(featureAverageScore),
      reliabilityScore: null,
      reliabilityScoreDisplay: null,
      overallScore: null,
      overallScoreDisplay: null,
    };
  }

  const overallScore = round1(featureAverageScore * 0.85 + reliability * 0.15);
  return {
    featureAverageScore,
    featureAverageScoreDisplay: formatScore(featureAverageScore),
    reliabilityScore: reliability,
    reliabilityScoreDisplay: formatScore(reliability),
    overallScore,
    overallScoreDisplay: formatScore(overallScore),
  };
}

module.exports = {
  AXIS_KEYS,
  computeOverallScores,
  formatScore,
  round1,
};
