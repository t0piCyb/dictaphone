import { useState } from "react";
import { View } from "react-native";
import { Audio } from "expo-av";
import { Recording, RecordingStatus } from "expo-av/build/Audio";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { Mic } from "@/components/icons/Mic";
import { StopCircle } from "@/components/icons/StopCircle";
import { FileExplorator } from "@/components/FileExplorator";
import * as FileSystem from "expo-file-system";
import { StorageDialog } from "@/components/StorageDialog";
import { useStorageStore } from "@/features/storage/storage.store";
import { useShallow } from "zustand/shallow";
import { getDurationFormatted } from "@/features/utils";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const [recording, setRecording] = useState<Recording | undefined>(undefined);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>();
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  const { directoryUri, reloadListFiles } = useStorageStore(
    useShallow((state) => ({
      directoryUri: state.directoryUri,
      directoryName: state.directoryName,
      reloadListFiles: state.reloadListFiles,
    }))
  );

  async function startRecording() {
    try {
      if (permissionResponse && permissionResponse.status !== "granted") {
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          setRecordingStatus(status);
        }
      );
      setRecording(recording);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    setRecording(undefined);
    recording && (await recording.stopAndUnloadAsync());
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
    });
    const uri = recording && recording.getURI();
    if (uri !== null && directoryUri !== null && uri !== undefined) {
      // check how many files are in the directory and between those who are named "new_recording (number).m4a" what is the highest number

      const files = await FileSystem.readDirectoryAsync(directoryUri);
      const filesWithNewRecording = files.filter((file) =>
        file.includes("new_recording")
      );
      const numbers = filesWithNewRecording.map(
        (file) => Number(file.match(/\d+/g)?.[0]) || 0
      );
      const highestNumber = Math.max(...numbers, 0);

      await FileSystem.moveAsync({
        from: uri,
        to: directoryUri + "new_recording " + (highestNumber + 1) + ".m4a",
      });
      reloadListFiles();
      // reload the list of recordings
    } else {
      console.log("File not moved");
    }
  }

  return (
    <SafeAreaView className="flex justify-between flex-1">
      <Text className="text-2xl text-center">Dictaphone</Text>
      <View className="flex flex-1 w-full">
        <View className="flex flex-row justify-between w-full ">
          <Text className="mx-2 text-xl text-left text-muted-foreground">
            Your recordings
          </Text>
          <StorageDialog />
        </View>
        <FileExplorator />
      </View>
      <View className="flex items-center justify-center w-full my-2 border-t border-muted-foreground">
        <Text className="text-xl text-center text-muted-foreground">
          {recordingStatus?.isRecording
            ? getDurationFormatted(recordingStatus?.durationMillis)
            : ""}
        </Text>
        <Button
          onPress={recording ? stopRecording : startRecording}
          className="bg-red-500 rounded-full"
          variant={"default"}
          size={"lg"}
        >
          <Text>
            {recordingStatus?.isRecording ? (
              <StopCircle color={"white"} />
            ) : (
              <Mic color={"white"} />
            )}
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
