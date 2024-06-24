import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from '@react-native-picker/picker';
import moment from "moment-timezone";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import "dayjs/locale/fr";
import "dayjs/locale/en";
import customParseFormat from "dayjs/plugin/customParseFormat";
import DeviceInfo from "react-native-device-info";

dayjs.extend(utc);
dayjs.extend(tz);
dayjs.extend(customParseFormat);
dayjs.locale("fr");
dayjs.tz.setDefault("Europe/Paris");

function EmargementScreen({ route, navigation }) {
  const { token } = route.params;
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [emargementType, setEmargementType] = useState("");
  const [emargementSuccess, setEmargementSuccess] = useState(false);
  const [emargementFailed, setEmargementFailed] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [emargementMessage, setEmargementMessage] = useState("");
  const [emargementMessageStyle, setEmargementMessageStyle] = useState({});

  const handleEmargement = async () => {
    if (status === "" || emargementType === "") {
      Alert.alert("Erreur", "Veuillez sélectionner un statut et le type d'émargement.");
      setEmargementMessage("Veuillez sélectionner un statut et le type d'émargement.");
      setEmargementMessageStyle({ color: "red" });
      return;
    }

    if (note === "") {
      Alert.alert("Erreur", "Le champ 'note' ne peut pas être vide.");
      setEmargementMessage("Le champ 'note' ne peut pas être vide.");
      setEmargementMessageStyle({ color: "red" });
      return;
    }

    try {
      const deviceId = await DeviceInfo.getUniqueId();
      const parisTime = moment().tz("Europe/Paris");
      const formattedDate = parisTime.format("YYYY-MM-DD HH:mm");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          const geocodingResponse = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );

          const address = geocodingResponse.data.address;
          const street = address.road || "Rue inconnue";
          const city =
            address.city || address.town || address.village || "Ville inconnue";

          const locationDetails = `${street}, ${city}`;

          await axios
            .post(
              `http://localhost:3036/user/emargement`,
              {
                lastName,
                firstName,
                status,
                city: locationDetails,
                emargementTime: formattedDate,
                deviceId,
                note,
                emargementType,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )
            .then((response) => {
              if (response.status === 200) {
                setEmargementSuccess(true);
                setEmargementMessage("Émargement réussi !");
                setEmargementMessageStyle({ color: "green" });
                Alert.alert(
                  "Émargement réussi",
                  "Votre présence a été enregistrée."
                );
              } else {
                console.log(response.data);
              }
            })
            .catch((error) => {
              if (error.response.status === 403) {
                setEmargementFailed(true);
                setEmargementSuccess(false);
                setEmargementMessage(
                  "Limite d'émargements atteinte pour cet appareil aujourd'hui. (max=2)"
                );
                setEmargementMessageStyle({ color: "red" });
                Alert.alert(
                  "Erreur",
                  "Erreur lors de l'émargement. Veuillez réessayer."
                );
              } else if (error.response.status === 404) {
                setEmargementMessage("Le nom ou le prénom est incorrect.");
                setEmargementMessageStyle({ color: "red" });
                Alert.alert(
                  "Erreur",
                  "Erreur lors de l'émargement. Veuillez réessayer."
                );
              } else {
                setEmargementMessage(
                  "Erreur lors de l'émargement. Veuillez réessayer."
                );
                setEmargementMessageStyle({ color: "red" });
                Alert.alert(
                  "Erreur",
                  "Erreur lors de l'émargement. Veuillez réessayer."
                );
              }
            });
        },
        (error) => {
          console.error(error);
          setEmargementMessage(
            "Erreur de localisation",
            "Impossible de récupérer la position de l'appareil."
          );
          setEmargementMessageStyle({ color: "red" });
          Alert.alert(
            "Erreur de localisation",
            "Impossible de récupérer la position de l'appareil."
          );
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    } catch (error) {
      setEmargementMessage(
        "Erreur réseau. Vérifiez votre connexion réseau et réessayez."
      );
      setEmargementMessageStyle({ color: "red" });
      console.error(error);
      Alert.alert("Erreur réseau", "Vérifiez votre connexion réseau et réessayez.");
    }
  };

  useEffect(() => {
    let redirectTimer;
    if (emargementSuccess) {
      redirectTimer = setTimeout(() => {
        navigation.navigate("Connexion");
        setRedirecting(true);
      }, 5000);
    }

    return () => {
      clearTimeout(redirectTimer);
    };
  }, [emargementSuccess, navigation]);

  if (redirecting) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.shadowContainer}>
          <View style={styles.container}>
            <Image
              source={require("../../assets/Logo_releve.jpg")}
              style={styles.logo}
            />
            <Text style={styles.title}>Émargement</Text>
            <Text style={styles.description}>
              Veuillez émarger seulement lorsque vous arrivez à l'endroit où vous travaillez et lorsque vous partez de l'endroit où vous avez travaillé. AUTORISEZ LA LOCALISATION SUR VOTRE TELEPHONE. 
              Veuillez entrer votre nom et prénom mis lors de l'inscription, sélectionnez votre statut et ajouter une note si nécessaire. Appuyez ensuite sur "Émarger" pour enregistrer votre présence.
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nom de Famille"
                value={lastName}
                onChangeText={(text) => setLastName(text)}
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Prénom"
                value={firstName}
                onChangeText={(text) => setFirstName(text)}
              />
            </View>
            <View style={styles.inputContainer}>
              <Picker
                selectedValue={status}
                style={styles.picker}
                onValueChange={(itemValue) => setStatus(itemValue)}
              >
                <Picker.Item label="Sélectionnez un statut" value="" />
                <Picker.Item label="Stagiaire" value="stagiaire" />
                <Picker.Item label="Alternant" value="alternant" />
                <Picker.Item label="Permanent" value="permanent" />
                <Picker.Item label="Bénévole" value="benevole" />
                <Picker.Item label="SNU" value="snu" />
                <Picker.Item label="Service Civique" value="service_civique" />
              </Picker>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Décrivez votre mission du jour ou la mission que vous avez effectuée."
                value={note}
                onChangeText={(text) => setNote(text)}
              />
            </View>
            <View style={styles.inputContainer}>
              <Picker
                selectedValue={emargementType}
                style={styles.picker}
                onValueChange={(itemValue) => setEmargementType(itemValue)}
              >
                <Picker.Item label="Sélectionnez le type d'émargement" value="" />
                <Picker.Item label="Début" value="debut" />
                <Picker.Item label="Fin" value="fin" />
              </Picker>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleEmargement}
            >
              <Text style={styles.buttonText}>Émarger</Text>
            </TouchableOpacity>
            <Text style={[styles.emargementMessage, emargementMessageStyle]}>
              {emargementMessage}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10, // Réduit l'espacement vertical
  },
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
  container: {
    width: "90%",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15, // Réduit le padding
    alignItems: "center",
  },
  logo: {
    width: 80, // Réduit la taille du logo
    height: 80, // Réduit la taille du logo
    marginBottom: 15, // Réduit l'espace en dessous du logo
  },
  title: {
    fontSize: 24, // Réduit la taille du titre
    fontWeight: "600",
    color: "#333333",
    marginBottom: 5, // Réduit l'espace en dessous du titre
  },
  description: {
    fontSize: 14, // Réduit la taille du texte de description
    color: "#666666",
    marginBottom: 15, // Réduit l'espace en dessous de la description
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 8, // Réduit l'espace entre les entrées
    backgroundColor: "white",
    borderRadius: 5,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  input: {
    height: 45, // Réduit la hauteur des entrées
    paddingHorizontal: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
  },
  picker: {
    height: 45, // Réduit la hauteur des pickers
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#800020",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginTop: 8, // Réduit l'espace au dessus du bouton
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 16, // Réduit la taille du texte du bouton
    fontWeight: "500",
  },
  emargementMessage: {
    fontSize: 16, // Réduit la taille du message d'émargement
    marginTop: 8, // Réduit l'espace au dessus du message d'émargement
  },
});

export default EmargementScreen;
