// EcoScan React Native App
// Complete implementation ready for Expo

// ============================================
// SETUP INSTRUCTIONS
// ============================================
// 1. Install Expo CLI: npm install -g expo-cli
// 2. Create new project: npx create-expo-app EcoScan
// 3. Install dependencies:
//    npm install @react-navigation/native @react-navigation/bottom-tabs
//    npm install react-native-screens react-native-safe-area-context
//    npm install expo-camera expo-image-picker
//    npm install firebase
//    npm install @tensorflow/tfjs @tensorflow/tfjs-react-native
//    npm install expo-gl expo-gl-cpp
//    npx expo install expo-font @expo/vector-icons
// 4. Replace App.js with this code
// 5. Run: npx expo start

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

// Icons (you can replace with react-native-vector-icons)
const HomeIcon = ({ focused }) => <Text style={{ fontSize: 24 }}>{focused ? '🏠' : '🏡'}</Text>;
const ScanIcon = ({ focused }) => <Text style={{ fontSize: 24 }}>{focused ? '📸' : '📷'}</Text>;
const SocialIcon = ({ focused }) => <Text style={{ fontSize: 24 }}>{focused ? '👥' : '👤'}</Text>;
const ProfileIcon = ({ focused }) => <Text style={{ fontSize: 24 }}>{focused ? '⭐' : '✨'}</Text>;

const { width, height } = Dimensions.get('window');

// ============================================
// FIREBASE CONFIGURATION
// ============================================
// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase (uncomment when you add your config)
// import { initializeApp } from 'firebase/app';
// import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
// import { getFirestore, collection, addDoc, query, getDocs } from 'firebase/firestore';
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);

// ============================================
// MOCK DATA & ITEM DATABASE
// ============================================
const itemDatabase = {
  'plastic_bottle': { name: 'Plastic Bottle', points: 10, category: 'Recyclable', emoji: '🍾' },
  'aluminum_can': { name: 'Aluminum Can', points: 8, category: 'Recyclable', emoji: '🥫' },
  'glass_bottle': { name: 'Glass Bottle', points: 12, category: 'Recyclable', emoji: '🍷' },
  'paper': { name: 'Paper', points: 5, category: 'Recyclable', emoji: '📄' },
  'cardboard': { name: 'Cardboard Box', points: 7, category: 'Recyclable', emoji: '📦' },
  'food_waste': { name: 'Food Waste', points: 6, category: 'Compostable', emoji: '🍎' }
};

const mockFriends = [
  { id: 1, name: 'Sarah Chen', points: 1250, avatar: '🌟' },
  { id: 2, name: 'Mike Johnson', points: 980, avatar: '🌊' },
  { id: 3, name: 'Emma Davis', points: 1400, avatar: '🌱' }
];

const mockEvents = [
  { id: 1, title: 'Beach Cleanup', date: 'Nov 15', location: 'Santa Monica', attendees: 24 },
  { id: 2, title: 'Recycling Workshop', date: 'Nov 20', location: 'Community Center', attendees: 15 },
  { id: 3, title: 'Tree Planting', date: 'Nov 25', location: 'Central Park', attendees: 42 }
];

const mockPosts = [
  { id: 1, user: 'Sarah Chen', avatar: '🌟', action: 'recycled 5 plastic bottles', points: 50, time: '2h ago', likes: 12 },
  { id: 2, user: 'Mike Johnson', avatar: '🌊', action: 'attended Beach Cleanup', points: 100, time: '5h ago', likes: 28 },
  { id: 3, user: 'Emma Davis', avatar: '🌱', action: 'composted food waste', points: 30, time: '1d ago', likes: 15 }
];

// ============================================
// LOGIN SCREEN
// ============================================
const LoginScreen = ({ navigation, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Mock login - replace with real Firebase auth
    // try {
    //   setLoading(true);
    //   const userCredential = await signInWithEmailAndPassword(auth, email, password);
    //   setUser(userCredential.user);
    // } catch (error) {
    //   Alert.alert('Login Error', error.message);
    // } finally {
    //   setLoading(false);
    // }

    // Mock implementation
    setLoading(true);
    setTimeout(() => {
      setUser({
        name: 'Alex Green',
        email: email,
        points: 450,
        itemsRecycled: 89,
        avatar: '♻️'
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <View style={styles.loginContainer}>
      <View style={styles.loginCard}>
        <Text style={styles.loginEmoji}>♻️</Text>
        <Text style={styles.loginTitle}>EcoScan</Text>
        <Text style={styles.loginSubtitle}>Scan. Recycle. Connect.</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.signupButton}>
          <Text style={styles.signupButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================
// HOME SCREEN
// ============================================
const HomeScreen = ({ user, setUser }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome back, {user.name}!</Text>
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Your Impact</Text>
            <Text style={styles.statsEmoji}>🏆</Text>
          </View>
          <Text style={styles.statsPoints}>{user.points} points</Text>
          <Text style={styles.statsItems}>{user.itemsRecycled} items recycled</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {mockPosts.map(post => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <Text style={styles.postAvatar}>{post.avatar}</Text>
              <View style={styles.postInfo}>
                <Text style={styles.postUser}>{post.user}</Text>
                <Text style={styles.postAction}>{post.action}</Text>
                <View style={styles.postMeta}>
                  <Text style={styles.postPoints}>🌱 +{post.points} pts</Text>
                  <Text style={styles.postTime}>{post.time}</Text>
                </View>
              </View>
            </View>
            <View style={styles.postActions}>
              <TouchableOpacity style={styles.postActionButton}>
                <Text>❤️ {post.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postActionButton}>
                <Text>💬</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postActionButton}>
                <Text>↗️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// ============================================
// SCANNER SCREEN
// ============================================
const ScannerScreen = ({ user, setUser, scannedItems, setScannedItems }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedItem, setScannedItem] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleScan = async () => {
    setScanning(true);

    // Mock AI vision recognition
    // In production, use TensorFlow Lite or ML Kit
    // const model = await tf.loadLayersModel('path/to/model.json');
    // const prediction = await model.predict(imageTensor);

    setTimeout(() => {
      const items = Object.keys(itemDatabase);
      const randomItem = items[Math.floor(Math.random() * items.length)];
      const itemData = itemDatabase[randomItem];
      
      const newItem = { ...itemData, id: Date.now(), timestamp: new Date() };
      setScannedItems([...scannedItems, newItem]);
      setUser({ 
        ...user, 
        points: user.points + itemData.points, 
        itemsRecycled: user.itemsRecycled + 1 
      });
      setScannedItem(newItem);
      setScanning(false);
    }, 2000);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      handleScan();
    }
  };

  if (hasPermission === null) {
    return <View style={styles.centerContainer}><Text>Requesting camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.centerContainer}><Text>No access to camera</Text></View>;
  }

  if (scannedItem) {
    return (
      <View style={styles.resultContainer}>
        <View style={styles.resultCard}>
          <Text style={styles.resultEmoji}>✅</Text>
          <Text style={styles.resultTitle}>Item Recognized!</Text>
          
          <View style={styles.resultInfoCard}>
            <Text style={styles.resultItemEmoji}>{scannedItem.emoji}</Text>
            <Text style={styles.resultItemName}>{scannedItem.name}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{scannedItem.category}</Text>
            </View>
          </View>

          <View style={styles.pointsContainer}>
            <Text style={styles.pointsEmoji}>🌱</Text>
            <Text style={styles.pointsText}>+{scannedItem.points} points</Text>
          </View>

          <Text style={styles.resultMessage}>
            Great job! You've earned {scannedItem.points} points for recycling.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setScannedItem(null)}
          >
            <Text style={styles.primaryButtonText}>Scan Another Item</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.scannerContainer}>
      {scanning ? (
        <View style={styles.scanningOverlay}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.scanningText}>Analyzing item...</Text>
        </View>
      ) : (
        <>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.scanInstruction}>Position item in frame</Text>
          
          <View style={styles.scanButtons}>
            <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
              <Text style={styles.scanButtonText}>📸 Scan Item</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
              <Text style={styles.galleryButtonText}>🖼️ Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

// ============================================
// SOCIAL SCREEN
// ============================================
const SocialScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { backgroundColor: '#a855f7' }]}>
        <Text style={styles.headerTitle}>Community</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        {mockEvents.map(event => (
          <View key={event.id} style={styles.eventCard}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.eventMeta}>
              <Text style={styles.eventDetail}>📅 {event.date}</Text>
              <Text style={styles.eventDetail}>📍 {event.location}</Text>
            </View>
            <View style={styles.eventFooter}>
              <Text style={styles.eventAttendees}>{event.attendees} attending</Text>
              <TouchableOpacity style={styles.joinButton}>
                <Text style={styles.joinButtonText}>Join</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Friends Leaderboard</Text>
        {mockFriends.map((friend, index) => (
          <View key={friend.id} style={styles.friendCard}>
            <View style={styles.friendInfo}>
              <Text style={styles.friendRank}>#{index + 1}</Text>
              <Text style={styles.friendAvatar}>{friend.avatar}</Text>
              <View>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendPoints}>{friend.points} points</Text>
              </View>
            </View>
            <Text style={styles.trophyEmoji}>🏆</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// ============================================
// PROFILE SCREEN
// ============================================
const ProfileScreen = ({ user, scannedItems }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { backgroundColor: '#6366f1' }]}>
        <Text style={styles.profileAvatar}>{user.avatar}</Text>
        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.profileEmail}>{user.email}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user.points}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user.itemsRecycled}</Text>
            <Text style={styles.statLabel}>Items Recycled</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Scans</Text>
        {scannedItems.length === 0 ? (
          <Text style={styles.emptyText}>No items scanned yet. Start scanning to track your impact!</Text>
        ) : (
          scannedItems.slice(-5).reverse().map(item => (
            <View key={item.id} style={styles.scanHistoryCard}>
              <View>
                <Text style={styles.scanHistoryName}>{item.emoji} {item.name}</Text>
                <Text style={styles.scanHistoryCategory}>{item.category}</Text>
              </View>
              <Text style={styles.scanHistoryPoints}>+{item.points} pts</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

// ============================================
// MAIN APP
// ============================================
const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [scannedItems, setScannedItems] = useState([]);

  if (!user) {
    return <LoginScreen setUser={setUser} />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#10b981',
          tabBarInactiveTintColor: '#9ca3af',
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Home"
          options={{ tabBarIcon: HomeIcon }}
        >
          {props => <HomeScreen {...props} user={user} setUser={setUser} />}
        </Tab.Screen>
        <Tab.Screen
          name="Scan"
          options={{ tabBarIcon: ScanIcon }}
        >
          {props => (
            <ScannerScreen
              {...props}
              user={user}
              setUser={setUser}
              scannedItems={scannedItems}
              setScannedItems={setScannedItems}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Social"
          component={SocialScreen}
          options={{ tabBarIcon: SocialIcon }}
        />
        <Tab.Screen
          name="Profile"
          options={{ tabBarIcon: ProfileIcon }}
        >
          {props => <ProfileScreen {...props} user={user} scannedItems={scannedItems} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#10b981',
    padding: 20,
  },
  loginCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  loginEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    width: '100%',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#10b981',
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsLabel: {
    color: '#fff',
    fontSize: 14,
  },
  statsEmoji: {
    fontSize: 20,
  },
  statsPoints: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsItems: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    marginTop: 8,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  postAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  postInfo: {
    flex: 1,
  },
  postUser: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  postAction: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  postMeta: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  postPoints: {
    fontSize: 12,
    color: '#10b981',
  },
  postTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  postActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#10b981',
    borderRadius: 24,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#10b981',
  },
  topLeft: {
    top: -3,
    left: -3,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 24,
  },
  topRight: {
    top: -3,
    right: -3,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 24,
  },
  bottomLeft: {
    bottom: -3,
    left: -3,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 24,
  },
  bottomRight: {
    bottom: -3,
    right: -3,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 24,
  },
  scanInstruction: {
    color: '#fff',
    fontSize: 18,
    marginTop: 32,
  },
  scanButtons: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    marginBottom: 12,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  galleryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  galleryButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
  },
  scanningOverlay: {
    alignItems: 'center',
  },
  scanningText: {
    color: '#fff',
    fontSize: 20,
    marginTop: 16,
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
  },
  resultInfoCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  resultItemEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  resultItemName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsEmoji: {
    fontSize: 32,
    marginRight: 8,
  },
  pointsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
  },
  resultMessage: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 16,
    marginBottom: 24,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  eventDetail: {
    fontSize: 14,
    color: '#6b7280',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventAttendees: {
    fontSize: 14,
    color: '#6b7280',
  },
  joinButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  friendCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  friendRank: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  friendAvatar: {
    fontSize: 32,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  friendPoints: {
    fontSize: 14,
    color: '#6b7280',
  },
  trophyEmoji: {
    fontSize: 24,
  },
  profileAvatar: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  scanHistoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanHistoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  scanHistoryCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  scanHistoryPoints: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 16,
    paddingVertical: 32,
  },
});