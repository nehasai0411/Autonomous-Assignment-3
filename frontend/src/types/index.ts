export interface Framework {
  arguments: string[];
  attacks: [string, string][];
}

export type AgentOwnership = Record<string, string[]>;

export interface ExtensionSummary {
  grounded: string[][];
  complete: string[][];
  preferred: string[][];
  stable: string[][];
  semi_stable: string[][];
}

export interface GroundedIterationStep {
  step: number;
  set: string[];
  new_added: string[];
  description: string;
}

export type LegalLabelling = Record<string, 'IN' | 'OUT' | 'UNDEC'>;

export interface AnalysisResponse {
  arguments: string[];
  attacks: [string, string][];
  extensions: ExtensionSummary;
  grounded_iteration_log: GroundedIterationStep[];
  legal_labellings: LegalLabelling[];
  counts: {
    arguments: number;
    attacks: number;
    complete: number;
    preferred: number;
    stable: number;
    semi_stable: number;
    labellings: number;
  };
}

export interface SetCheckResponse {
  argument_set: string[];
  is_conflict_free: boolean;
  is_admissible: boolean;
  is_complete_extension: boolean;
  is_stable_extension: boolean;
  characteristic_function: string[];
  range_plus: string[];
  defends_all_elements: boolean;
  fixed_point_of_characteristic: boolean;
}

export interface DefenceCheckResponse {
  argument: string;
  argument_set: string[];
  is_defended: boolean;
  attackers_of_argument: string[];
  attacker_defenders_in_set: Record<string, string[]>;
}

export interface AcceptanceResponse {
  argument: string;
  semantics: string;
  status: 'skeptically_accepted' | 'credulously_accepted' | 'rejected' | 'not_in_framework';
  in_all: boolean;
  in_any: boolean;
  in_count: number;
  extension_count: number;
  extensions: string[][];
  explanation: string;
}

export interface PresetFramework {
  id: string;
  name: string;
  description: string;
  arguments: string[];
  attacks: [string, string][];
  agents: Record<string, string[]>;
  misprint_notes?: string;
}

export interface StrategicMechanismResponse {
  revealed_reports: Record<string, string[]>;
  revealed_union: string[];
  grounded_extension: string[];
  grounded_iteration_log: GroundedIterationStep[];
  utilities: Record<string, number>;
  accepted_per_agent: Record<string, string[]>;
}

export interface BestReportOption {
  report: string[];
  hidden: string[];
  grounded_extension: string[];
  utility: number;
  is_truthful: boolean;
  is_best_report: boolean;
}

export interface BestReportsResponse {
  agent_id: string;
  owned_arguments: string[];
  fixed_opponent_reports: Record<string, string[]>;
  all_reports: BestReportOption[];
  best_reports: string[][];
  max_utility: number;
  truthful_utility: number;
  truthful_is_best: boolean;
  truthful_is_strictly_best: boolean;
  can_strictly_gain_by_hiding: boolean;
}

export interface Counterexample {
  agent_id: string;
  opponent_reports: Record<string, string[]>;
  truthful_report: string[];
  truthful_grounded: string[];
  truthful_utility: number;
  hiding_report: string[];
  hidden_arguments: string[];
  hiding_grounded: string[];
  hiding_utility: number;
  utility_gain: number;
  gained_arguments: string[];
}

export interface Theorem53Response {
  is_strategyproof: boolean;
  total_combinations_checked: number;
  counterexample_count: number;
  counterexamples: Counterexample[];
  per_agent_status: Record<string, {
    is_strategyproof: boolean;
    counterexamples_count: number;
    sample_counterexample: Counterexample | null;
  }>;
}

export interface ViolatingPath {
  agent_id: string;
  source: string;
  target: string;
  path_length: number;
  path: string[];
  is_self_loop_or_cycle: boolean;
}

export interface Theorem54Response {
  satisfies_condition: boolean;
  violations_count: number;
  violating_pairs: ViolatingPath[];
  explanation: string;
}

export interface CompareTheoremsResponse {
  theorem_5_3: Theorem53Response;
  theorem_5_4: Theorem54Response;
  is_strategyproof: boolean;
  satisfies_theorem_5_4: boolean;
  category: string;
  notes: string;
}

export interface PSummary {
  p: number;
  total_instances: number;
  strategyproof_count: number;
  strategyproof_fraction: number;
  strategyproof_percentage: number;
  t5_4_satisfied_count: number;
  t5_4_satisfied_fraction: number;
  t5_4_satisfied_percentage: number;
  categories: Record<string, number>;
  sample_t5_4_fail_but_sp?: any;
  sample_t5_4_fail_and_not_sp?: any;
}

export interface ExperimentsResult {
  metadata: {
    total_instances: number;
    probabilities: number[];
    instances_per_p: number;
    seed: number;
    allow_self_attacks: boolean;
    elapsed_seconds: number;
  };
  p_summaries: Record<string, PSummary>;
  sample_records: any[];
}
