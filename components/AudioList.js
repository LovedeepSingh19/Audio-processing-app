import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

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
      <TouchableOpacity style={{backgroundColor:'#872341', padding:6, borderRadius:15, flexDirection:'row', justifyContent:'center', alignItems:'center'}} onPress={playSound}>
        <Ionicons name='play-circle' style={{color:'white', padding:3,}} />
        <Text style={{color:'white', fontWeight:'600'}}>Play Audio</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AudioPlayer;
