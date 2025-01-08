import React, { useEffect, useState } from "react";
import { Text } from "./ui/Text";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/Collapsible";
import { Button } from "./ui/Button";
import { Play } from "@/components/icons/Play";
import { Trash } from "@/components/icons/Trash";

import * as FileSystem from "expo-file-system";
import { useStorageStore } from "@/features/storage/storage.store";
import { useShallow } from "zustand/shallow";
import { RenameDialog } from "./RenameDialog";
import { View } from "react-native";
import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from "expo-av";
import { Pause } from "./icons/Pause";
import { Progress } from "./ui/Progress";
import { getDurationFormatted } from "@/features/utils";

export const FileComponent = (props: { name: string }) => {
  const { directoryUri, reloadListFiles } = useStorageStore(
    useShallow((state) => ({
      directoryUri: state.directoryUri,
      reloadListFiles: state.reloadListFiles,
    }))
  );

  const [sound, setSound] = useState<Audio.Sound | undefined>(undefined);
  const [soundStatus, setSoundStatus] = useState<AVPlaybackStatusSuccess>();

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(
      {
        uri: directoryUri + props.name,
      },
      {
        shouldPlay: true,
      },
      (status) => {
        setSoundStatus(status as AVPlaybackStatusSuccess);
      }
    );
    setSound(sound);
    await sound.playAsync();
  }

  async function pauseSound() {
    if (!sound) return;
    await sound.pauseAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const deleteFile = async () => {
    await FileSystem.deleteAsync(directoryUri + props.name);
    reloadListFiles();
  };

  const getDurationPercentage = (milliseconds: number) => {
    const percentage =
      (milliseconds / (soundStatus?.durationMillis ?? 1)) * 100;
    return percentage;
  };

  return (
    <Collapsible className="border-b border-border">
      <CollapsibleTrigger asChild>
        <Button variant={"ghost"} className="text-left ">
          <Text className="w-full">{props.name}</Text>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="">
        {soundStatus?.isPlaying && (
          <View className="flex flex-col justify-around gap-1 m-2">
            <Progress
              value={getDurationPercentage(soundStatus.positionMillis)}
            ></Progress>
            <View className="flex flex-row justify-between gap-1">
              <Text className="text-sm text-muted-foreground">
                {getDurationFormatted(soundStatus.positionMillis)}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {getDurationFormatted(soundStatus.durationMillis ?? 0)}
              </Text>
            </View>
          </View>
        )}

        <View className="flex flex-row justify-around gap-1">
          <Button variant={"ghost"} onPress={deleteFile}>
            <Text>
              <Trash className="light:text-primary-foreground dark:text-secondary-foreground" />
            </Text>
          </Button>
          {sound && soundStatus?.isPlaying ? (
            <Button variant={"ghost"} onPress={pauseSound}>
              <Text>
                <Pause className="light:text-primary-foreground dark:text-secondary-foreground" />
              </Text>
            </Button>
          ) : (
            <Button variant={"ghost"} onPress={playSound}>
              <Text>
                <Play className="light:text-primary-foreground dark:text-secondary-foreground" />
              </Text>
            </Button>
          )}
          <RenameDialog name={props.name}></RenameDialog>
        </View>
      </CollapsibleContent>
    </Collapsible>
  );
};
