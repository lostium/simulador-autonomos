export interface TaxBracket {
  limit: number; // For RETA: limit. For IRPF: l (limit)
  base?: number; // For RETA default base
  rate?: number; // For IRPF: r (rate)
  l?: number; // IRPF alias
  r?: number; // IRPF alias
}

export interface IRPFBracket {
  l: number; // Limit (max euro in this bracket)
  r: number; // Rate (0.19, etc.)
}

export interface DetailedExpense {
  id: string;
  concept: string;
  amount: number;
  frequency: 1 | 12; // 1 = annual, 12 = monthly
  annualAmount: number;
}

export interface SimulationParams {
  grossIncome: number;
  expenses: number; // General annual expenses
  autonomousQuota: number | null; // null = auto calculate
  detailedExpenses: DetailedExpense[];

  // Profile
  region: string;
  age: 'under65' | 'over65' | 'over75';
  children: number;
  disability: boolean; // Not in original JS but good to have? Original had diffJust logic.
  isDiffJustification: boolean; // 5% rule (or 7% / 3%)
  isSocietario: boolean; // Enforces minimum contribution base of 1000€ if true

  // Deductions
  healthInsurance: number;
  healthPeople: number;
  personalPension: number;
  autonomousPension: number;
  ngoDonations: number;

  // Withholdings
  withholdingRate: number;
  customWithholdingAmount: number | null;
}

export interface TaxBreakdownRow {
  range: string;
  base: number;
  rate: number;
  quota: number;
  acc: number;
  rS?: number; // state rate
  rR?: number; // regional rate
}

export interface RetaBreakdownRow {
  range: string;           // Income bracket range (e.g., "0 - 670 €")
  contributionBase: number; // Base de cotización
  monthlyQuota: number;     // Cuota mensual
  isActive: boolean;        // Whether this is the user's current bracket
}

export interface SimulationResults {
  netRevenue: number;
  deductibleExpenses: number;
  autonomousQuota: number;
  deductibleHealth: number;
  diffJustification: number;
  netReducedReturn: number;

  totalPensionReduction: number;
  lowIncomeReduction: number;
  taxableBase: number; // Base Liquidable

  familyMinimum: number;

  taxBase: number;   // Cuota Integra Base
  taxMin: number;    // Cuota Integra Minimos
  liquidQuota: number; // Cuota Liquida

  ngoDeduction: number;
  finalTax: number;  // Cuota Resultante
  withholdings: number;

  balance: number; // + = pay, - = return
  effectiveRate: number;

  globalBreakdown: TaxBreakdownRow[];
  stateBreakdown: TaxBreakdownRow[];
  peopleBreakdown: TaxBreakdownRow[]; // Regional

  marginalRate: number;

  // RETA Breakdown
  retaBreakdown: RetaBreakdownRow[];
  retaRate: number;

  // Verification
  theoreticalAutonomousQuota: number;
  autonomousQuotaDiff: number; // quota - theoreticalQuota
}
