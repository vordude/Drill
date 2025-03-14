import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function DrillCalculator() {
  // Drill settings
  const [drillWidth, setDrillWidth] = useState('');
  const [rowSpacing, setRowSpacing] = useState('');
  
  // Calibration settings
  const [distancePerTurn, setDistancePerTurn] = useState('');
  const [numberOfTurns, setNumberOfTurns] = useState('');
  const [rowsCaught, setRowsCaught] = useState('');
  
  // Weight measurement
  const [seedWeight, setSeedWeight] = useState('');
  
  // Results
  const [poundsPerAcre, setPoundsPerAcre] = useState(null);

  const calculateRate = useCallback(() => {
    // Convert all inputs to numbers
    const width = parseFloat(drillWidth);
    const spacing = parseFloat(rowSpacing);
    const distance = parseFloat(distancePerTurn) * parseFloat(numberOfTurns);
    const rows = parseFloat(rowsCaught);
    const weight = parseFloat(seedWeight);

    if (!width || !spacing || !distance || !rows || !weight) {
      alert('Please fill in all fields');
      return;
    }

    // Calculate area covered in the test
    const totalWidth = (width * rows) / (width / spacing); // Actual width of caught rows
    const areaInSqFt = (totalWidth * distance) / 144; // Convert to square feet (12x12)
    const acreage = areaInSqFt / 43560; // Convert to acres

    // Calculate pounds per acre
    const lbsPerAcre = weight / acreage;
    setPoundsPerAcre(lbsPerAcre.toFixed(2));
  }, [drillWidth, rowSpacing, distancePerTurn, numberOfTurns, rowsCaught, seedWeight]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Drill Settings</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Drill Width (feet)</Text>
            <TextInput
              style={styles.input}
              value={drillWidth}
              onChangeText={setDrillWidth}
              keyboardType="decimal-pad"
              placeholder="Enter drill width"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Row Spacing (inches)</Text>
            <TextInput
              style={styles.input}
              value={rowSpacing}
              onChangeText={setRowSpacing}
              keyboardType="decimal-pad"
              placeholder="Enter row spacing"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calibration Settings</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Distance per Turn (feet)</Text>
            <TextInput
              style={styles.input}
              value={distancePerTurn}
              onChangeText={setDistancePerTurn}
              keyboardType="decimal-pad"
              placeholder="Enter distance per turn"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Turns</Text>
            <TextInput
              style={styles.input}
              value={numberOfTurns}
              onChangeText={setNumberOfTurns}
              keyboardType="decimal-pad"
              placeholder="Enter number of turns"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Rows Caught</Text>
            <TextInput
              style={styles.input}
              value={rowsCaught}
              onChangeText={setRowsCaught}
              keyboardType="decimal-pad"
              placeholder="Enter rows caught"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weight Measurement</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Seed Weight (pounds)</Text>
            <TextInput
              style={styles.input}
              value={seedWeight}
              onChangeText={setSeedWeight}
              keyboardType="decimal-pad"
              placeholder="Enter seed weight"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={calculateRate}>
          <Text style={styles.buttonText}>Calculate Rate</Text>
        </TouchableOpacity>

        {poundsPerAcre && (
          <View style={styles.results}>
            <Text style={styles.resultTitle}>Results</Text>
            <Text style={styles.resultText}>
              {poundsPerAcre} pounds per acre
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c6e49',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2c6e49',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  results: {
    backgroundColor: '#e8f5e9',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c6e49',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b4332',
  },
}); 