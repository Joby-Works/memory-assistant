import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { WhisperModelSize, formatBytes } from '../../data/whisperModels';

interface ModelDownloadIndicatorProps {
  modelSize: WhisperModelSize;
  progress: number;
  onCancel?: () => void;
}

const MODEL_DISPLAY_NAMES: Record<WhisperModelSize, string> = {
  tiny: 'Tiny',
  base: 'Base',
  small: 'Small',
  medium: 'Medium',
};

const MODEL_SIZES: Record<WhisperModelSize, number> = {
  tiny: 75_000_000,
  base: 148_000_000,
  small: 466_000_000,
  medium: 1_500_000_000,
};

export const ModelDownloadIndicator: React.FC<ModelDownloadIndicatorProps> = ({
  modelSize,
  progress,
  onCancel,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const displayName = MODEL_DISPLAY_NAMES[modelSize];
  const sizeStr = formatBytes(MODEL_SIZES[modelSize]);
  const progressPercent = Math.round(progress);

  const handlePress = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCancelPress = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    setIsExpanded(false);
    onCancel?.();
  };

  const renderCollapsed = () => {
    return (
      <TouchableOpacity
        style={styles.collapsedContainer}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.circleBackground}>
          <Text style={styles.progressText}>{progressPercent}%</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderExpanded = () => {
    return (
      <TouchableOpacity
        style={styles.expandedContainer}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.expandedContent}>
          <View style={styles.expandedHeader}>
            <Text style={styles.expandedTitle}>Downloading</Text>
            <Text style={styles.expandTapHint}>Tap to minimize</Text>
          </View>
          <View style={styles.expandedDetails}>
            <Text style={styles.modelName}>{displayName}</Text>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBar, { width: `${progressPercent}%` }]}
            />
          </View>
          <Text style={styles.downloadSize}>{sizeStr}</Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelPress}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {isExpanded ? renderExpanded() : renderCollapsed()}

      <Modal
        visible={showCancelConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancel Download?</Text>
            <Text style={styles.modalMessage}>
              The {displayName} model download will be stopped.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowCancelConfirm(false)}
              >
                <Text style={styles.modalButtonText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDestructive]}
                onPress={confirmCancel}
              >
                <Text style={styles.modalButtonTextDestructive}>
                  Cancel Download
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  collapsedContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1000,
  },
  circleBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a3e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4a90d9',
  },
  progressText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  expandedContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1000,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  expandedContent: {},
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  expandedTitle: {
    color: '#a0a0b0',
    fontSize: 12,
    fontWeight: '500',
  },
  expandTapHint: {
    color: '#505060',
    fontSize: 10,
  },
  expandedDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modelName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressPercent: {
    color: '#4a90d9',
    fontSize: 16,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#1a1a2e',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4a90d9',
    borderRadius: 2,
  },
  downloadSize: {
    color: '#707080',
    fontSize: 12,
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: '#3a2a2a',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    color: '#a0a0b0',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtons: {
    gap: 12,
  },
  modalButton: {
    backgroundColor: '#4a90d9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonDestructive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#f87171',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextDestructive: {
    color: '#f87171',
    fontSize: 16,
    fontWeight: '600',
  },
});
