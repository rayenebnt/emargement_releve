import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { REACT_APP_API_URL } from '@env';

const ValidationCodeScreen = ({ route }) => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const { email } = route.params;
  const navigation = useNavigation();

  const handleCodeSubmit = async () => {
    try {
      const response = await axios.post(
        `${REACT_APP_API_URL}/user/verify-reset-code`,
        {
          email,
          code,
        }
      );

      setMessage("Vérification réussie");

      navigation.navigate("ChangePassword", { email });
    } catch (error) {
      if (error.response) {
        console.log(
          "Code de réinitialisation invalide:",
          error.response.data.message
        );
        setMessage(error.response.data.message);
      } else {
        console.error("Erreur lors de la vérification du code:", error);
        Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  return (
    <View style={styles.shadowContainer}>
      <View style={styles.container}>
        <Image
          source={require("../../assets/Logo_releve.jpg")}
          style={styles.logo}
        />
        <Text style={styles.title}>La Releve Bariolée</Text>
        <Text style={styles.subtitle}>Entrez votre code de validation</Text>
        <TextInput
          style={styles.input}
          onChangeText={setCode}
          value={code}
          keyboardType="numeric"
          placeholder="Code à 4 chiffres"
        />
        <Pressable
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: pressed ? "gray" : "#800020",
            },
          ]}
          onPress={handleCodeSubmit}
        >
          <Text style={styles.buttonText}>Valider</Text>
        </Pressable>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  container: {
    width: "90%",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 20,
  },
  input: {
    height: 50,
    width: "100%",
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    fontSize: 16,
    color: "#333",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
  message: {
    fontSize: 16,
    color: "red",
    marginTop: 10,
  },
});

export default ValidationCodeScreen;
