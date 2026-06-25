import { computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { SimulationParams, SimulationResults, DetailedExpense } from '@app/core/models/simulation.model';
import { TaxCalculatorService } from '@app/core/services/tax-calculator.service';

export interface SavedSimulation {
    id: string; // uuid
    name: string;
    date: string;
    params: SimulationParams;
}

type SimulatorState = {
    params: SimulationParams;
    savedSimulations: SavedSimulation[];
    activeTab: 'global' | 'split';
    currentStep: number;
    lastSavedParams: SimulationParams | null;
    currentId: string | null;
};

const defaultParams: SimulationParams = {
    grossIncome: 0,
    expenses: 0,
    autonomousQuota: null,
    detailedExpenses: [],
    region: 'common',
    age: 'under65',
    children: 0,
    disability: false,
    isDiffJustification: true,
    healthInsurance: 0,
    healthPeople: 1,
    personalPension: 0,
    autonomousPension: 0,
    ngoDonations: 0,
    withholdingRate: 0.15,
    customWithholdingAmount: null,
    isSocietario: false
};

const initialState: SimulatorState = {
    params: defaultParams,
    savedSimulations: [],
    activeTab: 'global',
    currentStep: 0,
    lastSavedParams: null,
    currentId: null
};

export const SimulatorStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withComputed((store, taxService = inject(TaxCalculatorService)) => ({
        results: computed<SimulationResults>(() => {
            return taxService.calculate(store.params());
        }),
        hasValidData: computed<boolean>(() => {
            return store.params().grossIncome > 0;
        }),
        hasUnsavedChanges: computed<boolean>(() => {
            const current = store.params();
            const saved = store.lastSavedParams();
            if (!saved) return current.grossIncome > 0;
            return JSON.stringify(current) !== JSON.stringify(saved);
        })
    })),
    withMethods((store, platformId = inject(PLATFORM_ID)) => ({
        updateGrossIncome(amount: number) {
            patchState(store, (state) => ({ params: { ...state.params, grossIncome: amount } }));
        },
        updateExpenses(amount: number) {
            patchState(store, (state) => ({ params: { ...state.params, expenses: amount } }));
        },
        updateDetailedExpenses(expenses: DetailedExpense[]) {
            patchState(store, (state) => ({ params: { ...state.params, detailedExpenses: expenses } }));
        },
        updateQuota(quota: number | null) {
            patchState(store, (state) => ({ params: { ...state.params, autonomousQuota: quota } }));
        },
        updateProfile(updates: Partial<Pick<SimulationParams, 'region' | 'age' | 'children' | 'disability' | 'isDiffJustification' | 'isSocietario'>>) {
            patchState(store, (state) => ({ params: { ...state.params, ...updates } }));
        },
        updateDeductions(updates: Partial<Pick<SimulationParams, 'healthInsurance' | 'healthPeople' | 'personalPension' | 'autonomousPension' | 'ngoDonations'>>) {
            patchState(store, (state) => ({ params: { ...state.params, ...updates } }));
        },
        updateWithholdings(updates: { withholdingRate: number, customWithholdingAmount: number | null }) {
            patchState(store, (state) => ({ params: { ...state.params, ...updates } }));
        },
        setTab(tab: 'global' | 'split') {
            patchState(store, { activeTab: tab });
        },
        setStep(step: number) {
            patchState(store, { currentStep: step });
        },
        setCurrentId(id: string | null) {
            patchState(store, { currentId: id });
        },

        loadFromStorage() {
            if (isPlatformBrowser(platformId) && typeof localStorage !== 'undefined') {
                const saved = localStorage.getItem('simulaciones');
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        const mapped = parsed.map((s: any) => ({
                            id: s.id || crypto.randomUUID(),
                            name: s.name,
                            date: s.date,
                            params: s.inputs ? { ...defaultParams, ...s.inputs } : s.params
                        }));
                        patchState(store, { savedSimulations: mapped });
                    } catch (e) {
                        console.error('Error loading simulations', e);
                    }
                }
            }
        },

        saveSimulation(name: string) {
            const newId = crypto.randomUUID();
            const newSim: SavedSimulation = {
                id: newId,
                name: name || `Simulación ${new Date().toLocaleDateString()}`,
                date: new Date().toISOString(),
                params: { ...store.params() }
            };
            const updated = [...store.savedSimulations(), newSim];
            patchState(store, { savedSimulations: updated, lastSavedParams: { ...store.params() }, currentId: newId });

            if (isPlatformBrowser(platformId) && typeof localStorage !== 'undefined') {
                localStorage.setItem('simulaciones', JSON.stringify(updated));
            }
        },

        updateSimulation(id: string) {
            const currentParams = { ...store.params() };
            const updated = store.savedSimulations().map(sim =>
                sim.id === id ? { ...sim, params: currentParams, date: new Date().toISOString() } : sim
            );
            patchState(store, { savedSimulations: updated, lastSavedParams: currentParams, currentId: id });

            if (isPlatformBrowser(platformId) && typeof localStorage !== 'undefined') {
                localStorage.setItem('simulaciones', JSON.stringify(updated));
            }
        },

        deleteSimulation(id: string) {
            const filtered = store.savedSimulations().filter(s => s.id !== id);
            const updates: any = { savedSimulations: filtered };
            if (store.currentId() === id) {
                updates.currentId = null;
            }
            patchState(store, updates);
            if (isPlatformBrowser(platformId) && typeof localStorage !== 'undefined') {
                localStorage.setItem('simulaciones', JSON.stringify(filtered));
            }
        },

        clearHistory() {
            patchState(store, { savedSimulations: [], currentId: null });
            if (isPlatformBrowser(platformId) && typeof localStorage !== 'undefined') {
                localStorage.removeItem('simulaciones');
            }
        },

        loadSimulation(id: string) {
            const sim = store.savedSimulations().find(s => s.id === id);
            if (sim) {
                patchState(store, {
                    params: { ...sim.params },
                    lastSavedParams: { ...sim.params },
                    currentId: id
                });
            }
        },

        importSimulations(sims: SavedSimulation[]) {
            const current = store.savedSimulations();
            const existingIds = new Set(current.map(s => s.id));
            const newSims = sims.filter(s => !existingIds.has(s.id));
            const updated = [...current, ...newSims];

            patchState(store, { savedSimulations: updated });
            if (isPlatformBrowser(platformId) && typeof localStorage !== 'undefined') {
                localStorage.setItem('simulaciones', JSON.stringify(updated));
            }
        },

        addImportedSimulation(sim: SavedSimulation) {
            const updated = [...store.savedSimulations(), { ...sim, id: crypto.randomUUID() }];
            patchState(store, { savedSimulations: updated });
            if (isPlatformBrowser(platformId) && typeof localStorage !== 'undefined') {
                localStorage.setItem('simulaciones', JSON.stringify(updated));
            }
        },

        updateImportedSimulation(id: string, sim: SavedSimulation) {
            const updated = store.savedSimulations().map(s =>
                s.id === id ? { ...sim, id, date: new Date().toISOString() } : s
            );
            patchState(store, { savedSimulations: updated });
            if (isPlatformBrowser(platformId) && typeof localStorage !== 'undefined') {
                localStorage.setItem('simulaciones', JSON.stringify(updated));
            }
        },

        exportSimulations() {
            if (isPlatformBrowser(platformId)) {
                const data = JSON.stringify(store.savedSimulations());
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `simulaciones_renta_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        },

        exportSingleSimulation(id: string) {
            if (isPlatformBrowser(platformId)) {
                const sim = store.savedSimulations().find(s => s.id === id);
                if (sim) {
                    const data = JSON.stringify([sim]);
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    const safeName = sim.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    a.download = `simulacion_${safeName}_${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }
            }
        }

    }))
);