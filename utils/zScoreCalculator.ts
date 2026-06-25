interface MilestoneData {
  [month: number]: [number, number, number]; // [minus1SD, median, plus1SD]
}

const boysBB: MilestoneData = {
  0: [2.9, 3.3, 3.9],
  6: [7.1, 7.9, 8.8],
  12: [8.6, 9.6, 10.8],
  18: [9.8, 10.9, 12.2],
  24: [10.8, 12.2, 13.6],
  30: [11.8, 13.3, 15.0],
  36: [12.7, 14.3, 16.2],
  42: [13.6, 15.3, 17.4],
  48: [14.4, 16.3, 18.5],
  54: [15.2, 17.3, 19.7],
  60: [16.0, 18.3, 21.0]
};

const girlsBB: MilestoneData = {
  0: [2.8, 3.2, 3.7],
  6: [6.5, 7.3, 8.2],
  12: [7.9, 8.9, 10.1],
  18: [9.1, 10.2, 11.5],
  24: [10.2, 11.5, 13.0],
  30: [11.2, 12.7, 14.4],
  36: [12.2, 13.9, 15.8],
  42: [13.1, 15.0, 17.1],
  48: [14.0, 16.1, 18.5],
  54: [14.9, 17.2, 19.8],
  60: [15.8, 18.2, 21.0]
};

const boysTB: MilestoneData = {
  0: [48.0, 49.9, 51.8],
  6: [65.5, 67.6, 69.8],
  12: [73.0, 75.7, 78.0],
  18: [78.6, 81.5, 84.0],
  24: [85.0, 87.8, 90.5],
  30: [89.2, 92.1, 95.0],
  36: [93.0, 96.1, 99.0],
  42: [96.7, 100.0, 103.0],
  48: [100.0, 103.3, 107.0],
  54: [103.2, 106.7, 110.5],
  60: [106.0, 110.0, 114.0]
};

const girlsTB: MilestoneData = {
  0: [47.0, 49.1, 51.0],
  6: [63.5, 65.7, 68.0],
  12: [71.5, 74.0, 76.5],
  18: [77.2, 80.0, 82.8],
  24: [83.5, 86.4, 89.2],
  30: [87.7, 90.7, 93.6],
  36: [92.0, 95.1, 98.0],
  42: [95.7, 99.0, 102.2],
  48: [99.5, 102.7, 106.0],
  54: [102.6, 106.2, 109.8],
  60: [105.7, 109.4, 113.0]
};

export function calculateZScore(
  value: number,
  ageInMonths: number,
  gender: "M" | "F" | string,
  type: "BB" | "TB"
): number {
  const normGender = gender === "F" ? "F" : "M";
  const data = type === "BB"
    ? (normGender === "F" ? girlsBB : boysBB)
    : (normGender === "F" ? girlsTB : boysTB);

  const age = Math.max(0, Math.min(60, ageInMonths));

  const keys = [0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60];
  let k1 = 0;
  let k2 = 60;
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] <= age) k1 = keys[i];
  }
  for (let i = keys.length - 1; i >= 0; i--) {
    if (keys[i] >= age) k2 = keys[i];
  }

  const ratio = k1 === k2 ? 0 : (age - k1) / (k2 - k1);
  const val1 = data[k1];
  const val2 = data[k2];

  const minus1SD = val1[0] + ratio * (val2[0] - val1[0]);
  const median = val1[1] + ratio * (val2[1] - val1[1]);
  const plus1SD = val1[2] + ratio * (val2[2] - val1[2]);

  if (value > median) {
    const diff = plus1SD - median;
    return diff === 0 ? 0 : (value - median) / diff;
  } else if (value < median) {
    const diff = median - minus1SD;
    return diff === 0 ? 0 : (value - median) / diff;
  } else {
    return 0;
  }
}

export function getNutritionalStatus(zScoreBB: number, zScoreTB: number): string {
  if (zScoreTB < -2) {
    return "Pendek / Stunting";
  }
  if (zScoreBB < -3) {
    return "Gizi Buruk";
  }
  if (zScoreBB < -2) {
    return "Gizi Kurang";
  }
  return "Normal";
}
