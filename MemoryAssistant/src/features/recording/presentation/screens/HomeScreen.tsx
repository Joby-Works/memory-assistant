import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface HomeScreenProps {
  onStartRecording: () => void;
  onGoToReview: () => void;
  onOpenSettings: () => void;
  pendingReviewCount: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartRecording,
  onGoToReview,
  onOpenSettings,
  pendingReviewCount,
}) => {
  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dateText}>
          {dayNames[today.getDay()]}, {monthNames[today.getMonth()]} {today.getDate()}
        </Text>
        <TouchableOpacity onPress={onOpenSettings}>
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.greeting}>
          Did anyone share something today that you should remember?
        </Text>

        <View style={styles.recordButtonContainer}>
          <TouchableOpacity 
            style={styles.recordButton}
            onPress={onStartRecording}
          >
            <View style={styles.recordButtonInner}>
              <View style={styles.micIcon} />
            </View>
          </TouchableOpacity>
          <Text style={styles.recordHint}>Tap to record</Text>
        </View>

        {pendingReviewCount > 0 && (
          <TouchableOpacity 
            style={styles.reviewBanner}
            onPress={onGoToReview}
          >
            <Text style={styles.reviewBannerText}>
              {pendingReviewCount} {pendingReviewCount === 1 ? 'memory' : 'memories'} to review
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          All data stays on your device
        </Text>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
  },
  dateText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
  },
  settingsIcon: {
    color: '#a0a0b0',
    fontSize: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  greeting: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 36,
  },
  recordButtonContainer: {
    alignItems: 'center',
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4a90d9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4a90d9',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3a80c9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: {
    width: 24,
    height: 36,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  recordHint: {
    color: '#707080',
    fontSize: 14,
  },
  reviewBanner: {
    position: 'absolute',
    bottom: 24,
    backgroundColor: '#2a2a3e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  reviewBannerText: {
    color: '#4a90d9',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#505060',
    fontSize: 12,
  },
});
