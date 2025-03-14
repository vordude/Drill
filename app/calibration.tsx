import React from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

const STORAGE_KEYS = {
  DRILL_WIDTH: 'drill_width',
  ROW_SPACING: 'row_spacing',
  DISTANCE_PER_TURN: 'distance_per_turn',
};

const TURN_OPTIONS = [1, 10, 20, 30];

export default function CalibrationScreen() {
  // Drill settings (loaded from storage)
  const [drillWidth, setDrillWidth] = useState('');
  const [rowSpacing, setRowSpacing] = useState('');
  const [distancePerTurn, setDistancePerTurn] = useState('');

  // Calibration inputs
  const [numberOfTurns, setNumberOfTurns] = useState('1');
  const [rowsCaught, setRowsCaught] = useState('');
  const [seedWeight, setSeedWeight] = useState('');

  // Calculated result
  const [poundsPerAcre, setPoundsPerAcre] = useState(0);

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
      alert(`Cannot catch more than ${totalPossibleRows} rows based on current settings`);
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
          <View style={[styles.section, { backgroundColor: 'rgba(255, 255, 255, 0.85)' }]}>
            
            <View style={styles.inputRow}>
              <Text style={styles.label}>Number of Turns:</Text>
              <View 
                style={[styles.pickerContainer, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}
                >
                <Picker
                  selectedValue={numberOfTurns}
                  onValueChange={(value) => setNumberOfTurns(value.toString())}
                  style={[styles.picker, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}
                  itemStyle={{height: 50, fontSize: 16}}
                  >
                  {TURN_OPTIONS.map((turns) => (
                    <Picker.Item 
                      key={turns} 
                      label={turns.toString()} 
                      value={turns.toString()}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Rows Caught:</Text>
              <TextInput
                style={[styles.input, !rowsCaught && styles.inputEmpty, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}
                value={rowsCaught}
                onChangeText={validateRowsCaught}
                keyboardType="number-pad"
                placeholder={`Max ${calculateTotalRows(parseFloat(drillWidth || '0'), parseFloat(rowSpacing || '1'))} rows`}
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Seed Caught (lbs):</Text>
              <TextInput
                style={[styles.input, !seedWeight && styles.inputEmpty, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}
                value={seedWeight}
                onChangeText={validateSeedWeight}
                keyboardType="decimal-pad"
                placeholder="Enter weight"
              />
            </View>
          </View>

          <View style={[styles.resultSection, { backgroundColor: 'rgba(44, 110, 73, 0.9)' }]}>
            <Text style={styles.resultTitle}>Result:</Text>
            <Text style={styles.result}>{poundsPerAcre} lbs/acre</Text>
          </View>

          <View style={[styles.settingsPreview, { backgroundColor: 'rgba(255, 255, 255, 0.85)' }]}>
            <Text style={styles.settingsTitle}>Current Settings</Text>
            <Text style={styles.settingsText}>Width: {drillWidth} feet</Text>
            <Text style={styles.settingsText}>Spacing: {rowSpacing} inches</Text>
            <Text style={styles.settingsText}>Distance/Turn: {distancePerTurn} inches</Text>
            <Text style={styles.settingsText}>Total Rows: {calculateTotalRows(parseFloat(drillWidth || '0'), parseFloat(rowSpacing || '1'))}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginBottom: 20,
    backgroundColor: 'rgba(245, 245, 245, 0.7)',
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c6e49',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  inputEmpty: {
    borderColor: '#ff0000',
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 2,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    marginHorizontal: Platform.OS === 'android' ? 0 : -8,
    width: '100%',
    color: '#333',
    fontSize: 16,
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
    backgroundColor: 'rgba(245, 245, 245, 0.7)',
    padding: 15,
    borderRadius: 10,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c6e49',
    marginBottom: 8,
  },
  settingsText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
}); 