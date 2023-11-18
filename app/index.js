import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Audio } from "expo-av";
import { Stack } from "expo-router";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import CloudflareApi from "../helpers/Cloudflare";
import addComment from "../helpers/supabase/AddComment";
import fetchData from "../helpers/supabase/fetchData";
import renderItem from "../components/Listitem";

export default function Apps() {
  const [recording, setRecording] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState("idle");
  const [filename, setFilename] = useState("");
  const [audioUri, setAudioUri] = useState(null);
  const [supabaseList, setSupabaseList] = useState([]);
  const [audioPermission, setAudioPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    getPermission();
    fetchData(setSupabaseList);
    // return () => {
    //   if (recording) {
    //     stopRecording();
    //   }
    // };
  }, [filename]);

  async function getPermission() {
    await Audio.requestPermissionsAsync()
      .then((permission) => {
        console.log("Permission Granted: " + permission.granted);
        setAudioPermission(permission.granted);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async function startRecording() {
    try {
      if (audioPermission) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }

      const newRecording = new Audio.Recording();
      console.log("Starting Recording");
  
      const recordingOptions = {
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
          sampleRate: Audio.RECORDING_OPTION_ANDROID_SAMPLE_RATE_DEFAULT,
          numberOfChannels: 2, // Stereo recording
          bitRate: Audio.RECORDING_OPTION_ANDROID_BIT_RATE_DEFAULT,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
          sampleRate: Audio.RECORDING_OPTION_IOS_SAMPLE_RATE_MAX,
          numberOfChannels: 2, // Stereo recording
          bitRate: 128000, // Adjust as needed
          linearPCMBitDepth: Audio.RECORDING_OPTION_IOS_LINEAR_PCM_BIT_DEPTH_MEDIUM,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };
  
      await newRecording.prepareToRecordAsync(recordingOptions);
      await newRecording.startAsync();
      setRecording(newRecording);
      setRecordingStatus("recording");
    } catch (error) {
      console.error("Failed to start recording", error);
    }
  }

  async function PlayAudio(fileName) {
    console.log(filename);
    setIsLoading(true)
    const playbackObject = new Audio.Sound();
    await playbackObject.loadAsync(
      { uri: fileName },
      { shouldCorrectPitch: false }
    );
    await playbackObject.playAsync();
    setIsLoading(false)
  }

  async function stopRecording() {
    try {
      if (recordingStatus === "recording") {
        console.log("Stopping Recording");
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
      console.log(recording)

        setAudioUri(uri);
        setFilename(`audio/${Date.now()}.wav`);
        setRecording(null);
        setRecordingStatus("stopped");
      }
    } catch (error) {
      console.error("Failed to stop recording", error);
    }
  }

  async function handleRecordButtonPress() {
    if (recording) {
      await stopRecording(recording);
    } else {
      await startRecording();
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <View
        style={{
          alignItems: "center",
          paddingTop: 10,
          paddingBottom:30,
        }}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={handleRecordButtonPress}
        >
          <FontAwesome5
            name={recording ? "stop-circle" : "circle"}
            size={20}
            color="white"
          />
        </TouchableOpacity>
        <Text
          style={styles.recordingStatusText}
        >{`Recording status: ${recordingStatus}`}</Text>
        {filename !== "" && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              width: 200,
              paddingTop: 10,
            }}
          >
            <Pressable
            disabled={isLoading}
              style={{
                backgroundColor: isLoading?"#766f94":"#363062",
                padding: 6,
                paddingLeft: 10,
                paddingRight: 10,
                borderRadius: 20,
              }}
              onPress={async () => {
                console.log("Play");
                await PlayAudio(audioUri);
              }}
            >
              <Text style={{ color: "#F5E8C7", fontWeight: 500 }}>Play</Text>
            </Pressable>
            <Pressable
              style={{
                backgroundColor: "#AF2655",
                padding: 6,
                paddingLeft: 10,
                paddingRight: 10,
                borderRadius: 20,
              }}
              onPress={async () => {
                console.log("Upload");
                CloudflareApi(audioUri, filename).then((response) => {
                  addComment(response);
                  console.log(response);
                  setFilename("");
                  setRecordingStatus("idle");
                });
              }}
            >
              <Text style={{ color: "#F5E8C7", fontWeight: 500 }}>Upload</Text>
            </Pressable>
            <Pressable
              style={{
                backgroundColor: "#4444",
                borderRadius: 25,
              }}
              onPress={() => {
                console.log("cancel");
                setFilename("");
                setRecordingStatus("idle");
              }}
            >
              <MaterialCommunityIcons name={"close"} size={18} padding={6} />
            </Pressable>
          </View>
        )}
      </View>
      <FlatList
        data={supabaseList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    width: 40,
    height: 40,
    borderRadius: 64,
    backgroundColor: "red",
  },
  recordingStatusText: {
    marginTop: 16,
  },
});
