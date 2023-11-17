import {
    Text,
    View,
  } from "react-native";
import AudioPlayer from "./AudioList";
import React from "react";


const renderItem = ({ item }) => {
    const dateObject = new Date(item.timestamp);

    const year = dateObject.getFullYear();
    const month = dateObject.getMonth() + 1;
    const day = dateObject.getDate();
    const hours = dateObject.getHours();
    const minutes = dateObject.getMinutes();
    const seconds = dateObject.getSeconds();

    // Convert hours to 12-hour format
    const formattedHours = hours % 12 || 12; // Handle midnight (0) as 12
    const ampm = hours < 12 ? "AM" : "PM";
    const formattedDateTime = `${year}-${month < 10 ? "0" + month : month}-${
      day < 10 ? "0" + day : day
    } ${formattedHours < 10 ? "0" + formattedHours : formattedHours}:${
      minutes < 10 ? "0" + minutes : minutes
    }:${seconds < 10 ? "0" + seconds : seconds} ${ampm}`;

    return (
      // eslint-disable-next-line react/react-in-jsx-scope
      <View
        style={{
          borderRadius: 20,
          padding: 10,
          marginVertical: 5,
          backgroundColor: "#B0A695",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "white",
          }}
        >
          {item.id}.{" "}
        </Text>
        <Text
          style={{ paddingLeft: 10, paddingRight: 10, fontStyle: "italic" }}
        >
          {formattedDateTime}{" "}
        </Text>
        <View>
          <AudioPlayer audioLink={item.audio_link} />
        </View>
      </View>
    );
  };

export default renderItem