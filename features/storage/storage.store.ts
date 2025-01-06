import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import * as FileSystem from "expo-file-system";

type StorageStoreType = {
  directoryUri: string | null;
  directoryName: string | null;
  setDirectoryUri: (directoryUri: string | null) => void;
  setDirectoryName: (directoryName: string | null) => void;
  listFiles: string[];
  reloadListFiles: () => void;
};

export const useStorageStore = create<StorageStoreType>()(
  persist(
    (set, get) => ({
      directoryUri: null,
      directoryName: null,
      listFiles: [],
      setDirectoryUri: (directoryUri) => set({ directoryUri }),
      setDirectoryName: (directoryName) => set({ directoryName }),
      reloadListFiles: async () => {
        const filesRead = await FileSystem.readDirectoryAsync(
          get().directoryUri || ""
        );

        set({ listFiles: filesRead });
      },
    }),
    {
      name: "storageStore",
      partialize: (state) => ({
        directoryUri: state.directoryUri,
        directoryName: state.directoryName,
      }),
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () =>
        console.log("État restauré depuis le stockage !"),
    }
  )
);
