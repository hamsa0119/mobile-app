import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';

export interface DefectNotification {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  status: 'open' | 'closed' | 'fixed' | 'reopened';
  module: string;
  assignedTo: string;
  createdAt: string;
}

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  defects: DefectNotification[];
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  defects,
}) => {
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'high':
        return '#e53935';
      case 'medium':
        return '#fbbf24';
      case 'low':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'open':
        return '#2563eb';
      case 'closed':
        return '#22c55e';
      case 'fixed':
        return '#059669';
      case 'reopened':
        return '#e53935';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Defect Notifications ({defects.length})
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Defects List */}
          <ScrollView style={styles.defectsList}>
            {defects.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No defect notifications</Text>
                <Text style={styles.emptyStateSubtext}>
                  You're all caught up! No new defects to review.
                </Text>
              </View>
            ) : (
              defects.map((defect) => (
                <View key={defect.id} style={styles.defectItem}>
                  <View style={styles.defectHeader}>
                    <Text style={styles.defectTitle} numberOfLines={2}>
                      {defect.title}
                    </Text>
                    <View style={styles.defectBadges}>
                      <View
                        style={[
                          styles.severityBadge,
                          { backgroundColor: getSeverityColor(defect.severity) },
                        ]}
                      >
                        <Text style={styles.badgeText}>
                          {defect.severity.toUpperCase()}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(defect.status) },
                        ]}
                      >
                        <Text style={styles.badgeText}>
                          {defect.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.defectDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Module:</Text>
                      <Text style={styles.detailValue}>{defect.module}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Assigned to:</Text>
                      <Text style={styles.detailValue}>{defect.assignedTo}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Created:</Text>
                      <Text style={styles.detailValue}>{formatDate(defect.createdAt)}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '85%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#03084a',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  defectsList: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 6,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  defectItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  defectHeader: {
    marginBottom: 8,
  },
  defectTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#03084a',
    marginBottom: 6,
    lineHeight: 18,
  },
  defectBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
  },
  defectDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: '#03084a',
    fontWeight: '600',
  },
});

export default NotificationModal; 