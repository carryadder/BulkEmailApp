import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {Colors} from '../utils/colors';
import {saveTemplate, getTemplateById, generateId} from '../utils/storage';
import {useAppContext} from '../context/AppContext';
import Header from '../components/Header';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TemplateEditor'>;
  route: RouteProp<RootStackParamList, 'TemplateEditor'>;
};

const TemplateEditorScreen: React.FC<Props> = ({navigation, route}) => {
  const {columns} = useAppContext();
  const templateId = route.params?.templateId;
  const isEditing = !!templateId;

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showPlaceholders, setShowPlaceholders] = useState(false);
  const [activeField, setActiveField] = useState<'subject' | 'body'>('body');

  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [templateId]);

  const loadTemplate = async (id: string) => {
    const template = await getTemplateById(id);
    if (template) {
      setName(template.name);
      setSubject(template.subject);
      setBody(template.body);
    }
  };

  const insertPlaceholder = (column: string) => {
    const placeholder = `{{${column}}}`;
    if (activeField === 'subject') {
      setSubject(prev => prev + placeholder);
    } else {
      setBody(prev => prev + placeholder);
    }
    setShowPlaceholders(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a template name.');
      return;
    }
    if (!subject.trim()) {
      Alert.alert('Required', 'Please enter an email subject.');
      return;
    }
    if (!body.trim()) {
      Alert.alert('Required', 'Please enter the email body.');
      return;
    }

    const now = new Date().toISOString();
    await saveTemplate({
      id: templateId || generateId(),
      name: name.trim(),
      subject: subject.trim(),
      body: body.trim(),
      createdAt: isEditing ? now : now,
      updatedAt: now,
    });

    Alert.alert('Saved', 'Template saved successfully!', [
      {text: 'OK', onPress: () => navigation.goBack()},
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        title={isEditing ? 'Edit Template' : 'Create Template'}
        subtitle="Design your email template"
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
          {/* Template Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Template Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Welcome Email, Newsletter..."
              placeholderTextColor={Colors.textLight}
            />
          </View>

          {/* Subject Line */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Subject Line</Text>
              {columns.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setActiveField('subject');
                    setShowPlaceholders(!showPlaceholders);
                  }}
                  style={styles.placeholderBtn}>
                  <Icon name="data-object" size={16} color={Colors.primary} />
                  <Text style={styles.placeholderBtnText}>
                    Insert Placeholder
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="e.g., Hello {{name}}, welcome aboard!"
              placeholderTextColor={Colors.textLight}
              onFocus={() => setActiveField('subject')}
            />
          </View>

          {/* Email Body */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Email Body</Text>
              {columns.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setActiveField('body');
                    setShowPlaceholders(!showPlaceholders);
                  }}
                  style={styles.placeholderBtn}>
                  <Icon name="data-object" size={16} color={Colors.primary} />
                  <Text style={styles.placeholderBtnText}>
                    Insert Placeholder
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={[styles.input, styles.bodyInput]}
              value={body}
              onChangeText={setBody}
              placeholder={
                'Dear {{name}},\n\nThank you for joining us...\n\nBest regards,\nYour Company'
              }
              placeholderTextColor={Colors.textLight}
              multiline
              textAlignVertical="top"
              onFocus={() => setActiveField('body')}
            />
          </View>

          {/* Placeholder Chips */}
          {showPlaceholders && columns.length > 0 && (
            <View style={styles.placeholderPanel}>
              <Text style={styles.placeholderTitle}>
                Available Placeholders (from Excel)
              </Text>
              <View style={styles.chipContainer}>
                {columns.map(col => (
                  <TouchableOpacity
                    key={col}
                    style={styles.chip}
                    onPress={() => insertPlaceholder(col)}
                    activeOpacity={0.7}>
                    <Text style={styles.chipText}>{`{{${col}}}`}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Help Section */}
          <View style={styles.helpCard}>
            <Icon name="lightbulb" size={20} color={Colors.warning} />
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>Using Placeholders</Text>
              <Text style={styles.helpText}>
                Use {'{{column_name}}'} to insert dynamic data from your Excel
                sheet. For example, {'{{name}}'} will be replaced with each
                recipient's name.
              </Text>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}>
            <Icon name="save" size={20} color={Colors.white} />
            <Text style={styles.saveButtonText}>Save Template</Text>
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
  fieldGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  bodyInput: {
    minHeight: 200,
    paddingTop: 14,
  },
  placeholderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
  },
  placeholderBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  placeholderPanel: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  placeholderTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: Colors.warningLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  helpText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
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

export default TemplateEditorScreen;
