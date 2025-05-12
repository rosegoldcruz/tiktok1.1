import { SimpleLinearRegression } from 'ml-regression';

export function exponentialRegression(data: number[]): { slope: number; intercept: number } {
  // Convert to logarithmic scale for exponential regression
  const logData = data.map(y => Math.log(Math.max(y, 0.01)));
  const xValues = Array.from({ length: data.length }, (_, i) => i);
  
  const regression = new SimpleLinearRegression(xValues, logData);
  
  return {
    slope: regression.slope,
    intercept: Math.exp(regression.intercept)
  };
}

export function calculateConfidenceInterval(data: number[], confidence = 0.95): {
  lower: number;
  upper: number;
  mean: number;
} {
  const n = data.length;
  const mean = data.reduce((a, b) => a + b) / n;
  const standardDeviation = Math.sqrt(
    data.reduce((sq, x) => sq + Math.pow(x - mean, 2), 0) / (n - 1)
  );
  const standardError = standardDeviation / Math.sqrt(n);
  const criticalValue = 1.96; // 95% confidence interval

  return {
    lower: mean - criticalValue * standardError,
    upper: mean + criticalValue * standardError,
    mean
  };
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function predictTimeToTarget(
  currentValue: number,
  targetValue: number,
  growthRate: number
): number {
  if (growthRate <= 0) return Infinity;
  return Math.log(targetValue / currentValue) / Math.log(1 + growthRate / 100);
}