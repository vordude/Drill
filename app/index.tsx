import { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

// Keys for persistent storage
const STORAGE_KEYS = {
  DRILL_WIDTH: 'drill_width',
  ROW_SPACING: 'row_spacing',
  DISTANCE_PER_TURN: 'distance_per_turn',
};

export default function ConfigScreen() {
  // Persistent drill settings
  const [drillWidth, setDrillWidth] = useState('20'); // feet
  const [rowSpacing, setRowSpacing] = useState('7.5'); // inches
  const [distancePerTurn, setDistancePerTurn] = useState('86'); // inches

  // Current input values
  const [currentDrillWidth, setCurrentDrillWidth] = useState(drillWidth);
  const [currentRowSpacing, setCurrentRowSpacing] = useState(rowSpacing);
  const [currentDistance, setCurrentDistance] = useState(distancePerTurn);

  // Refs for input fields
  const drillWidthRef = useRef<TextInput>(null);
  const rowSpacingRef = useRef<TextInput>(null);
  const distancePerTurnRef = useRef<TextInput>(null);

  // Load persistent settings
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

  const handleDrillWidthBlur = (e: any) => {
    setDrillWidth(currentDrillWidth);
  };

  const handleRowSpacingBlur = (e: any) => {
    setRowSpacing(currentRowSpacing);
  };

  const handleDistanceBlur = (e: any) => {
    setDistancePerTurn(currentDistance);
  };

  // Save settings and navigate to calibration
  const saveAndContinue = async () => {
    // Clean up and validate the input values
    const cleanWidth = drillWidth.replace(/[^0-9.]/g, '');
    const cleanSpacing = rowSpacing.replace(/[^0-9.]/g, '');
    const cleanDistance = distancePerTurn.replace(/[^0-9.]/g, '');

    // Basic validation for empty fields and number format
    if (!cleanWidth || !cleanSpacing || !cleanDistance || 
        isNaN(parseFloat(cleanWidth)) || isNaN(parseFloat(cleanSpacing)) || isNaN(parseFloat(cleanDistance))) {
      alert('Please fill in all settings with valid numbers');
      return;
    }

    // Convert to numbers for validation
    const width = parseFloat(cleanWidth);
    const spacing = parseFloat(cleanSpacing);
    const distance = parseFloat(cleanDistance);

    // Specific validation rules
    if (width <= 0) {
      alert('Drill width must be greater than 0 feet');
      return;
    }

    if (spacing < 0.5 || spacing > 36) {
      alert('Row spacing must be between 0.5 and 36 inches');
      return;
    }

    // Convert width to inches for comparison with row spacing
    const widthInInches = width * 12;
    if (spacing >= widthInInches) {
      alert('Row spacing must be less than the drill width');
      return;
    }

    if (distance <= 0) {
      alert('Distance per turn must be greater than 0 inches');
      return;
    }

    try {
      // Save the cleaned values
      await AsyncStorage.setItem(STORAGE_KEYS.DRILL_WIDTH, cleanWidth);
      await AsyncStorage.setItem(STORAGE_KEYS.ROW_SPACING, cleanSpacing);
      await AsyncStorage.setItem(STORAGE_KEYS.DISTANCE_PER_TURN, cleanDistance);
      
      // Navigate to calibration screen
      router.push('/calibration');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  };

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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Drill Configuration</Text>
        
        <View style={styles.section}>
          
          <View style={styles.inputRow}>
            <Text style={styles.label}>Drill Width (feet):</Text>
            <TextInput
              ref={drillWidthRef}
              style={[styles.input, !drillWidth && styles.inputEmpty]}
              defaultValue={drillWidth}
              onChangeText={setCurrentDrillWidth}
              onBlur={handleDrillWidthBlur}
              keyboardType="decimal-pad"
              editable={true}
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>Row Spacing (in):</Text>
            <TextInput
              ref={rowSpacingRef}
              style={[styles.input, !rowSpacing && styles.inputEmpty]}
              defaultValue={rowSpacing}
              onChangeText={setCurrentRowSpacing}
              onBlur={handleRowSpacingBlur}
              keyboardType="decimal-pad"
              editable={true}
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>Simulated Distance Per Turn (in):</Text>
            <TextInput
              ref={distancePerTurnRef}
              style={[styles.input, !distancePerTurn && styles.inputEmpty]}
              defaultValue={distancePerTurn}
              onChangeText={setCurrentDistance}
              onBlur={handleDistanceBlur}
              keyboardType="decimal-pad"
              editable={true}
            />
          </View>
        </View>

        <Pressable 
          style={({pressed}) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed
          ]}
          onPress={saveAndContinue}>
          <Text style={styles.saveButtonText}>Continue to Calibration</Text>
        </Pressable>
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
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c6e49',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
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
  saveButton: {
    backgroundColor: '#2c6e49',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonPressed: {
    opacity: 0.8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
