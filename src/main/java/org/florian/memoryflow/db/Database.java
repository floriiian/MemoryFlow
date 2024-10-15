package org.florian.memoryflow.db;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.File;
import java.sql.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

import org.ini4j.Ini;


public class Database {

    private static Database instance;

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
        String DATABASE_QUERIES = "src/main/java/org/florian/memoryflow/db/sql_queries.ini";

        try {
            Class.forName("org.sqlite.JDBC");
            CONNECTION = DriverManager.getConnection(DATABASE_URL);
            LOGGER.debug("Connected to {}", DATABASE_URL);

            String[] availableTables = new String[]{
                    "create_account_table",
                    "create_flashcard_table",
                    "create_progress_table"
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
            LOGGER.debug("{} tables have been created.", availableTables.length);
        } catch (Exception e) {
            LOGGER.error(e);
        }
    }

    /* GETTERS */

    public String getValue(String table, String column, String where, Object value) {
        String sql = "SELECT " + column + " FROM " + table + " WHERE " + where + " = ?";

        try (PreparedStatement preparedStmt = CONNECTION.prepareStatement(sql)) {
            if (value instanceof Integer) {
                preparedStmt.setInt(1, (Integer) value);
            } else if (value instanceof String) {
                preparedStmt.setString(1, (String) value);
            } else {
                LOGGER.debug("Invalid datatype");
                return null;
            }
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

    public ArrayList<String> getAllValuesByType(String table, String column, String where, Object value) {
        String sql = "SELECT " + column + " FROM " + table + " WHERE " + where + " = ?";

        try (PreparedStatement preparedStmt = CONNECTION.prepareStatement(sql)) {
            preparedStmt.setString(1, (String) value);
            try (ResultSet results = preparedStmt.executeQuery()) {
                if (!results.next()) {
                    return null;
                } else {
                    ArrayList<String> resultList = new ArrayList<>();
                    ResultSetMetaData metadata = results.getMetaData();
                    int columnCount = metadata.getColumnCount();

                    while (results.next()) {
                        StringBuilder row = new StringBuilder();
                        for (int i = 1; i <= columnCount; i++) {
                            String resultString = results.getString(i);
                            if (!resultList.contains(resultString)) {
                                row.append(resultString);
                                resultList.add(row.toString());
                            }
                        }
                    }
                    return resultList;
                }
            }
        } catch (Exception e) {
            LOGGER.debug(e);
            return null;
        }
    }

    public HashMap<String, String> getFlashCardsByOwner(String user_id, String category) {
        String sql = "SELECT question, solution FROM flashcards WHERE user_id = ? AND category = ?";

        try (PreparedStatement preparedStmt = CONNECTION.prepareStatement(sql)) {
            preparedStmt.setString(1, user_id);
            preparedStmt.setString(2, category);
            try (ResultSet results = preparedStmt.executeQuery()) {
                if (!results.next()) {
                    return null;
                } else {
                    HashMap<String, String> resultList = new HashMap<>();
                    ResultSetMetaData metadata = results.getMetaData();
                    int columnCount = metadata.getColumnCount();

                    while (results.next()) {
                        for (int i = 1; i <= columnCount; i += 2) {
                            String question = results.getString(i);
                            String solution = results.getString(i + 1);
                            resultList.put(question, solution);
                        }
                    }
                    return resultList;
                }
            }
        } catch (Exception e) {
            LOGGER.debug(e);
            return null;
        }
    }






    /* UPDATERS */

    public void updateValues(String table, String column, String where, String whereValue, Object value) {
        String sql = "UPDATE " + table + " SET " + column + " = ? WHERE " + where + "=" + whereValue;
        executeStatement(value, sql);
    }

    public void deleteValue(String table, String where, Object value) {
        String sql = "DELETE FROM " + table + " WHERE " + where + " = ?";
        executeStatement(value, sql);
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
            if (value instanceof String) {
                preparedStmt.setString(1, (String) value);
            } else if (value instanceof Integer) {
                preparedStmt.setInt(1, (Integer) value);
            } else {
                LOGGER.debug("Update failed, unsupported datatype.");
            }
            preparedStmt.executeUpdate();
            preparedStmt.close();
        } catch (Exception e) {
            LOGGER.debug(e);
        }
    }
}