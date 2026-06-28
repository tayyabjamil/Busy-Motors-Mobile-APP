import React, { useState } from 'react';
import { View, StyleSheet, Alert, SafeAreaView } from 'react-native';
import Header from '../../Components/Header';
import ReportForm from '../../Components/ReportForm';
import { hp } from '../../Helper/Responsive';
import Colors from '../../Helper/Colors';
import { reportProblemAPI } from '../../redux/api';

const ReportProblem = ({ navigation }: { navigation: any }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: {
    name: string;
    email: string;
    message: string;
  }) => {
    setLoading(true);
    console.log("handlesubmit button clicked ")
    try {
      await reportProblemAPI({
        name: data.name,
        email: data.email,
        text: data.message,
      });
      Alert.alert('Report sent', 'Thank you — we will look into this.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.log('Report Problem submit error:', error?.message);
      console.log('Report Problem submit error details:', error);
      Alert.alert('Error', error.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header navigation={navigation} showBackButton textData="Report a problem" />
      <View style={styles.container}>
        <ReportForm onSubmit={handleSubmit} loading={loading} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: {
    flex: 1,
    paddingTop: hp(2),
  },
});

export default ReportProblem;
