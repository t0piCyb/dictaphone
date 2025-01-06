import React, { useEffect, useState } from "react";
import { Text } from "./ui/Text";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as FileSystem from "expo-file-system";
import { FlatList, View } from "react-native";
import { StorageDialog } from "./StorageDialog";
import { useStorageStore } from "@/features/storage/storage.store";

import { useShallow } from "zustand/shallow";
import { FileComponent } from "./FileComponent";

export const FileExplorator = () => {
  const [files, setFiles] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const { directoryUri, directoryName, listFiles, reloadListFiles } =
    useStorageStore(
      useShallow((state) => ({
        directoryUri: state.directoryUri,
        directoryName: state.directoryName,
        listFiles: state.listFiles,
        reloadListFiles: state.reloadListFiles,
      }))
    );

  useEffect(() => {
    (async () => await reloadListFiles())();
  }, [directoryUri, directoryName]);

  if (directoryUri === null && !isOpen) {
    setIsOpen(true);
  }

  return (
    <View className="items-start flex-1 ">
      <StorageDialog isOpen={isOpen} />
      <FlatList
        className="flex-1 w-full"
        data={listFiles}
        renderItem={({ item }) => <FileComponent name={item}></FileComponent>}
        ListEmptyComponent={<Text>No files</Text>}
      />
    </View>
  );
};
