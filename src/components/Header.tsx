import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import NotificationModal, { DefectNotification } from './NotificationModal';

interface HeaderProps {
  userName?: string;
  onLogout?: () => void;
  onNotificationPress?: () => void;
  hasNotifications?: boolean;
  defects?: DefectNotification[];
}

const defaultAvatar = require('../../assert/photo.jpeg');

const Header: React.FC<HeaderProps> = ({ 
  userName = 'Zayal', 
  onLogout, 
  onNotificationPress,
  hasNotifications = true,
  defects = []
}) => {
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      setNotificationModalVisible(true);
    }
  };

  const closeNotificationModal = () => {
    setNotificationModalVisible(false);
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.row}>
        <Image source={defaultAvatar} style={styles.profileImage} />
        <View style={styles.textSection}>
          <Text style={styles.greeting}>Hello Zayal</Text>
          <Text style={styles.subtitle}>Track Your Next Defect</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton} onPress={handleNotificationPress}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path
              d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
              stroke="#03084a"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M13.73 21a2 2 0 0 1-3.46 0"
              stroke="#03084a"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          {(hasNotifications || defects.length > 0) && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path
              d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
              stroke="#03084a"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M16 17l5-5-5-5"
              stroke="#03084a"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M21 12H9"
              stroke="#03084a"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>
      
      {/* Notification Modal */}
      <NotificationModal
        visible={notificationModalVisible}
        onClose={closeNotificationModal}
        defects={defects}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor:    'rgba(255, 255, 255, 1)' 



    ,
    paddingTop: 18,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0,
    // No borderRadius, no shadow, no elevation
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: '#eee',
    borderWidth: 2,
    borderColor: '#03084a',
  },
  textSection: {
    flex: 1,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 18,
    color: '#03084a',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
    textAlign: 'left',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    color: '#03084a',
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
    textAlign: 'left',
  },
  notificationButton: {
    borderWidth: 1,
    borderColor: '#03084a',
    borderRadius: 16,
    padding: 8,
    marginRight: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff4444',
    borderWidth: 1,
    borderColor: 'white',
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#03084a',
    borderRadius: 16,
    padding: 8,
    marginLeft: 6,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Header;
