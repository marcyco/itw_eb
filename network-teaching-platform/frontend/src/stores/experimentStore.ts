/**
 * 实验状态管理
 */
import { create } from 'zustand'
import { ExperimentData, TCPPacket, UDPPacket } from '../services/api'

interface Packet {
  id: string
  protocol: string
  data: any
  source: string
  destination: string
  timestamp: number
}

interface ExperimentState {
  currentExperiment: ExperimentData | null
  packets: Packet[]
  isRunning: boolean
  config: any

  // Actions
  setCurrentExperiment: (experiment: ExperimentData | null) => void
  addPacket: (packet: Packet) => void
  clearPackets: () => void
  setRunning: (running: boolean) => void
  updateConfig: (config: any) => void
}

export const useExperimentStore = create<ExperimentState>((set) => ({
  currentExperiment: null,
  packets: [],
  isRunning: false,
  config: {},

  setCurrentExperiment: (experiment) => set({ currentExperiment: experiment }),
  addPacket: (packet) =>
    set((state) => ({ packets: [...state.packets, packet] })),
  clearPackets: () => set({ packets: [] }),
  setRunning: (running) => set({ isRunning: running }),
  updateConfig: (config) => set((state) => ({ config: { ...state.config, ...config } })),
}))
