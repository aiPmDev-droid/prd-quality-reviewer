export interface SMARTScore {
  /** Score 0–100 for how well the PRD is Specific */
  specific: ScoreDetail;
  /** Score 0–100 for how well the PRD is Measurable */
  measurable: ScoreDetail;
  /** Score 0–100 for how well the PRD is Achievable */
  achievable: ScoreDetail;
  /** Score 0–100 for how well the PRD is Relevant */
  relevant: ScoreDetail;
  /** Score 0–100 for how well the PRD is Time-bound */
  timeBound: ScoreDetail;
}

export interface ScoreDetail {
  score: number;       // 0–100
  reasoning: string;   // Why this score was given
  suggestions: string; // What could be improved
}

export interface ReviewResponse {
  overall: number;
  smart: SMARTScore;
  summary: string;
}

export interface ReviewRequest {
  prdText: string;
}