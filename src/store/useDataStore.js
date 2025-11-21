import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useDataStore = create(persist((set, get) => ({
  role: 'teacher',
  setRole: (role) => set({ role }),

  students: [], // raw rows from CSV
  predictions: [], // [{ id, probability, riskLevel, suggestions }]

  setDataset: (students) => set({ students }),
  setPredictions: (predictions) => set({ predictions }),

  clearAll: () => set({ students: [], predictions: [] }),
}), {
  name: 'dropoutshield-store',
  storage: createJSONStorage(() => localStorage),
  partialize: (s) => ({ role: s.role, students: s.students, predictions: s.predictions })
}))

export default useDataStore
