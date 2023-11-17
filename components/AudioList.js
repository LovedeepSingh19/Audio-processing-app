import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

// eslint-disable-next-line react/prop-types
const AudioPlayer = ({ audioLink }) => {
  const [sound, setSound] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioLink },
          { shouldPlay: false }
        );
        setSound(sound);
      } catch (error) {
        console.error("Error decoding audio URI:", error);
      }
    };

    loadSound();

    // Cleanup function
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audioLink]);

  const playSound = async () => {
    setIsLoading(true);

    if (sound) {
      // Unload the sound to reset its position
      await sound.unloadAsync();
      // Load the sound again before playing
      await sound.loadAsync({ uri: audioLink });
      // Play the sound
      await sound.playAsync();
    }

    setIsLoading(false);
  };

  return (
    <View>
      <TouchableOpacity
        disabled={isLoading}
        style={{
          backgroundColor: "#872341",
          padding: 6,
          borderRadius: 15,
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
        onPress={async () => await playSound()}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Ionicons name="play-circle" style={{ color: "white", padding: 3 }} />
            <Text style={{ color: "white", fontWeight: "600" }}>Play Audio</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default AudioPlayer;
