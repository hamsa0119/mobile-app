import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Platform,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const backgroundImage = require('../../assert/2.jpeg');
const bugImage = require('../../assert/bug.png');

// Add prop type for onLoginSuccess and onBack
interface LoginScreenProps {
  onLoginSuccess?: () => void;
  onBack?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const goBack = () => {
    // Use onBack for back navigation
    if (onBack) {
      onBack();
    } else {
      Alert.alert('Back button pressed');
    }
  };

  const handleLogin = () => {
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    if (username !== 'admin' || password !== 'Admin') {
      setError('Invalid username or password.');
      return;
    }
    setError('');
    // Alert.alert('Login', `Username: ${username}\nPassword: ${password}`);
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={goBack} activeOpacity={0.7}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Image source={bugImage} style={styles.bugImage} resizeMode="contain" />
        </View>
        <Text style={styles.title}>DefectTracker Pro</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            placeholderTextColor="#b6b6b6"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            textContentType="username"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[styles.passwordInput, { color: '#000' }]}
              placeholder="Enter your password"
              placeholderTextColor="#b6b6b6"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType="password"
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIconInside}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                {showPassword ? (
                  // Open eye icon (password visible)
                  <>
                    <Path
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                      stroke="#6b7280"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"
                      stroke="#6b7280"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                ) : (
                  // Crossed eye icon (password hidden)
                  <>
                    <Path
                      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                      stroke="#6b7280"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M1 1l22 22"
                      stroke="#6b7280"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}
              </Svg>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe ? <Text style={styles.checkboxTick}>✓</Text> : null}
            </View>
            <Text style={styles.checkboxLabel}>Remember Me</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20,24,40,0.55)', // dark overlay for readability
    zIndex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 280,
    zIndex: 10,
    backgroundColor: 'rgba(237,222,201,0.95)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    width: '92%',
    maxWidth: 400,
    backgroundColor: '#eddec9',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 2,
    borderColor: '#bfa14a', // gold border
    borderWidth: 3, // bold border
  },
  iconCircle: {
    backgroundColor: '#1f2937', // dark blue
    borderRadius: 40,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    borderColor: '#bfa14a', // gold border
    borderWidth: 3,
  },
  bugImage: {
    width: 44,
    height: 44,
  },
  lockIcon: {
    fontSize: 32,
    color: '#2563eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 14,
  },
  label: {
    fontSize: 15,
    color: '#334155',
    marginBottom: 4,
    marginLeft: 2,
    fontWeight: 'bold',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 44,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  eyeIconInside: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 44,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    marginTop: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#2563eb',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkboxTick: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#334155',
    marginLeft: 4,
  },
  forgot: {
    color: '#2563eb',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 48,
    backgroundColor: '#1f2937', // dark blue
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonIcon: {
    fontSize: 18,
    color: '#fff',
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default LoginScreen;
