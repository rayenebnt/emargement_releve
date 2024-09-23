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
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import { REACT_APP_API_URL } from "../../API";

function InscriptionScreen({ navigation }) {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignUp = async () => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!lastName) {
      setErrorMessage("Le nom ne peut pas être vide.");
      return;
    }

    if (!firstName) {
      setErrorMessage("Le prénom ne peut pas être vide.");
      return;
    }

    if (!username) {
      setErrorMessage("Le nom d'utilisateur ne peut pas être vide.");
      return;
    }

    if (!emailRegex.test(email)) {
      setErrorMessage("L'adresse e-mail est invalide.");
      return;
    }

    if (!passwordRegex.test(password)) {
      setErrorMessage("Le mot de passe doit contenir au moins 6 caractères, une majuscule et un chiffre.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const response = await axios.post(`${REACT_APP_API_URL}/user`, {
        Nom: lastName,
        Prenom: firstName,
        UserName: username,
        Password: password,
        Email: email,
      });

      if (response.status === 201) {
        navigation.navigate("Connexion");
      } else {
        setErrorMessage("Erreur lors de l'inscription. Veuillez réessayer.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Erreur réseau. Vérifiez votre connexion réseau et réessayez."
      );
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.shadowContainer}>
          <View style={styles.formContainer}>
            <Image
              source={require("../../assets/Logo_releve.jpg")}
              style={styles.logo}
            />
            <Text style={styles.title}>Inscription</Text>

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nom"
                autoCapitalize="words"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Prénom"
                autoCapitalize="words"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nom d'utilisateur"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Mot de passe"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={toggleShowPassword}
                style={styles.toggleButton}
              >
                <FontAwesome
                  name={showPassword ? "eye-slash" : "eye"}
                  size={24}
                  color="#777"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Confirmez le mot de passe"
                secureTextEntry={true}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
              <Text style={styles.buttonText}>S'inscrire</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Connexion")}>
              <Text style={styles.registerText}>
                Déjà inscrit? Connectez-vous
              </Text>
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
    paddingBottom: 20,
  },
  shadowContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
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
    paddingBottom: 160,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 10,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 5,
    backgroundColor: "white",
    borderRadius: 5,
  },
  input: {
    height: 50,
    paddingHorizontal: 10,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 5,
  },
  passwordInput: {
    height: 50,
    paddingHorizontal: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    flex: 1,
  },
  toggleButton: {
    padding: 10,
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
  registerText: {
    color: "#800020",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 10,
    textDecorationLine: "underline",
  },
});

export default InscriptionScreen;
