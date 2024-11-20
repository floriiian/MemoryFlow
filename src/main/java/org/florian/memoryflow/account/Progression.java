package org.florian.memoryflow.account;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.florian.memoryflow.db.Database;
import org.florian.memoryflow.missions.Missions;

import java.io.File;
import java.time.Instant;
import java.util.ArrayList;


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


    public static int getLevel(int user_id) {
        return Integer.parseInt(db.getValue("progress", "level", "user_id", user_id));
    }

    public static long getXP(int user_id) {
        return Long.parseLong(db.getValue("progress", "xp", "user_id", user_id));
    }

    public static  String getStreak(String user_id) {
        return db.getValue("progress", "streak", "user_id", user_id);
    }

    public static void resetStreak(String user_id) {
        db.updateValues("progress", "streak", "user_id", user_id, 0);
    }

    public static void increaseStreak(String user_id) {
        db.updateStreak(user_id);
    }

    public static void streakCheck() {
        ArrayList<Streak> streaks = db.getStreaks();

        for (Streak streak : streaks) {
            long DAY_SECONDS = 86400;
            long currentTime = Instant.now().getEpochSecond();
            if (currentTime - streak.last_completion > DAY_SECONDS) {
                resetStreak(streak.user_id);
            }
            LOGGER.debug("User ID: {}, Streak: {}, Last Completion: {}", streak.user_id, streak.streak, streak.last_completion);
        }
    }

    public static void addXP(int user_id, int xp) {

        // TODO: Add Streak Functionality

        int currentLevel = getLevel(user_id);
        long currentXP = getXP(user_id);
        long updatedXP = currentXP + xp;

        while (true) {
            Long xpTillRankUp = Levels.levels().get(currentLevel + 1);

            if (xpTillRankUp == null || updatedXP < xpTillRankUp) {
                break;
            }
            currentLevel += 1;
            updatedXP -= xpTillRankUp;
            setLevel(user_id, currentLevel);
            LOGGER.debug("Level added");
        }
        db.updateIncrementedValue("progress", "xp", "user_id", String.valueOf(user_id), xp);
    }

    public static void setLevel(int user_id, int level) {
        db.updateValues("progress", "level", "user_id", String.valueOf(user_id), level);
    }
}
