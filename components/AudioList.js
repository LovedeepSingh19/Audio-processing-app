import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';

const AudioPlayer = ({audioLink}) => {
  const [sound, setSound] = useState();
  
  useEffect(() => {
    const loadSound = async () => {
        try {
            const {sound} = await Audio.Sound.createAsync(
              { uri: audioLink },
              { shouldPlay: false }
            );
                setSound(sound);
          } catch (error) {
            console.error('Error decoding audio URI:', error);
          }
    };

    loadSound();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audioLink]);

  const playSound = async () => {
    if (sound) {
      await sound.playAsync();
    }
  };
  return (
    <View>
      <TouchableOpacity onPress={playSound}>
        <Text>Play Audio</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AudioPlayer;
