package org.florian.memoryflow.account;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.florian.memoryflow.db.Database;

import java.io.File;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Objects;


public class Progression {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    static Database db = Database.getInstance();
    static final private Logger LOGGER = LogManager.getLogger();
    static Levels Levels;

    static {
        try {
            Levels = OBJECT_MAPPER.readValue(new File("src/main/resources/levels.json"), Levels.class);
        } catch (Exception e) {
            LOGGER.debug(e);
        }
    }

    public static int getLevel(int userID) {
        return Integer.parseInt(db.getValue("progress", "level", "user_id", userID));
    }

    public static long getXP(int userID) {
        return Long.parseLong(db.getValue("progress", "xp", "user_id", userID));
    }

    public static String getStreak(String userID) {
        return db.getValue("progress", "streak", "user_id", userID);
    }

    public static void resetStreak(String userID) {
        db.updateValues("progress", "streak", "user_id", userID, 0);
    }

    public static void increaseStreak(int userID) {
        db.updateStreak(String.valueOf(userID));
    }

    public static void streakCheck() {
        ArrayList<Streak> streaks = db.getStreaks();
        for (Streak streak : streaks) {
            String userID = streak.user_id;
            long DAY_SECONDS = 86400;
            long currentTime = Instant.now().getEpochSecond();
            if (currentTime - streak.last_completion > DAY_SECONDS) {
                resetStreak(userID);
            }
            if (streak.claimed.equals("true")){
                setClaimed(userID, false);
            }
        }
    }

    public static void addXP(int userID, int xp) {

        // TODO: Add Streak Functionality

        int currentLevel = getLevel(userID);
        long currentXP = getXP(userID);
        long updatedXP = currentXP + xp;

        while (true) {
            Long xpTillRankUp = Levels.levels().get(currentLevel + 1);

            if (xpTillRankUp == null || updatedXP < xpTillRankUp) {
                break;
            }
            currentLevel += 1;
            updatedXP -= xpTillRankUp;
            setLevel(userID, currentLevel);
            LOGGER.debug("Level added");
        }
        db.updateIncrementedValue("progress", "xp", "user_id", String.valueOf(userID), xp);
    }

    public static void setLevel(int userID, int level) {
        db.updateValues("progress", "level", "user_id", String.valueOf(userID), level);
    }

    public static boolean hasClaimed(int userID) {
        String result = db.getValue("progress", "claimed", "user_id", userID);
        return result.equals("true");
    }

    public static void setClaimed(String userID, boolean claimed) {
        db.updateValues("progress", "claimed", "user_id", String.valueOf(userID), claimed ? "true":"false");
    }
}
