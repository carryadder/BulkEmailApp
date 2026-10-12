import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {RootStackParamList, EmailTemplate} from '../types';
import {Colors} from '../utils/colors';
import {getTemplates, deleteTemplate} from '../utils/storage';
import {useAppContext} from '../context/AppContext';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TemplateList'>;
};

const TemplateListScreen: React.FC<Props> = ({navigation}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const {recipients} = useAppContext();

  useFocusEffect(
    useCallback(() => {
      loadTemplates();
    }, []),
  );

  const loadTemplates = async () => {
    const data = await getTemplates();
    setTemplates(data.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  };

  const handleDelete = (template: EmailTemplate) => {
    Alert.alert(
      'Delete Template',
      `Are you sure you want to delete "${template.name}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTemplate(template.id);
            loadTemplates();
          },
        },
      ],
    );
  };

  const handleUseTemplate = (template: EmailTemplate) => {
    if (recipients.length === 0) {
      Alert.alert(
        'No Recipients',
        'Please import an Excel file with recipients first.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Import Excel',
            onPress: () => navigation.navigate('ImportExcel'),
          },
        ],
      );
      return;
    }
    navigation.navigate('Preview', {
      templateId: template.id,
      recipients,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderTemplate = ({item}: {item: EmailTemplate}) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconContainer}>
          <Icon name="description" size={22} color={Colors.primary} />
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardDate}>
            Updated {formatDate(item.updatedAt)}
          </Text>
        </View>
      </View>

      <View style={styles.cardPreview}>
        <Text style={styles.previewLabel}>Subject:</Text>
        <Text style={styles.previewText} numberOfLines={1}>
          {item.subject}
        </Text>
      </View>

      <View style={styles.cardPreview}>
        <Text style={styles.previewLabel}>Body:</Text>
        <Text style={styles.previewText} numberOfLines={2}>
          {item.body}
        </Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            navigation.navigate('TemplateEditor', {templateId: item.id})
          }
          activeOpacity={0.7}>
          <Icon name="edit" size={18} color={Colors.primary} />
          <Text style={[styles.actionBtnText, {color: Colors.primary}]}>
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.useBtn]}
          onPress={() => handleUseTemplate(item)}
          activeOpacity={0.7}>
          <Icon name="send" size={18} color={Colors.white} />
          <Text style={[styles.actionBtnText, {color: Colors.white}]}>
            Use Template
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item)}
          activeOpacity={0.7}>
          <Icon name="delete-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        title="My Templates"
        subtitle={`${templates.length} template${templates.length !== 1 ? 's' : ''}`}
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: 'add',
          onPress: () => navigation.navigate('TemplateEditor', {}),
        }}
      />

      <FlatList
        data={templates}
        keyExtractor={item => item.id}
        renderItem={renderTemplate}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="description"
            title="No Templates Yet"
            message="Create your first email template to get started with bulk emailing."
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: Colors.background,
    flexGrow: 1,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  cardDate: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  cardPreview: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    width: 60,
  },
  previewText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    gap: 6,
  },
  useBtn: {
    backgroundColor: Colors.primary,
    flex: 1,
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.errorLight,
  },
});

export default TemplateListScreen;
