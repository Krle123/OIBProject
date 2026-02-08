export interface TrendPoint {
  date: string;
  value: number;
}

export interface AnalysisData {
  total?: number;
  period?: string | { start?: string; end?: string };
  items?: any[];
  breakdown?: any;
  trend?: TrendPoint[];
  meta?: Record<string, any>;
}

export default AnalysisData;
