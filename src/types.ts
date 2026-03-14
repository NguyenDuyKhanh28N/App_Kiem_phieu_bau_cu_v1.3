export type Candidate = {
  id: string;
  name: string;
  order: number;
};

export type InvalidReason =
  | 'WRONG_TEMPLATE'
  | 'NO_STAMP'
  | 'TOO_MANY'
  | 'ALL_CROSSED'
  | 'ADDED_NAMES'
  | 'OTHER';

export type Vote = {
  id: string;
  batchId: string;
  isValid: boolean;
  invalidReason?: InvalidReason;
  selectedCandidateIds: string[]; // IDs of candidates that are SELECTED (not crossed out)
  timestamp: number;
};

export type Batch = {
  id: string;
  name: string;
  expectedCount: number;
  createdAt: number;
};

export type ElectionConfig = {
  candidates: Candidate[];
  maxSelectable: number;
};

export type AppState = {
  config: ElectionConfig | null;
  batches: Batch[];
  votes: Vote[];
  activeBatchId: string | null;
};
