import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface WelcomeScreenProps {
  onNext: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({onNext}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Memory Assistant</Text>
        <Text style={styles.subtitle}>
          Capture the moments that matter before you forget
        </Text>
        <Text style={styles.description}>
          A privacy-first voice memory that helps you remember important dates
          and moments from your conversations.
        </Text>
        <Text style={styles.description}>
          All your data stays on your device. Nothing goes to the cloud.
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

interface CalendarPermissionScreenProps {
  onNext: () => void;
  onRequestPermission: () => Promise<boolean>;
}

export const CalendarPermissionScreen: React.FC<CalendarPermissionScreenProps> = ({
  onNext,
  onRequestPermission,
}) => {
  const [granted, setGranted] = useState(false);

  const handleRequestPermission = async () => {
    const result = await onRequestPermission();
    setGranted(result);
    if (result) {
      onNext();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Calendar Access</Text>
        <Text style={styles.description}>
          To save important dates to your calendar, we need permission to
          access it.
        </Text>
        <Text style={styles.description}>
          Your calendar data stays on your device and is never shared.
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleRequestPermission}>
        <Text style={styles.buttonText}>
          {granted ? 'Granted ✓' : 'Allow Calendar Access'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

interface ReminderTimeScreenProps {
  onNext: () => void;
  onSaveTime: (time: string) => void;
  initialTime?: string;
}

export const ReminderTimeScreen: React.FC<ReminderTimeScreenProps> = ({
  onNext,
  onSaveTime,
  initialTime = '22:00',
}) => {
  const [time, setTime] = useState(() => {
    const [hours, minutes] = initialTime.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date;
  });

  const handleTimeChange = (_event: any, selectedTime?: Date) => {
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const handleConfirm = () => {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    onSaveTime(`${hours}:${minutes}`);
    onNext();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Daily Reminder</Text>
        <Text style={styles.description}>
          When would you like to be reminded to reflect on your day?
        </Text>
        <Text style={styles.subdescription}>
          Most people prefer evening times when they can relax and think back
          on their day.
        </Text>
        <View style={styles.timePickerContainer}>
          <DateTimePicker
            value={time}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
            style={styles.timePicker}
          />
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleConfirm}>
        <Text style={styles.buttonText}>Set Reminder</Text>
      </TouchableOpacity>
    </View>
  );
};

interface ReviewTimeScreenProps {
  onComplete: () => void;
  onSaveTime: (time: string) => void;
  initialTime?: string;
}

export const ReviewTimeScreen: React.FC<ReviewTimeScreenProps> = ({
  onComplete,
  onSaveTime,
  initialTime = '09:00',
}) => {
  const [time, setTime] = useState(() => {
    const [hours, minutes] = initialTime.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date;
  });

  const handleTimeChange = (_event: any, selectedTime?: Date) => {
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const handleConfirm = () => {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    onSaveTime(`${hours}:${minutes}`);
    onComplete();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Review Time</Text>
        <Text style={styles.description}>
          When would you like to review memories you've deferred?
        </Text>
        <Text style={styles.subdescription}>
          A morning time works well when your mind is fresh.
        </Text>
        <View style={styles.timePickerContainer}>
          <DateTimePicker
            value={time}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
            style={styles.timePicker}
          />
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleConfirm}>
        <Text style={styles.buttonText}>Set Review Time</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#a0a0b0',
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#a0a0b0',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  subdescription: {
    fontSize: 14,
    color: '#707080',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#4a90d9',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  timePickerContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  timePicker: {
    width: 200,
    height: 150,
  },
});
