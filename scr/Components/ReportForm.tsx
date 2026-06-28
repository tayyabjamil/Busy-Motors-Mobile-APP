import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Colors from '../Helper/Colors';
import { wp, hp } from '../Helper/Responsive';
import { Fonts } from '../Helper/Fonts';

type Props = {
  onSubmit?: (data: { name: string; email: string; message: string }) => void | Promise<void>;
  loading?: boolean;
};

export default function ReportForm({ onSubmit, loading = false }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      Alert.alert('Validation', 'Please fill all fields');
      return;
    }
    const payload = { name: name.trim(), email: email.trim(), message: message.trim() };
    if (onSubmit) await onSubmit(payload);
    else Alert.alert('Submitted', 'Thank you for your report');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Your name"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#9E9E9E"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#9E9E9E"
      />

      <Text style={styles.label}>Problem</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe the problem"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
        placeholderTextColor="#9E9E9E"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Copy'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp(5),
  },
  label: {
    fontSize: wp(3.5),
    color: '#333',
    marginTop: hp(1.5),
    marginBottom: hp(0.5),
    fontFamily: Fonts.semiBold,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FFF',
    fontSize: wp(3.5),
    color: '#333',
  },
  textArea: {
    minHeight: hp(15),
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: hp(2),
  },
  buttonText: {
    color: '#fff',
    fontSize: wp(4),
    fontFamily: Fonts.bold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
