import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList, SmtpConfig} from '../types';
import {Colors} from '../utils/colors';
import {saveSmtpConfig, getSmtpConfig} from '../utils/storage';
import Header from '../components/Header';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SmtpSettings'>;
};

const SmtpSettingsScreen: React.FC<Props> = ({navigation}) => {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('587');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const config = await getSmtpConfig();
    if (config) {
      setHost(config.host);
      setPort(config.port.toString());
      setUsername(config.username);
      setPassword(config.password);
      setSecure(config.secure);
    }
  };

  const handleSave = async () => {
    if (!host.trim()) {
      Alert.alert('Required', 'Please enter the SMTP host.');
      return;
    }
    if (!username.trim()) {
      Alert.alert('Required', 'Please enter the username / email.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Required', 'Please enter the password / app password.');
      return;
    }

    const config: SmtpConfig = {
      host: host.trim(),
      port: parseInt(port, 10) || 587,
      username: username.trim(),
      password: password.trim(),
      secure,
    };

    await saveSmtpConfig(config);
    Alert.alert('Saved', 'SMTP settings saved successfully!', [
      {text: 'OK', onPress: () => navigation.goBack()},
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        title="SMTP Settings"
        subtitle="Configure email server"
        onBack={() => navigation.goBack()}
        rightAction={{icon: 'save', onPress: handleSave}}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Icon name="info" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              Configure your SMTP server to send emails. For Gmail, use
              smtp.gmail.com with an App Password.
            </Text>
          </View>

          {/* Preset Buttons */}
          <View style={styles.presetSection}>
            <Text style={styles.presetLabel}>Quick Presets</Text>
            <View style={styles.presetRow}>
              <TouchableOpacity
                style={styles.presetBtn}
                onPress={() => {
                  setHost('smtp.gmail.com');
                  setPort('587');
                  setSecure(true);
                }}
                activeOpacity={0.7}>
                <Text style={styles.presetBtnText}>Gmail</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetBtn}
                onPress={() => {
                  setHost('smtp.office365.com');
                  setPort('587');
                  setSecure(true);
                }}
                activeOpacity={0.7}>
                <Text style={styles.presetBtnText}>Outlook</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetBtn}
                onPress={() => {
                  setHost('smtp.mail.yahoo.com');
                  setPort('587');
                  setSecure(true);
                }}
                activeOpacity={0.7}>
                <Text style={styles.presetBtnText}>Yahoo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* SMTP Host */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>SMTP Host</Text>
            <TextInput
              style={styles.input}
              value={host}
              onChangeText={setHost}
              placeholder="e.g., smtp.gmail.com"
              placeholderTextColor={Colors.textLight}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          {/* Port */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Port</Text>
            <TextInput
              style={styles.input}
              value={port}
              onChangeText={setPort}
              placeholder="587"
              placeholderTextColor={Colors.textLight}
              keyboardType="number-pad"
            />
          </View>

          {/* Username */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Username / Email</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="your-email@gmail.com"
              placeholderTextColor={Colors.textLight}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password / App Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password or app password"
                placeholderTextColor={Colors.textLight}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}>
                <Icon
                  name={showPassword ? 'visibility-off' : 'visibility'}
                  size={22}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* SSL/TLS Toggle */}
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.label}>Use SSL/TLS</Text>
              <Text style={styles.toggleHint}>
                Recommended for secure connections
              </Text>
            </View>
            <Switch
              value={secure}
              onValueChange={setSecure}
              trackColor={{false: Colors.border, true: Colors.primaryLight}}
              thumbColor={secure ? Colors.primary : Colors.textLight}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}>
            <Icon name="save" size={20} color={Colors.white} />
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  infoText: {
    fontSize: 13,
    color: Colors.primary,
    flex: 1,
    lineHeight: 18,
  },
  presetSection: {
    marginBottom: 20,
  },
  presetLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 10,
  },
  presetBtn: {
    backgroundColor: Colors.white,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  presetBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
  },
  eyeBtn: {
    padding: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  toggleHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});

export default SmtpSettingsScreen;
