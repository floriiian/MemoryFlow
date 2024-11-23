package org.florian.memoryflow.leaderboard;

import io.javalin.http.Context;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.florian.memoryflow.api.responses.LeaderboardResponse;
import org.florian.memoryflow.db.Database;

import java.util.ArrayList;

import static org.florian.memoryflow.Main.OBJECT_MAPPER;


public class Leaderboard {

    static Database db = Database.getInstance();
    static final private Logger LOGGER = LogManager.getLogger();

    private static final ArrayList<Competitor> currentLeaderboard = new ArrayList<>();

    public static void addAndUpdateCompetitor(int userID, int earnedXP) {
        try {
            if (db.getValue("leaderboard", "user_id", "user_id", userID) == null) {
                db.insertValues(
                        "leaderboard",
                        new String[]{"user_id", "daily_xp"},
                        new String[]{String.valueOf(userID), String.valueOf(earnedXP)}
                );
            } else {
                db.updateIncrementedValue(
                        "leaderboard", "daily_xp", "user_id",
                        String.valueOf(userID), earnedXP);
            }
        } catch (Exception e) {
            LOGGER.debug(e);
        }
    }

    public static void removeCompetitor(String userID) {
        try {
            db.deleteValue("leaderboard", "user_id", userID);
        } catch (Exception e) {
            LOGGER.debug(e);
        }
    }

    public static void handleLeaderboardRequest(Context ctx) {
        try {
            ctx.status(200);
            ctx.contentType("application/json");
            ctx.result(OBJECT_MAPPER.writeValueAsString(new LeaderboardResponse(currentLeaderboard)));
        } catch (Exception e) {
            LOGGER.debug("Error trying to handle leaderboard request.");
        }
    }

    public static final Runnable getTopTenCompetitors = () -> {
        try {
            ArrayList<String> totalCompetitors = db.getAllValuesFromTable("leaderboard");
            if(totalCompetitors == null) {
                // No new competitors yet.
                return;
            }
            ArrayList<int[]> competitorPairs = new ArrayList<>();

            for (int i = 0; i < totalCompetitors.size(); i += 2) {
                int accountId = Integer.parseInt(totalCompetitors.get(i));
                int xp = Integer.parseInt(totalCompetitors.get(i + 1));
                competitorPairs.add(new int[]{accountId, xp});
            }
            competitorPairs.sort((a, b) -> Integer.compare(b[1], a[1]));

            totalCompetitors.clear();
            for (int[] pair : competitorPairs) {
                totalCompetitors.add(String.valueOf(pair[0]));
                totalCompetitors.add(String.valueOf(pair[1]));
            }
            currentLeaderboard.clear();

            int currentRank = 1;
            for (int i = 0; i < totalCompetitors.size(); i = i + 2) {
                String userid = totalCompetitors.get(i);
                String daily_xp = totalCompetitors.get(i + 1);
                String username = "";
                String level = "";

                ArrayList<String> userData = db.getUserData(userid);

                if (userData != null) {
                    username = userData.getFirst();
                    level = userData.get(2);
                }
                currentLeaderboard.add(new Competitor(currentRank, username, level, daily_xp));
                currentRank++;
            }
        } catch (Exception e) {
            LOGGER.debug(e);
        }
    };
}
