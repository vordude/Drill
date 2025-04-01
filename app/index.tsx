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
  const [currentWidth, setCurrentWidth] = useState(drillWidth);
  const [currentSpacing, setCurrentSpacing] = useState(rowSpacing);
  const [currentDistance, setCurrentDistance] = useState(distancePerTurn);

  // Load persistent settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const width = await AsyncStorage.getItem(STORAGE_KEYS.DRILL_WIDTH);
        const spacing = await AsyncStorage.getItem(STORAGE_KEYS.ROW_SPACING);
        const distance = await AsyncStorage.getItem(STORAGE_KEYS.DISTANCE_PER_TURN);

        if (width) {
          setDrillWidth(width);
          setCurrentWidth(width);
        }
        if (spacing) {
          setRowSpacing(spacing);
          setCurrentSpacing(spacing);
        }
        if (distance) {
          setDistancePerTurn(distance);
          setCurrentDistance(distance);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  // Save settings and navigate to calibration
  const saveAndContinue = async () => {
    // Clean up and validate the input values
    const cleanWidth = currentWidth.replace(/[^0-9.]/g, '');
    const cleanSpacing = currentSpacing.replace(/[^0-9.]/g, '');
    const cleanDistance = currentDistance.replace(/[^0-9.]/g, '');

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
      
      // Update persistent state
      setDrillWidth(cleanWidth);
      setRowSpacing(cleanSpacing);
      setDistancePerTurn(cleanDistance);
      
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
       <View style={styles.titleContainer}>
            <Text style={styles.title}>Drill Configuration</Text>
          </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          
          <View style={styles.inputRow}>
            <Text style={styles.label}>Drill Width (ft):</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                defaultValue={drillWidth}
                onChangeText={(text) => {
                  const cleanText = text.replace(/[^0-9.]/g, '');
                  setCurrentWidth(cleanText);
                }}
                onBlur={() => {
                  if (!currentWidth) {
                    setCurrentWidth(drillWidth);
                  }
                }}
                keyboardType="decimal-pad"
                editable={true}
                textAlign="center"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>Row Spacing (in):</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                defaultValue={rowSpacing}
                onChangeText={(text) => {
                  const cleanText = text.replace(/[^0-9.]/g, '');
                  setCurrentSpacing(cleanText);
                }}
                onBlur={() => {
                  if (!currentSpacing) {
                    setCurrentSpacing(rowSpacing);
                  }
                }}
                keyboardType="decimal-pad"
                editable={true}
                textAlign="center"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>Distance per Turn (ft):</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                defaultValue={distancePerTurn}
                onChangeText={(text) => {
                  const cleanText = text.replace(/[^0-9.]/g, '');
                  setCurrentDistance(cleanText);
                }}
                onBlur={() => {
                  if (!currentDistance) {
                    setCurrentDistance(distancePerTurn);
                  }
                }}
                keyboardType="decimal-pad"
                editable={true}
                textAlign="center"
              />
            </View>
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
  section: {
    backgroundColor: 'rgba(245, 245, 245, 0.8)',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 20,
    width: '90%',
    alignSelf: 'center',
  },
  titleContainer: {
    backgroundColor: 'rgba(80, 80, 80, 0.8)',
    padding: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
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
    textAlign: 'right',
  },
  saveButton: {
    backgroundColor: '#2c6e49',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#d4d4d4',
    width: '60%',
    alignSelf: 'center',
  },
  saveButtonPressed: {
    opacity: 0.8,
    backgroundColor: '#1a4a2f',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 0,
  },
});
