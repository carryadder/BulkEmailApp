import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  pick,
  keepLocalCopy,
  types,
  errorCodes,
  isErrorWithCode,
} from '@react-native-documents/picker';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList, Recipient} from '../types';
import {Colors} from '../utils/colors';
import {parseExcelFile} from '../utils/excelParser';
import {useAppContext} from '../context/AppContext';
import Header from '../components/Header';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ImportExcel'>;
};

const ImportExcelScreen: React.FC<Props> = ({navigation}) => {
  const {setRecipients, setColumns, recipients} = useAppContext();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [localRecipients, setLocalRecipients] = useState<Recipient[]>([]);
  const [localColumns, setLocalColumns] = useState<string[]>([]);

  const handlePickFile = async () => {
    try {
      const [result] = await pick({
        type: [types.xlsx, types.xls],
      });

      if (!result) {
        return;
      }

      setLoading(true);
      const name = result.name || 'spreadsheet.xlsx';
      setFileName(name);

      // Copy the picked content:// uri into app storage so RNFS can read it
      const [copy] = await keepLocalCopy({
        files: [{uri: result.uri, fileName: name}],
        destination: 'cachesDirectory',
      });
      if (copy.status !== 'success') {
        throw new Error(copy.copyError);
      }

      const parsed = await parseExcelFile(copy.localUri);
      setLocalRecipients(parsed.recipients);
      setLocalColumns(parsed.columns);
      setLoading(false);

      Alert.alert(
        'File Imported',
        `Found ${parsed.recipients.length} valid recipients with ${parsed.columns.length} columns.`,
      );
    } catch (error) {
      setLoading(false);
      if (
        isErrorWithCode(error) &&
        error.code === errorCodes.OPERATION_CANCELED
      ) {
        return;
      }
      Alert.alert(
        'Import Failed',
        error instanceof Error ? error.message : 'Failed to parse the file.',
      );
    }
  };

  const handleConfirm = () => {
    if (localRecipients.length === 0) {
      Alert.alert('No Data', 'Please import an Excel file first.');
      return;
    }
    setRecipients(localRecipients);
    setColumns(localColumns);
    Alert.alert(
      'Recipients Loaded',
      `${localRecipients.length} recipients are ready. You can now select a template and send emails.`,
      [{text: 'OK', onPress: () => navigation.goBack()}],
    );
  };

  const renderRecipientRow = ({
    item,
    index,
  }: {
    item: Recipient;
    index: number;
  }) => (
    <View style={styles.row}>
      <View style={styles.rowIndex}>
        <Text style={styles.rowIndexText}>{index + 1}</Text>
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowEmail} numberOfLines={1}>
          {item.email}
        </Text>
        {item.name && (
          <Text style={styles.rowName} numberOfLines={1}>
            {item.name}
          </Text>
        )}
        {Object.keys(item)
          .filter(k => k !== 'email' && k !== 'name')
          .slice(0, 2)
          .map(key => (
            <Text key={key} style={styles.rowExtra} numberOfLines={1}>
              {key}: {item[key]}
            </Text>
          ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        title="Import Recipients"
        subtitle="Upload an Excel file"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.container}>
        {/* File Picker Area */}
        <TouchableOpacity
          style={styles.dropZone}
          onPress={handlePickFile}
          activeOpacity={0.7}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : (
            <>
              <View style={styles.uploadIconCircle}>
                <Icon name="cloud-upload" size={36} color={Colors.primary} />
              </View>
              <Text style={styles.dropTitle}>
                {fileName ? fileName : 'Select Excel File'}
              </Text>
              <Text style={styles.dropSubtitle}>
                Tap to browse for .xlsx or .xls files
              </Text>
              <View style={styles.browseBtn}>
                <Text style={styles.browseBtnText}>Browse Files</Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Column Info */}
        {localColumns.length > 0 && (
          <View style={styles.columnsCard}>
            <Text style={styles.columnsTitle}>Detected Columns</Text>
            <View style={styles.chipRow}>
              {localColumns.map(col => (
                <View
                  key={col}
                  style={[
                    styles.chip,
                    col.toLowerCase().includes('email') && styles.chipHighlight,
                  ]}>
                  <Text
                    style={[
                      styles.chipText,
                      col.toLowerCase().includes('email') &&
                        styles.chipTextHighlight,
                    ]}>
                    {col}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recipients Preview */}
        {localRecipients.length > 0 && (
          <>
            <View style={styles.recipientsHeader}>
              <Text style={styles.recipientsTitle}>
                Recipients ({localRecipients.length})
              </Text>
            </View>
            <FlatList
              data={localRecipients}
              keyExtractor={(_, index) => index.toString()}
              renderItem={renderRecipientRow}
              style={styles.list}
              contentContainerStyle={styles.listContent}
            />
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}>
              <Icon name="check-circle" size={20} color={Colors.white} />
              <Text style={styles.confirmButtonText}>
                Use {localRecipients.length} Recipients
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Already loaded indicator */}
        {recipients.length > 0 && localRecipients.length === 0 && (
          <View style={styles.alreadyLoaded}>
            <Icon name="check-circle" size={20} color={Colors.secondary} />
            <Text style={styles.alreadyLoadedText}>
              {recipients.length} recipients currently loaded
            </Text>
          </View>
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
  dropZone: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  uploadIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dropTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  dropSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  browseBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  browseBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  columnsCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  columnsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipHighlight: {
    backgroundColor: Colors.secondaryLight,
    borderColor: Colors.secondary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextHighlight: {
    color: Colors.secondary,
  },
  recipientsHeader: {
    marginBottom: 8,
  },
  recipientsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  rowIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowIndexText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  rowContent: {
    flex: 1,
  },
  rowEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  rowName: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rowExtra: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 1,
  },
  confirmButton: {
    backgroundColor: Colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 12,
    shadowColor: Colors.secondary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  alreadyLoaded: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  alreadyLoadedText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
  },
});

export default ImportExcelScreen;
