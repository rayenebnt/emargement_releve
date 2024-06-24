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
import { useNavigation } from "@react-navigation/native";

function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleForgotPassword = async () => {
    try {
      const response = await axios.post("http://localhost:3036/user/forgotPassword", { email });
      if (response.status === 200) {
        Alert.alert(
          "Succès",
          "Si votre e-mail est dans notre base de données, vous recevrez un lien de réinitialisation."
        );
        navigation.navigate("ValidationCode", { email });
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 404) {
        console.log("E-mail non trouvé:", error.response.data.error);
        setErrorMsg(error.response.data.error);
      } else {
        setErrorMsg("Une erreur est survenue. Veuillez réessayer.");
      }
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
            <Text style={styles.title}>Réinitialisation du mot de passe</Text>
            {errorMsg !== "" && <Text style={styles.errorText}>{errorMsg}</Text>}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Entrez votre e-mail"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
              <Text style={styles.buttonText}>Envoyer le code de réinitialisation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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

export default ForgotPasswordScreen;
