export type BeconItemKey =
  | "HAIR_FOLLICLE_DENSITY"
  | "HAIR_PER_HAIR_FOLLICLE"
  | "HAIR_THICKNESS"
  | "HAIR_QUANTITY"
  | "SENSITIVITY"
  | "WATER"
  | "OIL"
  | "DEAD_SKIN"
  | "TEMPERATURE"
  | "GAS"
  | string;

export interface BeconDetailItem {
  item: BeconItemKey;
  my_average_score: number;
  my_average_value: number | null;
  unit?: string;
}

export interface BeconCustomer {
  first_name?: string;
  phone_number?: string;
  gender?: string;
  birth?: string;
  email?: string;
  reg_date?: string;
}

export interface BeconPayload {
  traya_customer_id: string;
  traya_clinic_id: string;
  composite_scalp_result: {
    id: number;
    reg_date: string;
    analysis_date: string;
    result: {
      id: number;
      overview: {
        composite_scalp_score: number;
      };
      detail_items: BeconDetailItem[];
      customer?: BeconCustomer;
    };
    status: string;
    firmware_version?: string;
  };
}
