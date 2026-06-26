import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Colors from '../../Helper/Colors';
import { wp, hp } from '../../Helper/Responsive';
import { Fonts } from '../../Helper/Fonts';
import api from '../../redux/api';

const ReportBug = ({ navigation }: { navigation: any }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; description?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: { name?: string; email?: string; description?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!description.trim()) newErrors.description = 'Please describe the issue';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await api.post('/report-issues/submit', {
        name: name.trim(),
        email: email.trim(),
        description: description.trim(),
      });

      if (response.data?.success) {
        Alert.alert('Thank You', response.data.message || 'Issue reported successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/background.jpeg')}
      style={styles.background}
      resizeMode="cover">
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />

          <Text style={styles.title}>Report an Issue</Text>
          <Text style={styles.subtitle}>
            Fill in the form below and we'll get back to you as soon as possible.
          </Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="#9E9E9E"
            value={name}
            onChangeText={text => { setName(text); setErrors(e => ({ ...e, name: '' })); }}
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#9E9E9E"
            value={email}
            onChangeText={text => { setEmail(text); setErrors(e => ({ ...e, email: '' })); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          <Text style={styles.label}>Issue Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the issue you're experiencing..."
            placeholderTextColor="#9E9E9E"
            value={description}
            onChangeText={text => { setDescription(text); setErrors(e => ({ ...e, description: '' })); }}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Report</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
            <Text style={styles.backLinkText}>← Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(4),
  },
  container: {
    width: wp(90),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: wp(3),
    padding: wp(5),
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: hp(2),
  },
  title: {
    fontSize: wp(7),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: wp(3.8),
    color: '#757575',
    textAlign: 'center',
    fontFamily: Fonts.semiBold,
    marginBottom: hp(3),
  },
  label: {
    color: '#000000AB',
    fontFamily: Fonts.semiBold,
    marginBottom: hp(0.8),
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    backgroundColor: '#FFF',
    fontSize: 16,
    color: '#333',
    height: 55,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    backgroundColor: '#FFF',
    fontSize: 16,
    color: '#333',
    height: hp(15),
  },
  errorText: {
    color: 'red',
    fontSize: wp(3),
    marginBottom: hp(1),
  },
  submitButton: {
    backgroundColor: Colors.primary,
    marginTop: hp(3),
    borderRadius: wp(2),
    alignItems: 'center',
    height: 55,
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: wp(4),
    fontFamily: Fonts.bold,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  backLink: {
    marginTop: hp(2),
    alignItems: 'center',
  },
  backLinkText: {
    color: Colors.primary,
    fontSize: wp(3.8),
    fontFamily: Fonts.regular,
  },
});

export default ReportBug;
