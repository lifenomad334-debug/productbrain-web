export type Platform = "coupang" | "naver" | "shopify";

export type SellerInput = {
  product_title: string;
  platform: Platform;
  additional_info?: string;
};

export type EdgeResponse = {
  status: "complete" | "failed";
  json?: any;
  validation?: { valid: boolean; errors: string[]; warnings: string[] };
  llm_time_ms?: number;
  error?: string;
};

export type RenderResponse = {
  slides: Array<{
    slide_id: string;
    base64: string;
    width: number;
    height: number;
    file_size_kb?: number;
  }>;
  render_time_ms: number;
};

export type GenerationRecord = {
  id: string;
  product_title: string;
  platform: Platform;
  seller_input: any;
  generated_json: any;
  status: string;
  llm_time_ms: number | null;
  render_time_ms: number | null;
  zip_url: string | null;
  created_at: string;
};

export type AssetRecord = {
  id: string;
  generation_id: string;
  slide_id: string;
  image_url: string;
  width: number | null;
  height: number | null;
  file_size_kb: number | null;
  created_at: string;
};
