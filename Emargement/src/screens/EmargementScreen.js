import React, { useState, useEffect } from 'react';
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
  Modal,
} from 'react-native';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment-timezone';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
import 'dayjs/locale/fr';
import 'dayjs/locale/en';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { REACT_APP_API_URL } from '../../API';

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
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [typeModalVisible, setTypeModalVisible] = useState(false);

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
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus !== 'granted') {
        Alert.alert('Erreur', 'La permission de localisation a été refusée.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const geocodingResponse = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );

      const address = geocodingResponse.data.address;
      const street = address.road || "Rue inconnue";
      const city =
        address.city || address.town || address.village || "Ville inconnue";

      const locationDetails = `${street}, ${city}`;

      const parisTime = moment().tz("Europe/Paris");
      const formattedDate = parisTime.format("YYYY-MM-DD HH:mm");

      await axios.post(
        `${REACT_APP_API_URL}/user/emargement`,
        {
          lastName,
          firstName,
          status,
          city: locationDetails,
          emargementTime: formattedDate,
          note,
          emargementType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ).then((response) => {
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
      }).catch((error) => {
        console.error(error); // Ajoutez ceci pour loguer l'erreur dans la console
        if (error.response) {
          if (error.response.status === 403) {
            setEmargementFailed(true);
            setEmargementSuccess(false);
            setEmargementMessage(
              "Limite d'émargements atteinte pour cet appareil aujourd'hui. (max=2)"
            );
            setEmargementMessageStyle({ color: "red" });
            Alert.alert(
              "Erreur",
              "Erreur lors de l'émargement. Veuillez réessayer. 1"
            );
          } else if (error.response.status === 404) {
            setEmargementMessage("Le nom ou le prénom est incorrect.");
            setEmargementMessageStyle({ color: "red" });
            Alert.alert(
              "Erreur",
              "Erreur lors de l'émargement. Veuillez réessayer. 2"
            );
          } else {
            setEmargementMessage(
              "Erreur lors de l'émargement. Veuillez réessayer. 3"
            );
            setEmargementMessageStyle({ color: "red" });
            Alert.alert(
              "Erreur",
              "Erreur lors de l'émargement. Veuillez réessayer. 3"
            );
          }
        } else if (error.request) {
          // Le client a émis une demande mais n'a pas reçu de réponse
          setEmargementMessage(
            "Aucune réponse du serveur. Veuillez vérifier votre connexion et réessayer."
          );
          setEmargementMessageStyle({ color: "red" });
          Alert.alert(
            "Erreur",
            "Aucune réponse du serveur. Veuillez vérifier votre connexion et réessayer."
          );
        } else {
          // Une erreur s'est produite lors de la configuration de la demande
          setEmargementMessage(
            "Erreur lors de la configuration de la demande. Veuillez réessayer."
          );
          setEmargementMessageStyle({ color: "red" });
          Alert.alert(
            "Erreur",
            "Erreur lors de la configuration de la demande. Veuillez réessayer."
          );
        }
      });
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
            <TouchableOpacity style={styles.pickerContainer} onPress={() => setStatusModalVisible(true)}>
              <Text style={styles.pickerText}>
                {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Sélectionnez un statut"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickerContainer} onPress={() => setTypeModalVisible(true)}>
              <Text style={styles.pickerText}>
                {emargementType ? emargementType.charAt(0).toUpperCase() + emargementType.slice(1) : "Sélectionnez le type d'émargement"}
              </Text>
            </TouchableOpacity>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Décrivez votre mission du jour ou la mission que vous avez effectuée."
                value={note}
                onChangeText={(text) => setNote(text)}
              />
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
        <Modal
          transparent={true}
          animationType="slide"
          visible={statusModalVisible}
          onRequestClose={() => setStatusModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Picker
                selectedValue={status}
                onValueChange={(itemValue) => {
                  setStatus(itemValue);
                  setStatusModalVisible(false);
                }}
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
          </View>
        </Modal>
        <Modal
          transparent={true}
          animationType="slide"
          visible={typeModalVisible}
          onRequestClose={() => setTypeModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Picker
                selectedValue={emargementType}
                onValueChange={(itemValue) => {
                  setEmargementType(itemValue);
                  setTypeModalVisible(false);
                }}
              >
                <Picker.Item label="Sélectionnez le type d'émargement" value="" />
                <Picker.Item label="Début" value="debut" />
                <Picker.Item label="Fin" value="fin" />
              </Picker>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
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
    width: "95%",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 10,
  },
  description: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 10,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 8,
    backgroundColor: "white",
    borderRadius: 5,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  pickerContainer: {
    width: "100%",
    marginBottom: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
  },
  pickerText: {
    color: "#666",
  },
  input: {
    height: 40,
    paddingHorizontal: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#800020",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  emargementMessage: {
    fontSize: 14,
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
});

export default EmargementScreen;
