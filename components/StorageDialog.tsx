import { Settings } from "@/components/icons/Settings";
import { useStorageStore } from "@/features/storage/storage.store";
import * as FileSystem from "expo-file-system";
import React, { useState } from "react";
import { useShallow } from "zustand/shallow";
import { Button } from "./ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/Dialog";
import { Input } from "./ui/Input";
import { Text } from "./ui/Text";

export const StorageDialog = (props: { isOpen?: boolean }) => {
  const { directoryName, setDirectoryName, setDirectoryUri } = useStorageStore(
    useShallow((state) => ({
      directoryName: state.directoryName,
      setDirectoryName: state.setDirectoryName,
      setDirectoryUri: state.setDirectoryUri,
    }))
  );
  const [isOpen, setIsOpen] = useState(props.isOpen ?? false);

  const [input, setInput] = useState<string>(directoryName ?? "");

  const saveDirectory = async () => {
    try {
      if (input === null) {
        return;
      }
      setDirectoryName(input);

      //check if directory exists
      const directoryExists = await FileSystem.getInfoAsync(
        FileSystem.documentDirectory + input
      );
      if (
        directoryExists === null ||
        !directoryExists.exists ||
        !directoryExists.isDirectory
      ) {
        // create directory
        await FileSystem.makeDirectoryAsync(
          FileSystem.documentDirectory + input + "/"
        );
      }

      setDirectoryUri(FileSystem.documentDirectory + input + "/");

      setIsOpen(false);
    } catch (e) {
      // error reading value
      console.log(e);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {typeof props.isOpen !== "boolean" && (
        <DialogTrigger asChild>
          <Button variant={"ghost"}>
            <Settings className="light:text-primary-foreground dark:text-secondary-foreground" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Directory of recordings</DialogTitle>
          <DialogDescription>
            <Text>Select the directory where your recordings are stored.</Text>
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Directory"
          value={input}
          onChangeText={setInput}
        ></Input>
        <DialogFooter>
          <Button onPress={saveDirectory} disabled={input === null}>
            <Text>Save</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
