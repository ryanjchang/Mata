import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from './_styles';

export default function HomeScreen() {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [actions, setActions] = useState([]);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [showReward, setShowReward] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const ecoActionTypes = [
    { type: 'bottle', name: 'Reusable Bottle', points: 10, co2: 50, emoji: '♻️' },
    { type: 'recycle', name: 'Recycling', points: 15, co2: 100, emoji: '🗑️' },
    { type: 'bike', name: 'Bike Commute', points: 25, co2: 200, emoji: '🚴' },
    { type: 'compost', name: 'Composting', points: 20, co2: 150, emoji: '🌱' },
  ];

  const leaderboard = [
    { name: 'Sarah Green', points: 450, avatar: '🌱' },
    { name: 'Mike Earth', points: 380, avatar: '🌍' },
    { name: user?.name || 'You', points: points, avatar: '⭐', isUser: true },
    { name: 'Emma Eco', points: 220, avatar: '♻️' },
    { name: 'John Leaf', points: 180, avatar: '🍃' },
  ].sort((a, b) => b.points - a.points);

  const totalCO2Saved = actions.reduce((sum, action) => sum + action.co2, 0);

  useEffect(() => {
    if (showReward) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowReward(false));
      }, 3000);
    }
  }, [showReward]);

  const handleGoogleSignIn = () => {
    setUser({ name: 'Demo User', email: 'demo@gmail.com' });
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setUser(null);
    setPoints(0);
    setActions([]);
    setCurrentScreen('login');
    setShowMenu(false);
  };

  const handleCameraOpen = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera access is needed to capture eco-actions');
        return;
      }
    }
    setShowCamera(true);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setCapturedPhoto(photo.uri);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const verifyAction = () => {
    const randomAction = ecoActionTypes[Math.floor(Math.random() * ecoActionTypes.length)];
    const newAction = {
      ...randomAction,
      id: Date.now(),
      timestamp: new Date(),
      image: capturedPhoto,
    };

    setActions([newAction, ...actions]);
    setPoints(points + randomAction.points);
    setLastAction(newAction);
    setShowCamera(false);
    setCapturedPhoto(null);
    setShowReward(true);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
  };

  if (currentScreen === 'login') {
    return (
      <LinearGradient colors={['#4ade80', '#22c55e', '#16a34a']} style={styles.loginContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loginContent}>
          <View style={styles.logoContainer}>
            <LinearGradient colors={['#86efac', '#22c55e']} style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🌿</Text>
            </LinearGradient>
            <Text style={styles.appTitle}>EcoRewards</Text>
            <Text style={styles.appSubtitle}>Turn green actions into rewards</Text>
          </View>

          <View style={styles.loginBox}>
            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.featuresContainer}>
              <View style={styles.featureCard}>
                <Text style={styles.featureEmoji}>📸</Text>
                <Text style={styles.featureText}>Capture</Text>
              </View>
              <View style={styles.featureCard}>
                <Text style={styles.featureEmoji}>🤖</Text>
                <Text style={styles.featureText}>AI Verify</Text>
              </View>
              <View style={styles.featureCard}>
                <Text style={styles.featureEmoji}>🏆</Text>
                <Text style={styles.featureText}>Earn</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Navigation Bar */}
      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.navLogo}>
            <Text style={styles.navLogoText}>🌿</Text>
          </LinearGradient>
          <Text style={styles.navTitle}>EcoRewards</Text>
        </View>
        <View style={styles.navRight}>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>{points} pts</Text>
          </View>
          <TouchableOpacity onPress={() => setShowMenu(true)}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={{ paddingRight: 20 }}>
        <TouchableOpacity
          style={[styles.tab, currentScreen === 'home' && styles.tabActive]}
          onPress={() => setCurrentScreen('home')}
        >
          <Text style={[styles.tabText, currentScreen === 'home' && styles.tabTextActive]}>
            Dashboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, currentScreen === 'leaderboard' && styles.tabActive]}
          onPress={() => setCurrentScreen('leaderboard')}
        >
          <Text style={[styles.tabText, currentScreen === 'leaderboard' && styles.tabTextActive]}>
            Leaderboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, currentScreen === 'history' && styles.tabActive]}
          onPress={() => setCurrentScreen('history')}
        >
          <Text style={[styles.tabText, currentScreen === 'history' && styles.tabTextActive]}>
            History
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentScreen === 'home' && (
          <View style={styles.homeContent}>
            <LinearGradient colors={['#22c55e', '#16a34a', '#14532d']} style={styles.welcomeCard}>
              <Text style={styles.welcomeTitle}>Welcome, {user?.name?.split(' ')[0]}! 👋</Text>
              <Text style={styles.welcomeSubtitle}>Ready to make the planet greener?</Text>
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statIcon}>📈</Text>
                  <Text style={styles.statValue}>{points}</Text>
                  <Text style={styles.statLabel}>Points</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statIcon}>🌿</Text>
                  <Text style={styles.statValue}>{actions.length}</Text>
                  <Text style={styles.statLabel}>Actions</Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.impactCard}>
              <Text style={styles.sectionTitle}>🌍 Your Impact</Text>
              <LinearGradient colors={['#dcfce7', '#bbf7d0']} style={styles.impactContent}>
                <Text style={styles.impactValue}>{(totalCO2Saved / 1000).toFixed(2)}</Text>
                <Text style={styles.impactLabel}>kg CO₂ saved</Text>
                <Text style={styles.impactSubtext}>
                  Equal to {Math.floor(totalCO2Saved / 411)} km not driven by car
                </Text>
              </LinearGradient>
            </View>

            <TouchableOpacity style={styles.cameraButton} onPress={handleCameraOpen} activeOpacity={0.8}>
              <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.cameraButtonGradient}>
                <Text style={styles.cameraIcon}>📸</Text>
                <Text style={styles.cameraButtonText}>Capture Eco-Action</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.actionsGrid}>
              <Text style={styles.sectionTitle}>Eco-Actions</Text>
              <View style={styles.grid}>
                {ecoActionTypes.map((action) => (
                  <View key={action.type} style={styles.actionCard}>
                    <Text style={styles.actionEmoji}>{action.emoji}</Text>
                    <Text style={styles.actionName}>{action.name}</Text>
                    <Text style={styles.actionPoints}>+{action.points} pts</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {currentScreen === 'leaderboard' && (
          <View style={styles.leaderboardContent}>
            <Text style={styles.pageTitle}>🏆 Leaderboard</Text>
            {leaderboard.map((person, index) => (
              <View
                key={index}
                style={[styles.leaderboardRow, person.isUser && styles.leaderboardRowUser]}
              >
                <Text style={styles.leaderboardRank}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </Text>
                <Text style={styles.leaderboardAvatar}>{person.avatar}</Text>
                <View style={styles.leaderboardInfo}>
                  <Text style={styles.leaderboardName}>{person.name}</Text>
                  <Text style={styles.leaderboardPoints}>{person.points} points</Text>
                </View>
                {person.isUser && <Text style={styles.leaderboardStar}>⭐</Text>}
              </View>
            ))}
          </View>
        )}

        {currentScreen === 'history' && (
          <View style={styles.historyContent}>
            <Text style={styles.pageTitle}>Your Journey</Text>
            {actions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>✨</Text>
                <Text style={styles.emptyText}>Start capturing eco-actions!</Text>
              </View>
            ) : (
              actions.map((action) => (
                <View key={action.id} style={styles.historyCard}>
                  {action.image && (
                    <Image source={{ uri: action.image }} style={styles.historyImage} resizeMode="cover" />
                  )}
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyName}>✅ {action.name}</Text>
                    <Text style={styles.historyDate}>
                      {action.timestamp.toLocaleDateString()} at {action.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <View style={styles.historyBadges}>
                      <View style={styles.historyBadgeGreen}>
                        <Text style={styles.historyBadgeText}>+{action.points} pts</Text>
                      </View>
                      <View style={styles.historyBadgeBlue}>
                        <Text style={styles.historyBadgeText}>{action.co2}g CO₂</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Camera Modal */}
      <Modal visible={showCamera} animationType="slide" statusBarTranslucent>
        <View style={styles.cameraContainer}>
          {!capturedPhoto ? (
            <>
              <CameraView style={styles.camera} ref={cameraRef} facing="back">
                <View style={styles.cameraOverlay}>
                  <View style={styles.cameraHeader}>
                    <TouchableOpacity
                      style={styles.cameraClose}
                      onPress={() => setShowCamera(false)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cameraCloseText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cameraFooter}>
                    <Text style={styles.cameraHint}>Capture your eco-action</Text>
                  </View>
                </View>
              </CameraView>

              <View style={styles.captureButtonContainer}>
                <TouchableOpacity style={styles.captureButton} onPress={takePicture} activeOpacity={0.8}>
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.previewContainer}>
              <Image source={{ uri: capturedPhoto }} style={styles.previewImage} resizeMode="cover" />
              <View style={styles.previewOverlay}>
                <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto} activeOpacity={0.8}>
                  <Text style={styles.retakeButtonText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.verifyButton} onPress={verifyAction} activeOpacity={0.8}>
                  <Text style={styles.verifyButtonText}>✓ Verify Action</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* Reward Popup */}
      {showReward && lastAction && (
        <Modal transparent visible={showReward} animationType="fade" statusBarTranslucent>
          <View style={styles.rewardOverlay}>
            <Animated.View style={[styles.rewardCard, { transform: [{ scale: scaleAnim }] }]}>
              <Text style={styles.rewardEmoji}>🎉</Text>
              <Text style={styles.rewardTitle}>Awesome!</Text>
              <Text style={styles.rewardSubtitle}>Action verified successfully</Text>
              <LinearGradient colors={['#dcfce7', '#bbf7d0']} style={styles.rewardPoints}>
                <Text style={styles.rewardPointsValue}>+{lastAction.points}</Text>
                <Text style={styles.rewardPointsLabel}>points earned</Text>
                <View style={styles.rewardCO2}>
                  <Text style={styles.rewardCO2Text}>💚 Saved {lastAction.co2}g CO₂</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          </View>
        </Modal>
      )}

      {/* Menu Modal */}
      <Modal visible={showMenu} transparent animationType="slide" statusBarTranslucent>
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Menu</Text>
                <TouchableOpacity onPress={() => setShowMenu(false)}>
                  <Text style={styles.menuClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.menuProfile}>
                <Text style={styles.menuAvatar}>👤</Text>
                <Text style={styles.menuName}>{user?.name}</Text>
                <Text style={styles.menuEmail}>{user?.email}</Text>
              </View>

              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                <Text style={styles.logoutIcon}>🚪</Text>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}