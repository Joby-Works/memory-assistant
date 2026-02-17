import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface SettingsScreenProps {
  reminderTime: string;
  reviewTime: string;
  onBack: () => void;
  onUpdateReminderTime: (time: string) => void;
  onUpdateReviewTime: (time: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  reminderTime,
  reviewTime,
  onBack,
  onUpdateReminderTime,
  onUpdateReviewTime,
}) => {
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showReviewPicker, setShowReviewPicker] = useState(false);

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

  const handleReminderTimeChange = (_event: any, selectedDate?: Date) => {
    setShowReminderPicker(Platform.OS === 'ios');
    if (selectedDate) {
      onUpdateReminderTime(formatTime(selectedDate));
    }
  };

  const handleReviewTimeChange = (_event: any, selectedDate?: Date) => {
    setShowReviewPicker(Platform.OS === 'ios');
    if (selectedDate) {
      onUpdateReviewTime(formatTime(selectedDate));
    }
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
