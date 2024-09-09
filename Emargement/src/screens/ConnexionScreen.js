import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import axios from "axios";
import { REACT_APP_API_URL } from "@env";

function ConnexionScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleBlur = () => {
    setErrorMessage("");
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${REACT_APP_API_URL}/user/login`, {
        UserName: username,
        Password: password,
      });

      if (response.status === 200) {
        Alert.alert("Connexion réussie", "Vous êtes maintenant connecté.");
        const token = response.data.token;
        navigation.navigate("Emargement", { token });
      } else {
        setErrorMessage("Erreur lors de la connexion. Veuillez réessayer.");
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 401) {
        setErrorMessage("Nom d'utilisateur ou mot de passe incorrect.");
      } else {
        setErrorMessage(
          "Erreur réseau. Vérifiez votre connexion et réessayez."
        );
      }
    }
  };

  const handleSignUp = () => {
    navigation.navigate("Inscription");
  };

  const navigateToForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={styles.shadowContainer}>
      <View style={styles.container}>
        <Image
          source={require("../../assets/Logo_releve.jpg")}
          style={styles.logo}
        />
        <Text style={styles.title}>La Relève Bariolée</Text>
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nom d'utilisateur"
            value={username}
            onChangeText={setUsername}
            onBlur={handleBlur}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            onBlur={handleBlur}
          />
          <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeIcon}>
            <Text>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={navigateToForgotPassword}>
          <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSignUp}>
          <Text style={styles.signUpText}>Je ne suis pas encore inscrit ?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    marginBottom: 40,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 5,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  eyeIcon: {
    padding: 12,
  },
  button: {
    backgroundColor: "#800020",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
  forgotPasswordText: {
    marginTop: 16,
    fontWeight: "500",
    color: "#007bff",
    textDecorationLine: "underline",
  },
  signUpText: {
    marginTop: 16,
    fontWeight: "500",
    color: "#800020",
    textDecorationLine: "underline",
  },
});

export default ConnexionScreen;
