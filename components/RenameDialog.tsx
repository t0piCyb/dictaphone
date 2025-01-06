import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/Dialog";
import { Button } from "./ui/Button";
import { Edit2 } from "lucide-react-native";
import { Input } from "./ui/Input";

import { useState } from "react";
import { useStorageStore } from "@/features/storage/storage.store";
import { useShallow } from "zustand/shallow";
import * as FileSystem from "expo-file-system";
import { Text } from "./ui/Text";
import { reload } from "expo-router/build/global-state/routing";

export const RenameDialog = (props: { name: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState<string>(props.name.split(".m4a")[0]);

  const { directoryUri, reloadListFiles } = useStorageStore(
    useShallow((state) => ({
      directoryUri: state.directoryUri,
      reloadListFiles: state.reloadListFiles,
    }))
  );

  const renameFile = async () => {
    await FileSystem.moveAsync({
      from: directoryUri + props.name,
      to: directoryUri + input + ".m4a",
    });
    reloadListFiles();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"ghost"}>
          <Text>
            <Edit2 />
          </Text>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <Text>Rename</Text>
          </DialogTitle>
          <DialogDescription>
            <Text>Change the name of the audio then save</Text>
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="New name"
          value={input}
          onChangeText={setInput}
        ></Input>
        <DialogFooter>
          <DialogClose asChild>
            <Button onPress={renameFile}>
              <Text>Save</Text>
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
