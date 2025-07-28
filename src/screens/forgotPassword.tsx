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

interface ForgotPasswordScreenProps {
  onBack?: () => void;
  onResetSuccess?: () => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onBack, onResetSuccess }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const goBack = () => {
    if (onBack) {
      onBack();
    } else {
      Alert.alert('Back button pressed');
    }
  };

  const handleResetPassword = () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      Alert.alert(
        'Reset Link Sent',
        'If an account with this email exists, you will receive a password reset link shortly.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onResetSuccess) {
                onResetSuccess();
              }
            },
          },
        ]
      );
    }, 2000);
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
        
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your email to receive a reset link</Text>
        
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>Reset link sent successfully!</Text> : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.emailInputContainer}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={styles.emailIcon}>
              <Path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                stroke="#6b7280"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M22 6l-10 7L2 6"
                stroke="#6b7280"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <TextInput
              style={styles.emailInput}
              placeholder="Enter your email address"
              placeholderTextColor="#b6b6b6"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!isLoading}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleResetPassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.buttonText}>Sending...</Text>
          ) : (
            <Text style={styles.buttonText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backToLogin} onPress={goBack}>
          <Text style={styles.backToLoginText}>Back to Login</Text>
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
    backgroundColor: 'rgba(20,24,40,0.55)',
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
    borderColor: '#bfa14a',
    borderWidth: 3,
  },
  iconCircle: {
    backgroundColor: '#1f2937',
    borderRadius: 40,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    borderColor: '#bfa14a',
    borderWidth: 3,
  },
  bugImage: {
    width: 44,
    height: 44,
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
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: '#334155',
    marginBottom: 4,
    marginLeft: 2,
    fontWeight: 'bold',
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 44,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
  },
  emailIcon: {
    marginRight: 10,
  },
  emailInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    backgroundColor: 'transparent',
    color: '#000',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 48,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backToLogin: {
    paddingVertical: 8,
  },
  backToLoginText: {
    color: '#003060',
    fontSize: 16,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  error: {
    color: '#dc2626',
    marginBottom: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  success: {
    color: '#059669',
    marginBottom: 10,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen; 