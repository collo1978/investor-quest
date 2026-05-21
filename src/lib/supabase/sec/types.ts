export type SecFilingRow = {
  id: string;
  ticker: string;
  cik: string;
  form_type: string;
  accession_number: string;
  filed_at: string;
  filing_url: string;
  period_of_report: string | null;
  created_at: string;
  updated_at: string;
};

export type FilingSectionRow = {
  id: string;
  filing_id: string;
  section_key: string;
  section_label: string;
  quest_category: string;
  content_text: string;
  content_hash: string;
  char_count: number;
  truncated: boolean;
  extracted_at: string;
};

export type QuestSectionMappingRow = {
  id: string;
  form_type: string;
  quest_category: string;
  section_key: string;
  section_label: string;
  extractor_item: string | null;
  pillar_hint: string | null;
  sort_order: number;
};

export type AiGenerationJobRow = {
  id: string;
  ticker: string;
  filing_id: string | null;
  job_type: string;
  status: string;
  input_section_ids: string[];
  prompt_payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type QuestAnswerRow = {
  id: string;
  user_id: string | null;
  quest_id: string;
  company_ticker: string;
  generation_job_id: string | null;
  answer_payload: Record<string, unknown>;
  is_correct: boolean | null;
  created_at: string;
};
