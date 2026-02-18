import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  WhisperModelSize,
  WHISPER_MODELS,
  formatBytes,
} from '@features/transcription/data/whisperModels';
import { useModelDownloadService } from '@features/transcription/presentation/useModelDownloadService';

interface SettingsScreenProps {
  reminderTime: string;
  reviewTime: string;
  whisperModel: WhisperModelSize;
  onBack: () => void;
  onUpdateReminderTime: (time: string) => void;
  onUpdateReviewTime: (time: string) => void;
  onUpdateWhisperModel: (model: WhisperModelSize) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  reminderTime,
  reviewTime,
  whisperModel,
  onBack,
  onUpdateReminderTime,
  onUpdateReviewTime,
  onUpdateWhisperModel,
}) => {
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showReviewPicker, setShowReviewPicker] = useState(false);
  const [downloadedModels, setDownloadedModels] = useState<WhisperModelSize[]>(
    [],
  );
  const [downloadingModel, setDownloadingModel] =
    useState<WhisperModelSize | null>(null);
  const modelDownloadService = useModelDownloadService();

  useEffect(() => {
    loadDownloadedModels();
  }, []);

  const loadDownloadedModels = async () => {
    const downloaded = await modelDownloadService.getDownloadedModels();
    setDownloadedModels(downloaded);
  };

  const parseTime = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date;
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleReminderTimeChange = (_event: unknown, selectedDate?: Date) => {
    setShowReminderPicker(Platform.OS === 'ios');
    if (selectedDate) {
      onUpdateReminderTime(formatTime(selectedDate));
    }
  };

  const handleReviewTimeChange = (_event: unknown, selectedDate?: Date) => {
    setShowReviewPicker(Platform.OS === 'ios');
    if (selectedDate) {
      onUpdateReviewTime(formatTime(selectedDate));
    }
  };

  const handleModelSelect = async (modelSize: WhisperModelSize) => {
    if (modelSize === whisperModel) return;

    const isDownloaded = downloadedModels.includes(modelSize);

    if (!isDownloaded) {
      const model = WHISPER_MODELS.find(m => m.size === modelSize);
      const sizeStr = model ? formatBytes(model.bytes) : '';

      Alert.alert(
        'Download Model?',
        `The "${model?.name}" model (~${sizeStr}) needs to be downloaded first. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            onPress: () => downloadAndSelectModel(modelSize),
          },
        ],
      );
      return;
    }

    onUpdateWhisperModel(modelSize);
  };

  const downloadAndSelectModel = async (modelSize: WhisperModelSize) => {
    setDownloadingModel(modelSize);
    try {
      const success = await modelDownloadService.downloadModel(modelSize);
      if (success) {
        setDownloadedModels(prev => [...prev, modelSize]);
        onUpdateWhisperModel(modelSize);
      }
    } catch (_error) {
      Alert.alert(
        'Download Failed',
        'Could not download the model. Please try again.',
      );
    } finally {
      setDownloadingModel(null);
    }
  };

  const isModelDownloaded = (modelSize: WhisperModelSize) => {
    return downloadedModels.includes(modelSize);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowReminderPicker(true)}
          >
            <View>
              <Text style={styles.settingLabel}>Daily Reminder</Text>
              <Text style={styles.settingDescription}>
                When to reflect on your day
              </Text>
            </View>
            <Text style={styles.settingValue}>{reminderTime}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowReviewPicker(true)}
          >
            <View>
              <Text style={styles.settingLabel}>Review Reminder</Text>
              <Text style={styles.settingDescription}>
                When to review deferred memories
              </Text>
            </View>
            <Text style={styles.settingValue}>{reviewTime}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transcription</Text>

          <Text style={styles.modelSectionDescription}>
            Choose the AI model for transcription. Larger models are more
            accurate but use more storage.
          </Text>

          {WHISPER_MODELS.map(model => {
            const isSelected = whisperModel === model.size;
            const isDownloaded = isModelDownloaded(model.size);
            const isDownloading = downloadingModel === model.size;

            return (
              <TouchableOpacity
                key={model.size}
                style={[styles.modelRow, isSelected && styles.modelRowSelected]}
                onPress={() => handleModelSelect(model.size)}
                disabled={isDownloading}
              >
                <View style={styles.modelInfo}>
                  <View style={styles.modelHeader}>
                    <Text
                      style={[
                        styles.modelName,
                        isSelected && styles.modelNameSelected,
                      ]}
                    >
                      {model.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>Active</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.modelDescription}>
                    {model.description}
                  </Text>
                  <Text style={styles.modelSize}>
                    {formatBytes(model.bytes)}
                  </Text>
                </View>

                <View style={styles.modelStatus}>
                  {isDownloading ? (
                    <Text style={styles.downloadingText}>Downloading...</Text>
                  ) : isDownloaded ? (
                    <Text style={styles.downloadedText}>Downloaded</Text>
                  ) : (
                    <Text style={styles.notDownloadedText}>Not downloaded</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data Storage</Text>
            <Text style={styles.infoValue}>On device only</Text>
          </View>
          <Text style={styles.privacyNote}>
            All your recordings, transcripts, and calendar events are stored
            locally on your device. Nothing is sent to the cloud.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>

      {showReminderPicker && (
        <DateTimePicker
          value={parseTime(reminderTime)}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleReminderTimeChange}
        />
      )}

      {showReviewPicker && (
        <DateTimePicker
          value={parseTime(reviewTime)}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleReviewTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
  },
  backText: {
    color: '#4a90d9',
    fontSize: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#707080',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  settingRow: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    color: '#707080',
    fontSize: 13,
  },
  settingValue: {
    color: '#4a90d9',
    fontSize: 16,
    fontWeight: '500',
  },
  modelSectionDescription: {
    color: '#707080',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  modelRow: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modelRowSelected: {
    borderColor: '#4a90d9',
  },
  modelInfo: {
    marginBottom: 8,
  },
  modelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  modelName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modelNameSelected: {
    color: '#4a90d9',
  },
  selectedBadge: {
    backgroundColor: '#4a90d9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  selectedBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  modelDescription: {
    color: '#707080',
    fontSize: 13,
  },
  modelSize: {
    color: '#505060',
    fontSize: 12,
    marginTop: 4,
  },
  modelStatus: {
    borderTopWidth: 1,
    borderTopColor: '#3a3a4e',
    paddingTop: 8,
  },
  downloadedText: {
    color: '#4ade80',
    fontSize: 12,
  },
  downloadingText: {
    color: '#f59e0b',
    fontSize: 12,
  },
  notDownloadedText: {
    color: '#505060',
    fontSize: 12,
  },
  infoRow: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#ffffff',
    fontSize: 16,
  },
  infoValue: {
    color: '#a0a0b0',
    fontSize: 16,
  },
  privacyNote: {
    color: '#707080',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
});
