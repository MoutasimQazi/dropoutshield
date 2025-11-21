import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useAuthStore = create(persist((set, get) => ({
  user: null, // { name, role: 'teacher'|'principal', email }
  login: ({ name, email, role }) => set({ user: { name, email, role } }),
  logout: () => set({ user: null }),
}), {
  name: 'dropoutshield-auth',
  storage: createJSONStorage(() => localStorage),
}))

export default useAuthStore
