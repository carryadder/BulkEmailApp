import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList, EmailTemplate} from '../types';
import {Colors} from '../utils/colors';
import {getTemplateById, getSmtpConfig} from '../utils/storage';
import {sendBulkEmails, SendProgress, SendResult} from '../utils/emailService';
import Header from '../components/Header';

type Props = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'SendProgress'
  >;
  route: RouteProp<RootStackParamList, 'SendProgress'>;
};

const SendProgressScreen: React.FC<Props> = ({navigation, route}) => {
  const {templateId, recipients} = route.params;
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [progress, setProgress] = useState<SendProgress>({
    total: recipients.length,
    sent: 0,
    failed: 0,
    results: [],
  });
  const [isSending, setIsSending] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    const initSending = async () => {
      // Guard so a re-run of this effect never sends the batch twice
      if (startedRef.current) {
        return;
      }
      startedRef.current = true;

      const t = await getTemplateById(templateId);
      if (!t) {
        Alert.alert('Error', 'Template not found.', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
        return;
      }
      setTemplate(t);

      const smtpConfig = await getSmtpConfig();
      if (!smtpConfig) {
        Alert.alert(
          'SMTP Not Configured',
          'Please configure your SMTP settings first.',
          [
            {
              text: 'Configure',
              onPress: () => {
                navigation.goBack();
                navigation.navigate('SmtpSettings');
              },
            },
          ],
        );
        return;
      }

      setIsSending(true);
      const result = await sendBulkEmails(
        t,
        recipients,
        smtpConfig,
        (p: SendProgress) => {
          setProgress({...p, results: [...p.results]});
        },
      );
      setIsSending(false);
      setIsComplete(true);
      setProgress(result);
    };
    initSending();
  }, [templateId, recipients, navigation]);

  const percentage =
    progress.total > 0
      ? Math.round(((progress.sent + progress.failed) / progress.total) * 100)
      : 0;

  const renderResultItem = ({item}: {item: SendResult}) => (
    <View style={styles.resultRow}>
      <View
        style={[
          styles.resultIcon,
          item.success ? styles.resultSuccess : styles.resultFailed,
        ]}>
        <Icon
          name={item.success ? 'check' : 'close'}
          size={16}
          color={Colors.white}
        />
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultEmail} numberOfLines={1}>
          {item.recipient.email}
        </Text>
        {item.recipient.name && (
          <Text style={styles.resultName}>{item.recipient.name}</Text>
        )}
        {item.error && <Text style={styles.resultError}>{item.error}</Text>}
      </View>
      <Text
        style={[
          styles.resultStatus,
          item.success ? styles.statusSent : styles.statusFailed,
        ]}>
        {item.success ? 'Sent' : 'Failed'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        title="Sending Emails"
        subtitle={template?.name || ''}
        onBack={
          isComplete || !isSending ? () => navigation.popToTop() : undefined
        }
      />

      <View style={styles.container}>
        {/* Progress Section */}
        <View style={styles.progressCard}>
          {/* Circular Progress */}
          <View style={styles.circleContainer}>
            <View
              style={[
                styles.circle,
                isComplete && progress.failed === 0 && styles.circleComplete,
                isComplete && progress.failed > 0 && styles.circlePartial,
              ]}>
              <Text style={styles.circlePercentage}>{percentage}%</Text>
              <Text style={styles.circleLabel}>
                {isComplete ? 'Complete' : 'Sending...'}
              </Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <View
                style={[styles.statDot, {backgroundColor: Colors.primary}]}
              />
              <Text style={styles.statValue}>{progress.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.stat}>
              <View
                style={[styles.statDot, {backgroundColor: Colors.success}]}
              />
              <Text style={styles.statValue}>{progress.sent}</Text>
              <Text style={styles.statLabel}>Sent</Text>
            </View>
            <View style={styles.stat}>
              <View
                style={[styles.statDot, {backgroundColor: Colors.error}]}
              />
              <Text style={styles.statValue}>{progress.failed}</Text>
              <Text style={styles.statLabel}>Failed</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarSent,
                {width: `${(progress.sent / Math.max(progress.total, 1)) * 100}%`},
              ]}
            />
            <View
              style={[
                styles.progressBarFailed,
                {
                  width: `${(progress.failed / Math.max(progress.total, 1)) * 100}%`,
                  left: `${(progress.sent / Math.max(progress.total, 1)) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Results List */}
        {progress.results.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>Results</Text>
            <FlatList
              data={progress.results}
              keyExtractor={(_, index) => index.toString()}
              renderItem={renderResultItem}
              style={styles.resultsList}
              contentContainerStyle={styles.resultsContent}
            />
          </View>
        )}

        {/* Done Button */}
        {isComplete && (
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => navigation.popToTop()}
            activeOpacity={0.8}>
            <Icon name="home" size={20} color={Colors.white} />
            <Text style={styles.doneButtonText}>Back to Home</Text>
          </TouchableOpacity>
        )}
      </View>
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
    padding: 16,
  },
  progressCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  circleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleComplete: {
    borderColor: Colors.success,
  },
  circlePartial: {
    borderColor: Colors.warning,
  },
  circlePercentage: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
  },
  circleLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarSent: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 8,
    backgroundColor: Colors.success,
    borderRadius: 4,
  },
  progressBarFailed: {
    position: 'absolute',
    top: 0,
    height: 8,
    backgroundColor: Colors.error,
  },
  resultsSection: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  resultsList: {
    flex: 1,
  },
  resultsContent: {
    paddingBottom: 8,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
  },
  resultIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultSuccess: {
    backgroundColor: Colors.success,
  },
  resultFailed: {
    backgroundColor: Colors.error,
  },
  resultContent: {
    flex: 1,
  },
  resultEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  resultName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  resultError: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 2,
  },
  resultStatus: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  statusSent: {
    color: Colors.success,
  },
  statusFailed: {
    color: Colors.error,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 12,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});

export default SendProgressScreen;
