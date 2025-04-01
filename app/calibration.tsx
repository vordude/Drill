import React from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable, ImageBackground, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

const STORAGE_KEYS = {
  DRILL_WIDTH: 'drill_width',
  ROW_SPACING: 'row_spacing',
  DISTANCE_PER_TURN: 'distance_per_turn',
};

const TURN_OPTIONS = [10, 20, 30, 40];

export default function CalibrationScreen() {
  // Drill settings (loaded from storage)
  const [drillWidth, setDrillWidth] = useState('');
  const [rowSpacing, setRowSpacing] = useState('');
  const [distancePerTurn, setDistancePerTurn] = useState('');

  // Calibration inputs
  const [numberOfTurns, setNumberOfTurns] = useState('10');
  const [rowsCaught, setRowsCaught] = useState('');
  const [seedWeight, setSeedWeight] = useState('');

  // Calculated result
  const [poundsPerAcre, setPoundsPerAcre] = useState(0);

  // Additional state
  const [showPicker, setShowPicker] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Load drill settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const width = await AsyncStorage.getItem(STORAGE_KEYS.DRILL_WIDTH);
        const spacing = await AsyncStorage.getItem(STORAGE_KEYS.ROW_SPACING);
        const distance = await AsyncStorage.getItem(STORAGE_KEYS.DISTANCE_PER_TURN);

        if (width) setDrillWidth(width);
        if (spacing) setRowSpacing(spacing);
        if (distance) setDistancePerTurn(distance);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  // Calculate total possible rows on drill
  const calculateTotalRows = (width: number, spacing: number) => {
    return Math.floor((width * 12) / spacing);
  };

  // Validate and update rows caught
  const validateRowsCaught = (text: string) => {
    const value = text.replace(/[^0-9]/g, ''); // Only allow whole numbers
    if (value === '') {
      setRowsCaught('');
      return;
    }

    const rows = parseInt(value);
    const width = parseFloat(drillWidth);
    const spacing = parseFloat(rowSpacing);
    const totalPossibleRows = calculateTotalRows(width, spacing);

    if (rows > totalPossibleRows) {
      setAlertMessage(`The number of rows caught cannot exceed ${totalPossibleRows} based on your drill width (${width} feet) and row spacing (${spacing} inches) settings.`);
      setShowAlert(true);
      return;
    }

    setRowsCaught(value);
  };

  // Validate and update seed weight
  const validateSeedWeight = (text: string) => {
    const value = text.replace(/[^0-9.]/g, ''); // Allow decimals
    if (value === '') {
      setSeedWeight('');
      return;
    }
    setSeedWeight(value);
  };

  // Calculate pounds per acre
  useEffect(() => {
    // Only calculate if we have all required values and they're valid numbers
    if (drillWidth && 
        rowSpacing && 
        distancePerTurn && 
        rowsCaught !== '' && 
        seedWeight !== '' && 
        numberOfTurns) {
      
      const width = parseFloat(drillWidth);
      const spacing = parseFloat(rowSpacing);
      const distance = parseFloat(distancePerTurn) / 12; // convert inches to feet
      const rows = parseInt(rowsCaught);
      const weight = parseFloat(seedWeight);
      const turns = parseInt(numberOfTurns);

      // Validate inputs
      if (rows <= 0 || weight <= 0 || rows > calculateTotalRows(width, spacing)) {
        setPoundsPerAcre(0);
        return;
      }

      // Calculate total rows on drill
      const totalRows = (width * 12) / spacing;
      
      // Calculate area covered in acres
      // (drill width in feet * distance in feet * number of turns) / square feet per acre
      const areaCovered = (width * distance * turns) / 43560;
      
      // Calculate pounds per acre
      // (weight caught * total rows / rows caught) / area covered
      const lbsPerAcre = ((weight * totalRows / rows) / areaCovered);
      
      setPoundsPerAcre(Math.round(lbsPerAcre * 10) / 10);
    } else {
      setPoundsPerAcre(0);
    }
  }, [drillWidth, rowSpacing, distancePerTurn, rowsCaught, seedWeight, numberOfTurns]);

  return (
    <ImageBackground 
      source={require('../assets/images/row.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.titleContainer}>
              <Text style={styles.title}>Calibration</Text>
            </View>
          <View style={styles.section}>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Number of Turns:</Text>
              {Platform.OS === 'ios' ? (
                <View style={styles.inputContainer}>
                  <Pressable 
                    style={styles.pickerContainer}
                    onPress={() => setShowPicker(true)}
                  >
                    <Text style={styles.pickerText}>{numberOfTurns}</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.inputContainer}>
                  <Pressable 
                    style={styles.pickerContainer}
                    onPress={() => setShowPicker(true)}
                  >
                    <Text style={styles.pickerText}>{numberOfTurns}</Text>
                  </Pressable>
                </View>
              )}
            </View>

            <Modal
              visible={showPicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowPicker(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Number of Turns</Text>
                    <Pressable onPress={() => setShowPicker(false)}>
                      <Text style={styles.modalClose}>Done</Text>
                    </Pressable>
                  </View>
                  <ScrollView style={styles.modalList}>
                    {TURN_OPTIONS.map((turns) => (
                      <Pressable
                        key={turns}
                        style={[
                          styles.modalItem,
                          turns.toString() === numberOfTurns && styles.modalItemSelected
                        ]}
                        onPress={() => {
                          setNumberOfTurns(turns.toString());
                          setShowPicker(false);
                        }}
                      >
                        <Text style={[
                          styles.modalItemText,
                          turns.toString() === numberOfTurns && styles.modalItemTextSelected
                        ]}>
                          {turns}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Rows Caught:</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, !rowsCaught && styles.inputEmpty]}
                  value={rowsCaught}
                  onChangeText={validateRowsCaught}
                  keyboardType="number-pad"
                  editable={true}
                  textAlign="center"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Seed Caught (lbs):</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, !seedWeight && styles.inputEmpty]}
                  value={seedWeight}
                  onChangeText={validateSeedWeight}
                  keyboardType="decimal-pad"
                  editable={true}
                  textAlign="center"
                />
              </View>
            </View>
          </View>

          <View style={[styles.resultSection, { backgroundColor: 'rgba(44, 110, 73, 0.9)' }]}>
            <Text style={styles.resultTitle}>Result:</Text>
            <Text style={styles.result}>{poundsPerAcre} lbs/acre</Text>
          </View>

          <View style={[styles.settingsPreview, { backgroundColor: 'rgba(245, 245, 245, 0.85)' }]}>
            <Text style={styles.settingsTitle}>Current Settings</Text>
            <Text style={styles.settingsText}>Width: {drillWidth} feet</Text>
            <Text style={styles.settingsText}>Spacing: {rowSpacing} inches</Text>
            <Text style={styles.settingsText}>Distance/Turn: {distancePerTurn} inches</Text>
            <Text style={styles.settingsText}>Total Rows: {calculateTotalRows(parseFloat(drillWidth || '0'), parseFloat(rowSpacing || '1'))}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showAlert}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAlert(false)}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Invalid Row Count</Text>
            <Text style={styles.alertMessage}>{alertMessage}</Text>
            <Pressable 
              style={styles.alertButton}
              onPress={() => setShowAlert(false)}
            >
              <Text style={styles.alertButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    backgroundColor: 'rgba(245, 245, 245, 0.7)',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 20,
    width: '90%',
    alignSelf: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    backgroundColor: 'rgba(80, 80, 80, 0.8)',
    padding: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '90%',
    alignSelf: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  label: {
    width: '60%',
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
    paddingRight: 10,
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '40%',
    paddingLeft: 10,
    alignItems: 'center',
  },
  input: {
    width: 100,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  inputEmpty: {
    borderColor: '#ff0000',
  },
  pickerContainer: {
    width: 100,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  picker: {
    width: 100,
    height: 40,
    color: '#333',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: -10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  modalClose: {
    fontSize: 18,
    color: '#2c6e49',
    fontWeight: '600',
  },
  modalList: {
    maxHeight: 300,
    width: '100%',
  },
  modalItemSelected: {
    backgroundColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 20,
    color: '#333',
  },
  modalItemTextSelected: {
    color: '#2c6e49',
    fontWeight: '600',
  },
  resultSection: {
    alignItems: 'center',
    backgroundColor: '#2c6e49',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  result: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsPreview: {
    backgroundColor: 'rgba(245, 245, 245, 0.85)',
    padding: 15,
    borderRadius: 10,
    width: '60%',
    alignSelf: 'center',
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c6e49',
    marginBottom: 8,
    textAlign: 'center',
  },
  settingsText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  alertMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  alertButton: {
    backgroundColor: '#2c6e49',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalItem: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
}); 