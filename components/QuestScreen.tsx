import { Quest } from "../types";
import { View, Text } from "react-native";
import { styles } from "@/constants/styles";

interface QuestScreenProps {
  quests: Quest[];
}

const QuestCard = ({ quest }: { quest: Quest }) => {
  const progressPercentage = (quest.progress / quest.goal) * 100;
  
  return (
    <View style={styles.questContainer}>
      {/* Quest Type Badge */}
      <View style={styles.questBadge}>
        <Text style={styles.questBadgeText}>📅 Daily Quest</Text>
      </View>

      {/* Quest Title */}
      <Text style={styles.questName}>
        {quest.completed ? '✅ ' : ''}{quest.name}
      </Text>
      <Text style={styles.subtitle}>
        {quest.completed ? '✅ ' : ''}{quest.description}
      </Text>

      {/* Rewards Row */}
      <View style={styles.rewardsRow}>
        <View style={styles.rewardBadge}>
          <Text style={styles.rewardIcon}>⭐</Text>
          <Text style={styles.rewardText}>{quest.points} pts</Text>
        </View>
        <View style={[styles.rewardBadge, styles.carbonBadge]}>
          <Text style={styles.rewardIcon}>🌱</Text>
          <Text style={styles.rewardText}>{quest.co2}g CO₂</Text>
        </View>
      </View>

      {/* Progress Section (only if not completed) */}
      {!quest.completed && (
        <View style={styles.progressSection}>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${Math.min(progressPercentage, 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {quest.progress} / {quest.goal} completed
          </Text>
        </View>
      )}

      {/* Completed Badge */}
      {quest.completed && (
        <View style={styles.completedBanner}>
          <Text style={styles.completedText}>🎉 Quest Completed!</Text>
        </View>
      )}
    </View>
  );
};

export default function QuestScreen({ quests }: QuestScreenProps) {
  return (
    <View style={styles.questContent}>
      <Text style={styles.questTitle}>📜 Your Quests</Text>
      <Text style={styles.subtitle}>
        Complete quests to earn rewards and save the planet!
      </Text>
      
      <QuestCard quest={quests[0]} />
      <QuestCard quest={quests[1]} />
    </View>
  );
}