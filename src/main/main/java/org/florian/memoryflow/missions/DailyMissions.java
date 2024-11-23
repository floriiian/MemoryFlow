package org.florian.memoryflow.missions;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.http.Context;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.florian.memoryflow.account.Login;
import org.florian.memoryflow.account.Progression;
import org.florian.memoryflow.api.responses.DailyMissionsResponse;

import org.florian.memoryflow.db.Database;

import java.io.File;

import java.util.ArrayList;

public class DailyMissions {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final Logger LOGGER = LogManager.getLogger();
    private static final Database db = Database.getInstance();
    private static Missions Missions;

    static {
        try {
            Missions = OBJECT_MAPPER.readValue(new File("src/main/resources/daily_missions.json"), Missions.class);
        } catch (Exception e) {
            LOGGER.debug(e);
        }
    }

    public static void handleDailyMissionsRequest(Context ctx) {
        try {
            String accountId = Login.getAccountIDByToken(ctx.cookie("sessionToken"));
            ArrayList<String> userMissionIDS = getDailyMissionsFromUser(accountId);

            if (userMissionIDS == null) {
                addDailyMission(accountId);
                userMissionIDS = getDailyMissionsFromUser(accountId);
            }

            ArrayList<Mission> userMissions = new ArrayList<>();
            for (String missionID : userMissionIDS) {
                Mission currentMission = Missions.daily_missions().get(missionID);
                int currentMissionProgress = Integer.parseInt(getDailyMissionProgress(accountId, missionID));
                currentMission.setProgress(currentMissionProgress);
                userMissions.add(currentMission);
            }
            ctx.status(200);
            ctx.contentType("application/json");
            ctx.result(OBJECT_MAPPER.writeValueAsString(new DailyMissionsResponse(userMissions)));
        } catch (Exception e) {
            ctx.status(500);
            LOGGER.debug(e);
        }
    }

    public static void handleCompletion(int userID, long xp, int totalFlashcards, int correctCards, int wrongCards) {
        try {
            ArrayList<String> userMissions = getDailyMissionsFromUser(String.valueOf(userID));
            if (userMissions == null) {
                LOGGER.debug("No active missions found.");
                return;
            }
            for (String userMission : userMissions) {
                Mission mission = Missions.daily_missions().get(userMission);

                int missionGoal = mission.getAmount();
                int missionProgress = mission.getProgress();

                if (missionGoal == missionProgress) {
                    return;
                }

                String type = mission.getType();
                int usedVar = switch (type) {
                    case "xp" -> (int) xp;
                    case "answer" -> correctCards + wrongCards;
                    case "answer_correctly" -> correctCards;
                    case "answer_wrong" -> wrongCards;
                    default -> 0;
                };
                if ((missionProgress + usedVar) >= missionGoal) {
                    Progression.addXP(userID, mission.getXP());
                    updateDailyMission(userID, userMission, missionGoal);
                }
            }
        } catch (Exception e) {
            LOGGER.debug(e);
        }

    }

    private static ArrayList<String> getDailyMissionsFromUser(String userId) {
        return db.getAllValuesByType("daily_missions", "mission_id", "user_id", userId);
    }

    private static String getDailyMissionProgress(String userId, String missionId) {
        return db.getValueWith2Conditions(
                "daily_missions",
                "progress",
                "user_id", userId, "mission_id", missionId);
    }

    private static void addDailyMission(String userId) {
        if (db.getValue("daily_missions", "mission_id", "user_id", userId) == null) {

            String randomMissionNum = String.valueOf((Math.round(Math.random() * Missions.daily_missions().size())));
            Mission mission = Missions.daily_missions().get(randomMissionNum);

            db.insertValues("daily_missions",
                    new String[]{"user_id", "mission_id, type"},
                    new String[]{userId, randomMissionNum, mission.getType()});
        }
    }

    private static void updateDailyMission(int userID, String missionID, int value) {
        db.updateIncrementedValueWithTwo
                ("daily_missions", "progress",
                        "user_id", Integer.toString(userID),
                        "mission_id", missionID,
                        value
                );
    }

    private static void removeDailyMission(int userID, String missionID) {
        db.deleteValueWhereTwo("daily_missions", "user_id", String.valueOf(userID), "mission_id", missionID);
    }
}
