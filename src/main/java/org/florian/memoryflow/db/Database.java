package org.florian.memoryflow.db;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.File;
import java.sql.*;

import org.ini4j.Ini;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;


public class Database {

    private static Database instance;

    private Database() {
    }

    public static synchronized Database getInstance() {
        if (instance == null)
            instance = new Database();
        return instance;
    }

    private final String DEFAULT_LEVEL = "1";
    private final String DEFAULT_STREAK =  "0";
    private final String DEFAULT_XP =  "0";

    private static Connection CONNECTION = null;
    private static final Logger LOGGER = LogManager.getLogger();
    private final BCryptPasswordEncoder BCRYPT = new BCryptPasswordEncoder();

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

    public void addAccountToDatabase(String username, String email, String password) {
        insertValues(
                "accounts",
                new String[]{"username", "email", "password", "verified"},
                new String[]{username, email, BCRYPT.encode(password), "0"}
        );
        String user_id = getStringValue("accounts","user_id", "username", username);

        insertValues(
                "progress",
                new String[]{"user_id", "streak", "level", "xp"},
                new String[]{user_id,DEFAULT_STREAK, DEFAULT_LEVEL, DEFAULT_XP}
        );
    }

    /* GETTERS */

    private String getStringValue(String table, String column, String where, String value) {
        String sql = "SELECT " + column + " FROM" + table + "WHERE " + where + " = ?";

        try (PreparedStatement preparedStmt = CONNECTION.prepareStatement(sql)) {
            preparedStmt.setString(1, value);
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

    /* UPDATERS */

    public boolean updateProgress(String column, String where, String value) {
        String sql = "UPDATE progress SET " + column + " = ? WHERE " + where + " = ?";
        try {
            PreparedStatement preparedStmt = CONNECTION.prepareStatement(sql);
            preparedStmt.setString(1, value);
            preparedStmt.executeUpdate();
            preparedStmt.close();
            return true;
        } catch (Exception e) {
            LOGGER.debug(e);
            return false;
        }
    }

    private void insertValues(String table, String[] columns, String[] values) {
        int valueAmount = values.length;
        try {
            String account_insert = "INSERT INTO " + table + "(" + String.join(",", columns) + ") VALUES(" + "?".repeat(valueAmount) + ")";
            PreparedStatement stmt = CONNECTION.prepareStatement(account_insert);
            for (int i = 1; i < valueAmount + 1; i++) {
                stmt.setString(i, values[i]);
            }
            stmt.executeUpdate();
            stmt.close();
            LOGGER.debug("{} values have been added to the database.", valueAmount);
        } catch (Exception e) {
            LOGGER.debug(e);
        }
    }
}
