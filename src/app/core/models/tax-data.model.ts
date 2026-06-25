export interface TaxData {
  reta: {
    rate: number;
    minQuota: number;
    table: {
      limit: number | null;
      base: number;
    }[];
  };
  deductions: {
    healthInsuranceLimitPerPerson: number;
    diffJustification: {
      rate: number;
      societarioRate?: number;
      max: number;
      societarioMax?: number;
    };
    pension: {
      individualMax: number;
      autonomousMax: number;
      totalRateLimit: number;
    };
    lowIncome: {
      limit1: number;
      limit2: number;
      maxReduction: number;
      factor: number;
    };
    ngo: {
      limit1: number;
      rate1: number;
      rate2: number;
      baseLimitRate: number;
    };
  };
  minPersonal: {
    base: number;
    over65: number;
    over75: number;
    children: number[];
  };
  irpf: {
    withholdingRate: number;
    stateScale: {
      l: number | null;
      r: number;
    }[];
    regionalScales: Record<string, {
      l: number | null;
      r: number;
    }[]>;
  };
}
