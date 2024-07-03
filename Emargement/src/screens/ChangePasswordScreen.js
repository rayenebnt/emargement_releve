import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import { REACT_APP_API_URL } from '@env';

const ChangePasswordScreen = ({ route, navigation }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { email } = route.params;
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setErrorMsg("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const response = await axios.put(
        `${REACT_APP_API_URL}/user/changePassword`,
        {
          email,
          password,
        }
      );

      if (response.status === 200) {
        Alert.alert("Mot de passe modifié avec succès");
        navigation.navigate("Connexion");
      } else {
        Alert.alert(
          "Erreur",
          "Un problème est survenu lors de la modification du mot de passe"
        );
      }
    } catch (err) {
      Alert.alert(
        "Erreur réseau",
        "Un problème est survenu lors de la modification du mot de passe"
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.shadowContainer}>
          <View style={styles.formContainer}>
            <Image source={require("../../assets/Logo_releve.jpg")} style={styles.logo} />
            <Text style={styles.title}>Modifier votre mot de passe</Text>
            {errorMsg !== "" && <Text style={styles.errorText}>{errorMsg}</Text>}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                onChangeText={setPassword}
                value={password}
                secureTextEntry={true}
                placeholder="Nouveau mot de passe"
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                onChangeText={setConfirmPassword}
                value={confirmPassword}
                secureTextEntry={true}
                placeholder="Confirmer le mot de passe"
              />
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Modifier</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  shadowContainer: {
    width: "100%",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  formContainer: {
    width: "90%",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    fontSize: 16,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 5,
  },
  input: {
    height: 50,
    paddingHorizontal: 10,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  button: {
    backgroundColor: "#800020",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
});

export default ChangePasswordScreen;
