export interface CalculationResults {
  turnover: number;
  brokerage: number;
  stt: number;
  exchange_txn_charges: number;
  sebi_charges: number;
  gst: number;
  stamp_duty: number;
  total_charges: number;
  gross_profit: number;
  net_profit: number;
  points_to_breakeven: number;
}

export interface Trade {
  id: number;
  segment: string;
  exchange: string;
  buy_price: number;
  sell_price: number;
  quantity: number;
  multiplier: number;
  results: CalculationResults;
  created_at: string;
}

export type SegmentType = 
  | 'equity_intraday' 
  | 'equity_delivery' 
  | 'equity_futures' 
  | 'equity_options' 
  | 'currency_futures' 
  | 'currency_options' 
  | 'commodity_futures' 
  | 'commodity_options';

export interface CalculationRequest {
  segment: SegmentType;
  exchange: string;
  buy_price: number;
  sell_price: number;
  quantity: number;
  multiplier?: number;
}
