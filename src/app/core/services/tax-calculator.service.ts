import { Injectable, inject } from '@angular/core';
import { SimulationParams, SimulationResults, TaxBreakdownRow, IRPFBracket, RetaBreakdownRow } from '@app/core/models/simulation.model';
import { TaxConfigService } from './tax-config.service';

@Injectable({
  providedIn: 'root'
})
export class TaxCalculatorService {
  private configService = inject(TaxConfigService);

  constructor() { }

  calculate(params: SimulationParams): SimulationResults {
    const data = this.configService.config();

    // Default zeroed result if config not loaded
    if (!data) {
      return {
        netRevenue: 0,
        deductibleExpenses: 0,
        autonomousQuota: 0,
        deductibleHealth: 0,
        diffJustification: 0,
        netReducedReturn: 0,
        totalPensionReduction: 0,
        lowIncomeReduction: 0,
        taxableBase: 0,
        familyMinimum: 0,
        taxBase: 0,
        taxMin: 0,
        liquidQuota: 0,
        ngoDeduction: 0,
        finalTax: 0,
        withholdings: 0,
        balance: 0,
        effectiveRate: 0,
        marginalRate: 0,
        globalBreakdown: [],
        stateBreakdown: [],
        peopleBreakdown: [],
        retaBreakdown: [],
        retaRate: 0,
        theoreticalAutonomousQuota: 0,
        autonomousQuotaDiff: 0
      };
    }

    const inc = params.grossIncome;
    let exp = params.expenses;

    // Add detailed expenses
    const totalDetailed = params.detailedExpenses.reduce((acc, curr) => acc + curr.annualAmount, 0);
    exp += totalDetailed;

    // Quota
    const theoreticalQuota = this.calculateTheoreticalReta(inc, exp, data, params.isSocietario || false);
    let quota = 0;

    if (params.autonomousQuota === null || params.autonomousQuota === undefined) {
      quota = theoreticalQuota;
    } else {
      quota = params.autonomousQuota;
    }

    const quotaDiff = quota - theoreticalQuota;

    // 1. Health Insurance
    const deductibleHealth = Math.min(params.healthInsurance, params.healthPeople * data.deductions.healthInsuranceLimitPerPerson);

    let net = inc - exp - quota - deductibleHealth;

    // Gastos Difícil Justificación (isSocietario solo afecta a la cuota RETA)
    const diffRate = data.deductions.diffJustification.rate;
    const diffMax = data.deductions.diffJustification.max;

    const diff = params.isDiffJustification && net > 0
      ? Math.min(net * diffRate, diffMax)
      : 0;
    let netRed = net - diff;

    // 2. Pension Plan
    let totalPension = Math.min(params.personalPension, data.deductions.pension.individualMax) + Math.min(params.autonomousPension, data.deductions.pension.autonomousMax);
    totalPension = Math.min(totalPension, Math.max(0, netRed * data.deductions.pension.totalRateLimit));
    netRed = Math.max(0, netRed - totalPension);

    // Reduction for Low Income
    let redLow = 0;
    if (netRed <= data.deductions.lowIncome.limit1) redLow = data.deductions.lowIncome.maxReduction;
    else if (netRed <= data.deductions.lowIncome.limit2) redLow = data.deductions.lowIncome.maxReduction - data.deductions.lowIncome.factor * (netRed - data.deductions.lowIncome.limit1);

    const base = Math.max(0, netRed - redLow);

    // Min Personal
    let minP = data.minPersonal.base;
    if (params.age === 'over65') minP += data.minPersonal.over65;
    if (params.age === 'over75') minP += data.minPersonal.over75;

    let minF = 0;
    const child = params.children;
    const childDed = data.minPersonal.children;
    if (child >= 1) minF += childDed[0];
    if (child >= 2) minF += childDed[1];
    if (child >= 3) minF += childDed[2];
    if (child >= 4) minF += childDed[3] * (child - 3);

    const totalMin = minP + minF;

    // Global Scale
    const regionKey = params.region as keyof typeof data.irpf.regionalScales;
    const rawRegScale = data.irpf.regionalScales[regionKey] || data.irpf.regionalScales['common'];
    const regScale: IRPFBracket[] = rawRegScale.map((b: any) => ({ l: b.l === null ? Infinity : b.l, r: b.r }));

    const rawStateScale = data.irpf.stateScale;
    const stateScale: IRPFBracket[] = rawStateScale.map((b: any) => ({ l: b.l === null ? Infinity : b.l, r: b.r }));

    const globalScale = this.generateGlobalScale(stateScale, regScale);

    // Calc Tax
    const calcBase = this.calculateTaxOnScale(base, globalScale);
    const taxBase = calcBase.total;

    const calcMin = this.calculateTaxOnScale(totalMin, globalScale);
    const taxMin = calcMin.total;

    const liquidQuota = Math.max(0, taxBase - taxMin);

    // NGO Deduction
    let ngoDeduction = Math.min(params.ngoDonations, data.deductions.ngo.limit1) * data.deductions.ngo.rate1 + Math.max(0, params.ngoDonations - data.deductions.ngo.limit1) * data.deductions.ngo.rate2;
    ngoDeduction = Math.min(ngoDeduction, base * data.deductions.ngo.baseLimitRate);

    const finalTax = Math.max(0, liquidQuota - ngoDeduction);

    // Withholdings calculation
    const withholdings = params.customWithholdingAmount !== null
      ? params.customWithholdingAmount
      : inc * (params.withholdingRate || (data?.irpf?.withholdingRate ?? 0.15));

    const balance = finalTax - withholdings;

    // Effective Rate
    const effectiveRate = inc > 0 ? finalTax / inc : 0;
    const activeRows = calcBase.details.filter(r => r.base > 0);
    const realMarginalRate = activeRows.length > 0 ? activeRows[activeRows.length - 1].rate : 0;

    // Breakdowns
    const stateBreakdownRows = this.calculateTaxOnScale(base, stateScale.map(s => ({ ...s, rS: s.r, rR: 0 })) as any).details;
    const regionalBreakdownRows = this.calculateTaxOnScale(base, regScale.map(s => ({ ...s, rR: s.r, rS: 0 })) as any).details;

    // RETA Breakdown
    const retaRate = data.reta.rate;
    const retaBreakdown = this.calculateRetaBreakdown(inc, exp, quota, data);

    return {
      netRevenue: params.grossIncome,
      deductibleExpenses: exp + quota,
      autonomousQuota: quota,
      deductibleHealth: deductibleHealth,
      diffJustification: diff,
      netReducedReturn: netRed,
      totalPensionReduction: totalPension,
      lowIncomeReduction: redLow,
      taxableBase: base,
      familyMinimum: totalMin,
      taxBase: taxBase,
      taxMin: taxMin,
      liquidQuota: liquidQuota,
      ngoDeduction: ngoDeduction,
      finalTax: finalTax,
      withholdings: withholdings,
      balance: balance,
      effectiveRate: effectiveRate,
      marginalRate: realMarginalRate,
      globalBreakdown: calcBase.details,
      stateBreakdown: stateBreakdownRows,
      peopleBreakdown: regionalBreakdownRows,
      retaBreakdown: retaBreakdown,
      retaRate: retaRate,
      theoreticalAutonomousQuota: theoreticalQuota,
      autonomousQuotaDiff: quotaDiff
    };
  }

  private calculateTheoreticalReta(inc: number, exp: number, data: any, isSocietario: boolean): number {
    const retaTable = data.reta.table.map((r: any) => ({ ...r, limit: r.limit === null ? Infinity : r.limit }));
    const retaRate = data.reta.rate;
    const societarioMinBase = 1000;

    // Helper to get base from net
    const getBase = (net: number) => {
      const row = retaTable.find((x: any) => net <= x.limit) || retaTable[retaTable.length - 1];
      let b = row.base || 0;
      if (isSocietario && b < societarioMinBase) {
        b = societarioMinBase;
      }
      return b;
    };

    // Estimate net for bracket
    let netEst = (inc - exp) / 12; // Simple estimation
    let qBase = getBase(netEst);
    let q = qBase * retaRate;

    // Refine
    netEst = (inc - exp - q * 12) / 12;
    qBase = getBase(netEst);
    let quota = qBase * retaRate * 12;

    if (inc > 0 && quota < data.reta.minQuota) {
      quota = data.reta.minQuota;
    }
    // Override minQuota check if societario (since 1000 base * rate * 12 will be > minQuota usually)
    if (isSocietario && inc > 0) {
      // Ensure at least the societario minimum
      const minSocietarioQuota = societarioMinBase * retaRate * 12;
      if (quota < minSocietarioQuota) {
        quota = minSocietarioQuota;
      }
    }

    return quota;
  }

  private calculateRetaBreakdown(inc: number, exp: number, actualQuota: number, data: any): RetaBreakdownRow[] {
    const retaTable = data.reta.table;
    const retaRate = data.reta.rate;
    const breakdown: RetaBreakdownRow[] = [];

    // Calculate the user's estimated monthly net income (after expenses and quota)
    const netEst = (inc - exp - actualQuota) / 12;
    let prevLimit = 0;

    for (let i = 0; i < retaTable.length; i++) {
      const row = retaTable[i];
      const limit = row.limit === null ? Infinity : row.limit;
      const monthlyQuota = row.base * retaRate;

      // Check if this is the active bracket for the user's income
      const isActive = netEst > prevLimit && netEst <= limit;

      breakdown.push({
        range: limit === Infinity
          ? `> ${this.formatC(prevLimit)} €`
          : `${this.formatC(prevLimit)} - ${this.formatC(limit)} €`,
        contributionBase: row.base,
        monthlyQuota: monthlyQuota,
        isActive: isActive
      });

      prevLimit = limit;
    }

    return breakdown;
  }

  // --- Helpers ---

  private generateGlobalScale(state: IRPFBracket[], region: IRPFBracket[]) {
    const limits = new Set<number>();
    state.forEach((b) => limits.add(b.l));
    region.forEach((b) => limits.add(b.l));
    const sortedLimits = Array.from(limits).sort((a, b) => a - b);

    const globalScale = [];
    let prevLim = 0;

    for (const lim of sortedLimits) {
      const checkPoint = lim === Infinity ? prevLim + 1 : prevLim + 0.01;

      const rS = state.find((b) => b.l >= checkPoint)?.r || state[state.length - 1].r;
      const rR = region.find((b) => b.l >= checkPoint)?.r || region[region.length - 1].r;

      globalScale.push({
        l: lim,
        r: rS + rR,
        rS: rS,
        rR: rR,
      });
      prevLim = lim;
    }
    return globalScale;
  }

  private calculateTaxOnScale(amount: number, scale: any[]): { total: number, details: TaxBreakdownRow[] } {
    let tax = 0;
    let rem = amount;
    let prev = 0;
    const breakdown: TaxBreakdownRow[] = [];

    for (const b of scale) {
      if (amount <= prev) break;
      const width = b.l === Infinity ? rem : Math.min(rem, b.l - prev);
      const t = width * b.r;
      tax += t;

      breakdown.push({
        range: b.l === Infinity ? `> ${this.formatC(prev)}` : `${this.formatC(prev)} - ${this.formatC(b.l)}`,
        base: width,
        rate: b.r,
        quota: t,
        acc: tax,
        rS: b.rS,
        rR: b.rR
      });

      rem -= width;
      prev = b.l;
    }
    return { total: tax, details: breakdown };
  }

  private formatC(n: number): string {
    return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(n);
  }
}