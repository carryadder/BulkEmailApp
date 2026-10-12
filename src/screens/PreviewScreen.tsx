import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList, EmailTemplate} from '../types';
import {Colors} from '../utils/colors';
import {getTemplateById} from '../utils/storage';
import {mergeTemplate} from '../utils/excelParser';
import Header from '../components/Header';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Preview'>;
  route: RouteProp<RootStackParamList, 'Preview'>;
};

const PreviewScreen: React.FC<Props> = ({navigation, route}) => {
  const {templateId, recipients} = route.params;
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadTemplate = async () => {
      const t = await getTemplateById(templateId);
      setTemplate(t);
    };
    loadTemplate();
  }, [templateId]);

  if (!template) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Header title="Preview" onBack={() => navigation.goBack()} />
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading template...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentRecipient = recipients[currentIndex];
  const mergedSubject = mergeTemplate(template.subject, currentRecipient);
  const mergedBody = mergeTemplate(template.body, currentRecipient);

  const handleSend = () => {
    Alert.alert(
      'Send Bulk Emails',
      `You are about to send ${recipients.length} emails using the "${template.name}" template. Continue?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Send All',
          onPress: () => {
            navigation.navigate('SendProgress', {
              templateId: template.id,
              recipients,
            });
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        title="Preview Emails"
        subtitle={`Recipient ${currentIndex + 1} of ${recipients.length}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}>
        {/* Navigation between recipients */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[
              styles.navBtn,
              currentIndex === 0 && styles.navBtnDisabled,
            ]}
            onPress={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            activeOpacity={0.7}>
            <Icon
              name="chevron-left"
              size={24}
              color={currentIndex === 0 ? Colors.textLight : Colors.primary}
            />
            <Text
              style={[
                styles.navBtnText,
                currentIndex === 0 && styles.navBtnTextDisabled,
              ]}>
              Previous
            </Text>
          </TouchableOpacity>

          <View style={styles.recipientBadge}>
            <Icon name="person" size={16} color={Colors.primary} />
            <Text style={styles.recipientBadgeText} numberOfLines={1}>
              {currentRecipient.name || currentRecipient.email}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.navBtn,
              currentIndex === recipients.length - 1 && styles.navBtnDisabled,
            ]}
            onPress={() =>
              setCurrentIndex(prev =>
                Math.min(recipients.length - 1, prev + 1),
              )
            }
            disabled={currentIndex === recipients.length - 1}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.navBtnText,
                currentIndex === recipients.length - 1 &&
                  styles.navBtnTextDisabled,
              ]}>
              Next
            </Text>
            <Icon
              name="chevron-right"
              size={24}
              color={
                currentIndex === recipients.length - 1
                  ? Colors.textLight
                  : Colors.primary
              }
            />
          </TouchableOpacity>
        </View>

        {/* Email Preview Card */}
        <View style={styles.emailCard}>
          {/* To */}
          <View style={styles.emailField}>
            <Text style={styles.fieldLabel}>To:</Text>
            <Text style={styles.fieldValue}>{currentRecipient.email}</Text>
          </View>

          <View style={styles.divider} />

          {/* Subject */}
          <View style={styles.emailField}>
            <Text style={styles.fieldLabel}>Subject:</Text>
            <Text style={styles.subjectText}>{mergedSubject}</Text>
          </View>

          <View style={styles.divider} />

          {/* Body */}
          <View style={styles.bodySection}>
            <Text style={styles.bodyText}>{mergedBody}</Text>
          </View>
        </View>

        {/* Recipient Data */}
        <View style={styles.dataCard}>
          <Text style={styles.dataTitle}>Recipient Data</Text>
          {Object.entries(currentRecipient).map(([key, value]) => (
            <View key={key} style={styles.dataRow}>
              <Text style={styles.dataKey}>{key}</Text>
              <Text style={styles.dataValue}>{value || '-'}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Icon name="mail" size={20} color={Colors.primary} />
            <Text style={styles.summaryText}>
              {recipients.length} emails will be sent
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Icon name="description" size={20} color={Colors.primary} />
            <Text style={styles.summaryText}>
              Template: {template.name}
            </Text>
          </View>
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          activeOpacity={0.8}>
          <Icon name="send" size={22} color={Colors.white} />
          <Text style={styles.sendButtonText}>
            Send {recipients.length} Emails
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  navBtnTextDisabled: {
    color: Colors.textLight,
  },
  recipientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    maxWidth: 160,
  },
  recipientBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  emailCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emailField: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    width: 60,
  },
  fieldValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  subjectText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  bodySection: {
    padding: 16,
  },
  bodyText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  dataCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  dataTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dataKey: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dataValue: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
    textAlign: 'right',
  },
  summaryCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
});

export default PreviewScreen;
