package org.florian.memoryflow.db;

import kotlin.reflect.jvm.internal.impl.util.ArrayMap;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.File;
import java.sql.*;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import org.florian.memoryflow.account.Progression;
import org.florian.memoryflow.account.Streak;
import org.ini4j.Ini;
import org.jetbrains.annotations.Nullable;

import static java.util.concurrent.TimeUnit.SECONDS;


public class Database {

    private static Database instance;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    private Database() {
    }

    public static synchronized Database getInstance() {
        if (instance == null)
            instance = new Database();
        return instance;
    }

    public final String DEFAULT_LEVEL = "1";
    public final String DEFAULT_STREAK = "0";
    public final String DEFAULT_XP = "0";

    private static Connection CONNECTION = null;
    private static final Logger LOGGER = LogManager.getLogger();

    public void startDatabase() {
        String DATABASE_URL = "jdbc:sqlite:memoryflow.db";
        String DATABASE_QUERIES = "src/main/resources/sql_queries.ini";
        try {
            Class.forName("org.sqlite.JDBC");
            CONNECTION = DriverManager.getConnection(DATABASE_URL);
            LOGGER.debug("Connected to {}", DATABASE_URL);

            String[] availableTables = new String[]{
                    "create_account_table",
                    "create_flashcard_table",
                    "create_progress_table",
                    "create_leaderboard_table",
                    "create_daily_missions_table"
            };

            for (String table : availableTables) {
                try {
                    Statement stmt = CONNECTION.createStatement();
                    Ini.Section section = new Ini(new File(DATABASE_QUERIES)).get("creation_queries");
                    stmt.executeUpdate(section.get(table));
                    stmt.close();
                } catch (Exception e) {
                    LOGGER.debug(e);
                }
            }
            LOGGER.debug("{} tables have been initialized.", availableTables.length);

            long initialDelay = getNextDatabaseReset();
            final ScheduledFuture<?> leaderboardHandler = scheduler.scheduleAtFixedRate(
                    resetDatabase, initialDelay, TimeUnit.DAYS.toSeconds(1), SECONDS);

            LOGGER.debug("Next leaderboard reset in: {} minutes.", initialDelay / 60);

        } catch (Exception e) {
            LOGGER.error(e);
        }
    }

    /* AUTOMATION */

    final long getNextDatabaseReset() {
        LocalDateTime startOfNextDay = LocalDate.now().plusDays(1).atStartOfDay();
        long startOfNextDaySeconds = startOfNextDay.atZone(ZoneId.systemDefault()).toEpochSecond();
        return startOfNextDaySeconds - (System.currentTimeMillis() / 1000);
    }

    final Runnable resetDatabase = () -> {
        try (Statement stmt = CONNECTION.createStatement()) {
            stmt.executeUpdate("TRUNCATE TABLE leaderboard");
            stmt.executeUpdate("TRUNCATE TABLE daily_missions");
            Progression.streakCheck();
            LOGGER.debug("Successfully reset database tables.");
        } catch (SQLException e) {
            LOGGER.error("Failed to reset database tables", e);
        }
    };

    /* GETTERS */

    public String getValue(String table, String column, String where, Object value) {
        String sql = "SELECT " + column + " FROM " + table + " WHERE " + where + " = ?";

        try (PreparedStatement preparedStmt = CONNECTION.prepareStatement(sql)) {
            preparedStmt.setObject(1, value);
            try (ResultSet results = preparedStmt.executeQuery()) {
                if (results.next()) {
                    return results.getString(column);
                } else {
                    return null;
                }
            }
        } catch (Exception e) {
            LOGGER.debug(e);
            return null;
        }
    }

    public String getValueWith2Conditions(String table, String column, String where, Object value, String where2, Object value2) {
        String sql = "SELECT " + column + " FROM " + table + " WHERE " + where + " = ? AND " + where2 + " = ?";

        try (PreparedStatement preparedStmt = CONNECTION.prepareStatement(sql)) {
            preparedStmt.setObject(1, value);
            preparedStmt.setObject(2, value2);

            try (ResultSet results = preparedStmt.executeQuery()) {
                if (results.next()) {
                    return results.getString(column);
                }
            }
        } catch (SQLException e) {
            LOGGER.error("Error fetching value with conditions: ", e);
        }
        return null;
    }

    public ArrayList<String> getUserData(String userID) throws SQLException {
        String sql = "SELECT accounts.username, progress.streak, progress.level, progress.xp " +
                "FROM accounts " +
                "JOIN progress ON accounts.user_id = progress.user_id " +
                "WHERE accounts.user_id = ?";
        try (PreparedStatement preparedStmt = CONNECTION.prepareStatement(sql)) {
            preparedStmt.setString(1, userID);
            return getStrings(preparedStmt);
        } catch (Exception e) {
            LOGGER.debug(e);
            return null;
        }
    }

    public ArrayList<String> getAllCardData(String card_id) {
        String sql = "SELECT question, solution,category FROM flashcards WHERE card_id = ?";
        try (PreparedStatement preparedStmt = CONNECTION.prepareStatement(sql)) {
            preparedStmt.setString(1, card_id);
            return getStrings(preparedStmt);
        } catch (Exception e) {
            LOGGER.debug(e);
            return null;
        }
    }

    public HashMap<String, String> getQuestionAndSolution(String card_id) {
        String sql = "SELECT question,solution FROM flashcards WHERE card_id = ?";
        try (PreparedStatement preparedStmt = CONNECTION.prepareStatement(sql)) {
            preparedStmt.setString(1, card_id);
            return getStringString(preparedStmt);
        } catch (Exception e) {
            LOGGER.debug(e);
            return null;
        }
    }

    private ArrayList<String> getStrings(PreparedStatement preparedStmt) throws SQLException {
        try (ResultSet results = preparedStmt.executeQuery()) {
            if (!results.next()) {
                return null;
            } else {
                ArrayList<String> resultList = new ArrayList<>();
                ResultSetMetaData metadata = results.getMetaData();
                int columnCount = metadata.getColumnCount();
                do {
                    for (int i = 1; i <= columnCount; i++) {
                        String resultString = results.getString(i);
                        resultList.add(resultString);
                    }
                } while (results.next());
                return resultList;
            }
        }
    }

    public ArrayList<String> getAllValuesFromTable(String table) {
        String sql = "SELECT * FROM " + table;
        try (PreparedStatement preparedStmt = CONNECTION.prepareStatement(sql)) {
            return getStrings(preparedStmt);
        } catch (Exception e) {
            LOGGER.debug(e);
            return null;
        }
    }

    public ArrayList<String> getAllValuesByType(String table, String column, String where, Object value) {
        String sql = "SELECT " + column + " FROM " + table + " WHERE " + where + " = ?";

        try (PreparedStatement preparedStmt = CONNECTION.prepareStatement(sql)) {
            preparedStmt.setString(1, (String) value);
            return getStrings(preparedStmt);
        } catch (Exception e) {
            LOGGER.debug(e);
            return null;
        }
    }

    public HashMap<String, String[]> getFlashCardsByCategory(String user_id, String category) {
        String sql = "SELECT card_id, question, solution FROM flashcards WHERE user_id = ? AND category = ?";

        try (PreparedStatement preparedStmt = CONNECTION.prepareStatement(sql)) {
            preparedStmt.setString(1, user_id);
            preparedStmt.setString(2, category);
            return getStringArrayMap(preparedStmt);
        } catch (Exception e) {
            LOGGER.debug(e);
            return null;
        }
    }

    public Set<String> getAllFlashcardIDsFromUser(String user_id) {
        String sql = "SELECT card_id FROM flashcards WHERE user_id = ?";
        try (PreparedStatement preparedStmt = CONNECTION.prepareStatement(sql)) {
            preparedStmt.setString(1, user_id);
            ResultSet result = preparedStmt.executeQuery();

            Set<String> resultMap = new HashSet<>() {
            };
            while (result.next()) {
                resultMap.add(result.getString("card_id"));
            }
            return resultMap.isEmpty() ? null : resultMap;
        } catch (Exception e) {
            LOGGER.debug(e);
            return null;
        }
    }


    public HashMap<String, Integer> getCategoriesByOwner(String user_id) {
        String sql = "SELECT category, COUNT(question) FROM flashcards WHERE user_id = ? GROUP BY category";

        try (PreparedStatement preparedStmt = CONNECTION.prepareStatement(sql)) {
            preparedStmt.setString(1, user_id);
            return getStringIntegerHashMap(preparedStmt);
        } catch (Exception e) {
            LOGGER.debug(e);
            return null;
        }
    }

    public ArrayList<Streak> getStreaks() {
        String sql = "SELECT user_id, streak, date FROM progress";
        try (PreparedStatement preparedStmt = CONNECTION.prepareStatement(sql);
             ResultSet results = preparedStmt.executeQuery()) {

            ArrayList<Streak> resultList = new ArrayList<>();
            while (results.next()) {
                String user_id = results.getString("user_id");
                int streak = results.getInt("streak");
                long last_completion = results.getLong("date");
                resultList.add(new Streak(user_id, streak, last_completion));
            }
            return resultList;
        } catch (SQLException e) {
            LOGGER.error("Error retrieving streaks from database", e);
            return new ArrayList<>();
        }
    }

    @Nullable
    private HashMap<String, String[]> getStringArrayMap(PreparedStatement preparedStmt) throws SQLException {
        try (ResultSet results = preparedStmt.executeQuery()) {
            HashMap<String, String[]> resultList = new HashMap<>();
            ResultSetMetaData metadata = results.getMetaData();

            int columnCount = metadata.getColumnCount();
            while (results.next()) {
                for (int i = 1; i <= columnCount; i += 3) {
                    String card_id = results.getString(i);
                    String question = results.getString(i + 1);
                    String answer = results.getString(i + 2);
                    resultList.put(card_id, new String[]{question, answer});
                }
            }
            return resultList.isEmpty() ? null : resultList;
        }
    }

    @Nullable
    private HashMap<String, String> getStringString(PreparedStatement preparedStmt) throws SQLException {
        try (ResultSet results = preparedStmt.executeQuery()) {
            HashMap<String, String> resultList = new HashMap<>();
            ResultSetMetaData metadata = results.getMetaData();

            int columnCount = metadata.getColumnCount();
            while (results.next()) {
                for (int i = 1; i <= columnCount; i += 2) {
                    String question = results.getString(i);
                    String answer = results.getString(i + 1);
                    resultList.put(question, answer);
                }
            }
            return resultList.isEmpty() ? null : resultList;
        }
    }

    private HashMap<String, Integer> getStringIntegerHashMap(PreparedStatement preparedStmt) throws SQLException {
        try (ResultSet results = preparedStmt.executeQuery()) {
            HashMap<String, Integer> resultList = new HashMap<>();

            while (results.next()) {
                String category = results.getString(1); // category is in the first column
                int count = results.getInt(2); // count of questions is in the second column
                resultList.put(category, count);
            }
            return resultList;
        }
    }

    /* UPDATERS */

    public void updateValues(String table, String column, String where, String whereValue, Object value) {
        String sql = "UPDATE " + table + " SET " + column + " = ? WHERE " + where + "=" + whereValue;
        executeStatement(value, sql);
    }

    public void updateFlashcard(String card_id, String question, String solution, String category) {
        String sql = "UPDATE flashcards SET question = ?, solution = ?, category = ? WHERE card_id = ?";
        try (PreparedStatement stmt = CONNECTION.prepareStatement(sql)) {
            stmt.setString(1, question);
            stmt.setString(2, solution);
            stmt.setString(3, category);
            stmt.setString(4, card_id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            LOGGER.debug(e);
        }
    }

    public void updateIncrementedValue(String table, String column, String where, String whereValue, int value) {
        String sql = "UPDATE " + table + " SET " + column + " = " + column + " + ? WHERE " + where + " = ?";
        try (PreparedStatement stmt = CONNECTION.prepareStatement(sql)) {
            stmt.setInt(1, value);
            stmt.setString(2, whereValue);
            stmt.executeUpdate();
        } catch (SQLException e) {
            LOGGER.debug(e);
        }
    }

    public void updateStreak(String user_id) {
        String sql = "UPDATE progress SET date = ?, streak = streak + ? WHERE user_id = ?";
        try (PreparedStatement stmt = CONNECTION.prepareStatement(sql)) {
            String currentDate = String.valueOf(Instant.now().getEpochSecond());
            stmt.setString(1, currentDate);
            stmt.setInt(2, 1);
            stmt.setString(3, user_id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            LOGGER.debug(e);
        }
    }

    public void updateIncrementedValueWithTwo(String table, String column, String where,
                                              String whereValue, String where2, String whereValue2, int value) {
        String sql = "UPDATE " + table + " SET " + column + " = " + column + " + ? WHERE " + where + " = ? AND " + where2 + " = ?";
        try (PreparedStatement stmt = CONNECTION.prepareStatement(sql)) {
            stmt.setInt(1, value);
            stmt.setString(2, whereValue);
            stmt.setString(3, whereValue2);
            stmt.executeUpdate();
        } catch (SQLException e) {
            LOGGER.debug(e);
        }
    }

    public void deleteValue(String table, String where, Object value) {
        String sql = "DELETE FROM " + table + " WHERE " + where + " = ?";
        executeStatement(value, sql);
    }

    public void deleteValueWhereTwo(String table, String where, String whereValue1, String where2, String whereValue2) {
        String sql = "DELETE FROM " + table + " WHERE " + where + " = ? AND " + where2 + " = ?";
        try (PreparedStatement stmt = CONNECTION.prepareStatement(sql)) {
            stmt.setString(1, whereValue1);
            stmt.setString(2, whereValue2);
            stmt.executeUpdate();
        } catch (SQLException e) {
            LOGGER.debug(e);
        }
    }

    public Integer insertValues(String table, String[] columns, String[] values) {
        int valueAmount = values.length;

        String[] questionMarks = new String[valueAmount];
        Arrays.fill(questionMarks, "?");

        try {
            String insertSQL = "INSERT INTO " + table + " (" + String.join(",", columns) + ") VALUES (" + String.join(",", questionMarks) + ")";
            PreparedStatement stmt = CONNECTION.prepareStatement(insertSQL);
            int startingIndex = 1;
            for (String value : values) {
                stmt.setString(startingIndex, value);
                startingIndex++;
            }
            stmt.executeUpdate();

            Statement getLastID = CONNECTION.createStatement();
            ResultSet idResult = getLastID.executeQuery("SELECT last_insert_rowid()");
            if (idResult.next()) {
                return idResult.getInt(1);
            }
            stmt.close();
            getLastID.close();
            LOGGER.debug("{} values have been added to the database.", valueAmount);
        } catch (Exception e) {
            LOGGER.debug(e);
        }
        return -1;
    }

    private void executeStatement(Object value, String sql) {
        if (value == null) {
            return;
        }
        try {
            PreparedStatement preparedStmt = CONNECTION.prepareStatement(sql);
            preparedStmt.setObject(1, value);
            preparedStmt.executeUpdate();
            preparedStmt.close();
        } catch (Exception e) {
            LOGGER.debug(e);
        }

    }
}
