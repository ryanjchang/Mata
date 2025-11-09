import { useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import CameraModal from '../../components/CameraModal';
import DashboardScreen from '../../components/DashboardScreen';
import HistoryScreen from '../../components/HistoryScreen';
import LeaderboardScreen from '../../components/LeaderboardScreen';
import LoginScreen from '../../components/LoginScreen';
import MenuModal from '../../components/MenuModal';
import RewardModal from '../../components/RewardModal';
import RewardsScreen from '../../components/RewardsScreen';
import QuestScreen from '../../components/QuestScreen';
import PointsDisplay  from '../../components/PointsDisplay';
import { styles } from '../../constants/styles';
import { useAuth } from '../../hooks/useAuth';
import { EcoAction, Screen, Quest} from '../../types';
import {
  getActionEmoji,
  getActionName,
  getCO2Savings,
  getPointsForAction,
  verifyEcoAction,
} from '../../utils/aiVerification';
import { checkCooldown, formatCooldownTime } from '../../utils/cooldowns';
import { addEcoAction, getUserData, updateUserProfile, updateUserQuests, getUserQuests } from '../../utils/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const { user, loading, signIn, signUp, signOut } = useAuth();

  const [points, setPoints] = useState(0);
  const [actions, setActions] = useState<EcoAction[]>([]);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [showReward, setShowReward] = useState(false);
  const [lastAction, setLastAction] = useState<EcoAction | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [verifying, setVerifying] = useState(false);

const waterQuest: Quest = {
  type: "daily",
  name: "Bottle",
  description: "Use a reusable water bottle",
  id: 0,
  points: 20,
  co2: 50,
  progress: 0,
  goal: 1,
  completed: false,
}
const bikeQuest: Quest = {
  type: "weekly",
  name: "Bike",
  description: "Commute by biking",
  id: 1,
  points: 120,
  co2: 30,
  progress: 0,
  goal: 3,
  completed: false,
}
const [quests, setQuests] = useState<Quest[]>([waterQuest, bikeQuest]);

  const totalCO2Saved = actions.reduce((sum, action) => {
    const co2Value = Number(action.co2) || 0; 
    return sum + co2Value;
  }, 0);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  useEffect(() => {
    if (showReward) {
      const timer = setTimeout(() => {
        setShowReward(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showReward]);

  const loadUserData = async () => {
  if (!user) return;

  try {
    console.log('Loading data for user:', user.uid);

    if (user.displayName && user.email) {
      console.log('Updating user profile...');
      await updateUserProfile(user.uid, user.displayName, user.email);
    }

    console.log('Fetching user data from Firestore...');
    const result = await getUserData(user.uid, {
      displayName: user.displayName || undefined,
      email: user.email || undefined,
    });

    console.log('Result:', result);

    if (result.success && result.data) {
      setPoints(result.data.points || 0);
      setActions(result.data.actions || []);
      
      // Load quests
      console.log('Loading quests...');
      const savedQuests = await getUserQuests(user.uid);
      
      if (savedQuests && savedQuests.length > 0) {
        console.log('Loaded saved quests');

        const lastReset = await AsyncStorage.getItem('lastQuestReset');
        const today = new Date().toDateString();

        if (lastReset !== today) {
          console.log('resetting daily quests');
          
          const resetQuests = savedQuests.map(quest => ({
            ...quest,
            progress: quest.type === 'daily' ? 0 : quest.progress,
            completed: quest.type === 'daily' ? false : quest.completed,
          }));

          setQuests(resetQuests);
          await updateUserQuests(user.uid, resetQuests);
          await AsyncStorage.setItem('lastQuestReset', today); 
        } else {
          setQuests(savedQuests);
        }
      } else {
        console.log('No saved quests, using defaults');
        setQuests([waterQuest, bikeQuest]);
        await updateUserQuests(user.uid, [waterQuest, bikeQuest]);
      }

      if (result.offline) {
        console.log('App working in offline mode');
      }

      console.log('✅ User data loaded successfully');
    } else {
      console.log('❌ Failed to load user data:', result.error);
    }
  } catch (error: any) {
    console.error('⚠️ Error in loadUserData:', error);
    console.error('Error details:', error.message);
  }
};

  const handleLogout = async () => {
    await signOut();
    setPoints(0);
    setActions([]);
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

  const handlePhotoCapture = (uri: string) => {
    setCapturedPhoto(uri);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
  };

  const verifyAction = async (isRetry: boolean = false) => {
    if (!capturedPhoto) return;

    setVerifying(true);

    try {
      if (isRetry) {
        console.log('🔄 Retrying verification...');
      } else {
        console.log('🤖 Calling GPT-4 Vision API...');
      }
      
      const verification = await verifyEcoAction(capturedPhoto);
      console.log('✅ AI Result:', verification);

      if (!verification.isEcoFriendly) {
        Alert.alert(
          'Not an Eco-Action ❌',
          verification.reasoning || 'This doesn\'t appear to be an eco-friendly action. Please try capturing a sustainable activity!',
          [{ text: 'Try Again', onPress: () => { setVerifying(false); retakePhoto(); } }]
        );
        setVerifying(false);
        return;
      }

      const cooldownCheck = checkCooldown(verification.actionType, actions);

      if (cooldownCheck.onCooldown && cooldownCheck.timeRemaining) {
        const timeLeft = formatCooldownTime(cooldownCheck.timeRemaining);
        Alert.alert(
          'Action on Cooldown ⏳',
          `You recently logged a ${getActionName(verification.actionType)} action!\n\nPlease wait ${timeLeft} before logging this action again.\n\nThis prevents spam and ensures fair rewards.`,
          [{ text: 'OK', onPress: () => { setVerifying(false); setShowCamera(false); setCapturedPhoto(null); } }]
        );
        setVerifying(false);
        return;
      }

      if (verification.confidence < 60) {
        Alert.alert(
          'Low Confidence ⚠️',
          `AI is ${verification.confidence}% confident this is eco-friendly.\n\n${verification.reasoning}\n\nDo you want to proceed?`,
          [
            { text: 'Try Again', onPress: () => { setVerifying(false); retakePhoto(); }, style: 'cancel' },
            { text: 'Yes, Proceed', onPress: () => saveVerifiedAction(verification) }
          ]
        );
        setVerifying(false);
        return;
      }

      await saveVerifiedAction(verification);
    } catch (error: any) {
      console.error('❌ Verification error:', error);
      
      // Auto-retry once on timeout
      if ((error.name === 'AbortError' || error.message.includes('timeout')) && !isRetry) {
        console.log('⏱️ Timeout detected, automatically retrying...');
        Alert.alert(
          'Retrying...',
          'The request timed out. Automatically retrying once...',
          [{ text: 'OK' }]
        );
        await new Promise(resolve => setTimeout(resolve, 1000));
        return verifyAction(true); // Retry with flag set to true
      }
      
      setVerifying(false);
      Alert.alert(
        'Verification Failed',
        `Error: ${error.message}\n\n${isRetry ? 'Retry also failed. ' : ''}Make sure your OpenAI API key is set correctly in utils/aiVerification.ts`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Try Again', onPress: () => verifyAction(false) }
        ]
      );
    }
  };

  const saveVerifiedAction = async (verification: any) => {
    const newAction: EcoAction = {
      type: verification.actionType,
      name: getActionName(verification.actionType),
      points: getPointsForAction(verification.actionType),
      co2: Number(getCO2Savings(verification.actionType, verification.estimatedCO2Saved)),
      emoji: getActionEmoji(verification.actionType),
      id: Date.now(),
      timestamp: new Date().toISOString(),
      image: capturedPhoto || undefined,
      aiReasoning: verification.reasoning,
      confidence: verification.confidence,
    };

    // Update quest progress
  const updatedQuests = quests.map(quest => {
    // Check if action matches quest (e.g., water action completes water quest)
    if (quest.name.toLowerCase() === verification.actionType.toLowerCase()) {
      console.log(quest.progress)
      const newProgress = quest.progress + 1;
      const isCompleted = newProgress >= quest.goal;
      console.log(quest)
      return {
        ...quest,
        progress: newProgress,
        completed: isCompleted
      };
    }
    return quest;
  });
  
  setQuests(updatedQuests);

    // Update local state immediately
    setActions([newAction, ...actions]);
    setPoints(points + newAction.points);
    setLastAction(newAction);
    setShowCamera(false);
    setCapturedPhoto(null);
    setVerifying(false);
    setShowReward(true);

    // Save to Firestore
    if (user) {
      await addEcoAction(user.uid, newAction, {
        displayName: user.displayName || undefined,
        email: user.email || undefined,
      });
      await updateUserQuests(user.uid, updatedQuests);
    }
  };

  const handleRewardRedeem = async (rewardId: string, cost: number) => {
    console.log('🎁 Redeem called! Reward:', rewardId, 'Cost:', cost, 'Current points:', points);

    // Deduct points locally
    const newPoints = points - cost;
    setPoints(newPoints);

    console.log('💰 New points balance:', newPoints);

    // Update Firestore
    if (user) {
      try {
        console.log('📤 Updating Firestore...');
        const result = await updateUserProfile(user.uid, user.displayName || '', user.email || '', newPoints);

        if (result.success) {
          console.log(`✅ Redeemed reward ${rewardId} for ${cost} points. New balance: ${newPoints}`);
        } else {
          console.error('❌ Firestore update failed:', result.error);
          // Rollback if save fails
          setPoints(points);
          Alert.alert('Error', 'Failed to redeem reward. Please try again.');
        }
      } catch (error) {
        console.error('❌ Error updating points after redemption:', error);
        // Rollback if save fails
        setPoints(points);
        Alert.alert('Error', 'Failed to redeem reward. Please try again.');
      }
    } else {
      console.log('⚠️ No user logged in');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={{ marginTop: 20, color: '#6b7280' }}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <LoginScreen signIn={signIn} signUp={signUp} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Navigation Bar */}
      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.navLogo}>
            <Image style={{width:35, height:35}} source={require('../../turtle-icon.png')} />
          </LinearGradient>
          <Text style={styles.navTitle}>Mata</Text>
        </View>
        <View style={styles.navRight}>
          <View style={styles.pointsBadge}>
            <PointsDisplay points={points} word="pts" style={styles.pointsText}/>
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
        <TouchableOpacity
          style={[styles.tab, currentScreen === 'rewards' && styles.tabActive]}
          onPress={() => setCurrentScreen('rewards')}
        >
          <Text style={[styles.tabText, currentScreen === 'rewards' && styles.tabTextActive]}>
            Shop
          </Text>
        </TouchableOpacity>
        

<TouchableOpacity
  style={[styles.tab, currentScreen === 'quests' && styles.tabActive]}
  onPress={() => setCurrentScreen('quests')}
>
  <Text style={[styles.tabText, currentScreen === 'quests' && styles.tabTextActive]}>
    Quests
  </Text>
</TouchableOpacity>


      </ScrollView>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentScreen === 'home' && (
          <DashboardScreen
            user={user}
            points={points}
            actions={actions}
            totalCO2Saved={totalCO2Saved}
            onCameraOpen={handleCameraOpen}
          />
        )}
        {currentScreen === 'leaderboard' && (
          <LeaderboardScreen user={user} points={points} />
        )}
        {currentScreen === 'history' && <HistoryScreen actions={actions} />}
        {currentScreen === 'rewards' && (
          <RewardsScreen points={points} onRedeem={handleRewardRedeem} />
        )}
        {currentScreen === "quests" && <QuestScreen quests={quests} />}
      </ScrollView>

      {/* Modals */}
      <CameraModal
        visible={showCamera}
        capturedPhoto={capturedPhoto}
        verifying={verifying}
        onClose={() => setShowCamera(false)}
        onCapture={handlePhotoCapture}
        onRetake={retakePhoto}
        onVerify={verifyAction}
      />

      <RewardModal visible={showReward} action={lastAction} />

      <MenuModal
        visible={showMenu}
        user={user}
        onClose={() => setShowMenu(false)}
        onLogout={handleLogout}
      />
    </View>
  );
}