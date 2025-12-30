import User from "../models/User.js";

export const getLeaderboard = async (req, res) => {
  try {
    // Get top 10 users sorted by XP descending
    const leaderboard = await User.find({})
      .select("fullName profilePic xp level nativeLanguage learningLanguage")
      .sort({ xp: -1 })
      .limit(10);

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Error in getLeaderboard:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateStreak = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const today = new Date();
    const lastActive = new Date(user.lastActiveDate);

    // Reset hours to compare dates only
    today.setHours(0, 0, 0, 0);
    lastActive.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today - lastActive);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let message = "Streak updated";
    let steakUpdated = false;

    if (diffDays === 1) {
      // Consecutive day
      user.streak += 1;
      user.xp += 50; // Bonus XP for daily login
      steakUpdated = true;
    } else if (diffDays > 1) {
      // Missed a day (or more), reset streak
      // Exception: If they are logging in for the first time ever or first time after feature add
      // If diffDays is 0, they already logged in today, do nothing.
      user.streak = 1;
      user.xp += 10; // Small XP for coming back
      steakUpdated = true;
    } else {
        // diffDays === 0, same day login
        message = "Already checked in today";
    }

    // Always update lastActiveDate to now (keep time component for accuracy if needed later)
    user.lastActiveDate = new Date();
    
    // Check for level up
    // Simple formula: Level = floor(sqrt(XP / 100))
    // Or just check milestones. Let's stick to the plan: Level = Math.floor(Math.sqrt(user.xp / 100)) + 1
    // Adjusting base: IF xp=0, level 1. If xp=100, level 2.
    const newLevel = Math.floor(Math.sqrt(user.xp / 100)) + 1;
    if (newLevel > user.level) {
        user.level = newLevel;
        // Could enable a "Level Up" notification flag here if we had one
    }

    await user.save();

    res.status(200).json({ 
        streak: user.streak, 
        xp: user.xp, 
        level: user.level,
        message 
    });

  } catch (error) {
    console.error("Error in updateStreak:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
