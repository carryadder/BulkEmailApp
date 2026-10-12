import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types';
import {Colors} from '../utils/colors';
import {useAppContext} from '../context/AppContext';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

interface ActionCardProps {
  icon: string;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  onPress: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  title,
  description,
  color,
  bgColor,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.actionCard}
    onPress={onPress}
    activeOpacity={0.7}>
    <View style={[styles.actionIcon, {backgroundColor: bgColor}]}>
      <Icon name={icon} size={28} color={color} />
    </View>
    <View style={styles.actionContent}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionDesc}>{description}</Text>
    </View>
    <Icon name="chevron-right" size={24} color={Colors.textLight} />
  </TouchableOpacity>
);

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const {recipients} = useAppContext();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroIconContainer}>
            <Icon name="email" size={40} color={Colors.white} />
          </View>
          <Text style={styles.heroTitle}>Bulk Email Sender</Text>
          <Text style={styles.heroSubtitle}>
            Create templates, import recipients from Excel, and send
            personalized bulk emails effortlessly.
          </Text>
        </View>

        {/* Status Cards */}
        {recipients.length > 0 && (
          <View style={styles.statusCard}>
            <Icon name="people" size={20} color={Colors.secondary} />
            <Text style={styles.statusText}>
              {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}{' '}
              loaded
            </Text>
          </View>
        )}

        {/* Action Cards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Get Started</Text>
        </View>

        <ActionCard
          icon="description"
          title="Create Template"
          description="Write an email template with placeholders"
          color={Colors.primary}
          bgColor={Colors.primaryLight}
          onPress={() => navigation.navigate('TemplateEditor', {})}
        />

        <ActionCard
          icon="folder-open"
          title="My Templates"
          description="View and manage your saved templates"
          color="#9333EA"
          bgColor="#F3E8FF"
          onPress={() => navigation.navigate('TemplateList')}
        />

        <ActionCard
          icon="upload-file"
          title="Import Excel"
          description="Upload recipients from .xlsx or .xls file"
          color={Colors.secondary}
          bgColor={Colors.secondaryLight}
          onPress={() => navigation.navigate('ImportExcel')}
        />

        <ActionCard
          icon="settings"
          title="SMTP Settings"
          description="Configure your email server connection"
          color={Colors.warning}
          bgColor={Colors.warningLight}
          onPress={() => navigation.navigate('SmtpSettings')}
        />

        {/* Quick Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works</Text>
          <View style={styles.infoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Create an email template with {'{{placeholders}}'}
            </Text>
          </View>
          <View style={styles.infoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              Import an Excel file with recipient data
            </Text>
          </View>
          <View style={styles.infoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Preview merged emails and send in bulk
            </Text>
          </View>
        </View>
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
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 36,
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondaryLight,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 0.3,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 3,
  },
  actionDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  infoSection: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 20,
    borderRadius: 14,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  stepText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
});

export default HomeScreen;
