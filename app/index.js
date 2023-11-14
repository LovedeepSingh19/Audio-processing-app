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
import { ScrollView } from "react-native-gesture-handler";
import CloudflareApi from "../helpers/Cloudflare";
import addComment from "../helpers/supabase/AddComment";
import fetchData from "../helpers/supabase/fetchData";
import AudioPlayer from "../components/AudioList";

export default function Apps() {
  const [recording, setRecording] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState("idle");
  const [filename, setFilename] = useState("");
  const [audioUri, setAudioUri] = useState(null);
  const [supabaseList, setSupabaseList] = useState([]);
  const [commentsList, setCommentsList] = useState(supabaseList);
  const [audioPermission, setAudioPermission] = useState(null);

  useEffect(() => {
    getPermission();
    fetchData(setSupabaseList);
    return () => {
      if (recording) {
        stopRecording();
      }
    };
  }, [filename]);

  const playAudio = async (audioLink) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioLink },
        { shouldPlay: true }
      );
      // Handle sound playback events as needed
    } catch (error) {
      console.error('Error playing audio:', error.message);
    }
  };


  const renderItem = ({ item }) => (

    <View>
      {/* style={{ marginVertical: 10, padding: 10, backgroundColor: '8888' }}
      // onPress={() => playAudio(item.audio_link)}
    > */}
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.id}</Text>
      <Text>{ item.timestamp}</Text>
      <View>
        <AudioPlayer audioLink={item.audio_link} />
      </View>
      </View>
  );

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
      await newRecording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await newRecording.startAsync();
      setRecording(newRecording);
      setRecordingStatus("recording");
    } catch (error) {
      console.error("Failed to start recording", error);
    }
  }

  async function PlayAudio(fileName) {
    console.log(filename);
    const playbackObject = new Audio.Sound();
    await playbackObject.loadAsync({
      uri: fileName,
    });
    await playbackObject.playAsync();
  }

  async function stopRecording() {
    try {
      if (recordingStatus === "recording") {
        console.log("Stopping Recording");
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setAudioUri(uri);
        setFilename(`audio/${Date.now()}.caf`);
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
      <ScrollView>
        <View style={styles.container}>
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
                style={{
                  backgroundColor: "#363062",
                  padding: 6,
                  paddingLeft: 10,
                  paddingRight: 10,
                  borderRadius: 20,
                }}
                onPress={() => {
                  console.log("Play");
                  PlayAudio(audioUri);
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
                <Text style={{ color: "#F5E8C7", fontWeight: 500 }}>
                  Upload
                </Text>
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
        {/* <View> */}
        {/* </View> */}
      </ScrollView>
        {/* <AudioList data={supabaseList}/> */}
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
