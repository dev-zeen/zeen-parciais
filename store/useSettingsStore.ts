import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SettingsState = {
  /** true depois de ler o AsyncStorage; antes disso as preferências são o padrão. */
  hydrated: boolean;
  /**
   * Lembretes de fechamento do mercado.
   * null = ainda não perguntamos (pede a permissão do sistema na primeira vez).
   */
  marketReminders: boolean | null;
  setMarketReminders: (enabled: boolean) => void;
  /** Rodada em que o usuário escolheu "Não receber ainda" a doação de cartoletas. */
  donationDismissedRound: number | null;
  setDonationDismissedRound: (round: number) => void;
};

const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      hydrated: false,
      marketReminders: null,
      setMarketReminders: (enabled) => set({ marketReminders: enabled }),
      donationDismissedRound: null,
      setDonationDismissedRound: (round) => set({ donationDismissedRound: round }),
    }),
    {
      name: '@settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ marketReminders, donationDismissedRound }) => ({
        marketReminders,
        donationDismissedRound,
      }),
      onRehydrateStorage: () => () => useSettingsStore.setState({ hydrated: true }),
    }
  )
);

export default useSettingsStore;
