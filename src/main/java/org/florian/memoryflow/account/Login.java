package org.florian.memoryflow.account;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.florian.memoryflow.db.Database;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class Login {

    final private Logger LOGGER = LogManager.getLogger();
    private final BCryptPasswordEncoder BCRYPT = new BCryptPasswordEncoder();
    Database db = Database.getInstance();

    public void loginAccount(String username, String password) {
        if (username == null || password == null) {
            LOGGER.debug("Username and password is null!");
            return;
        }
        String hashedPassword = db.getValue("accounts", "password", "username", username);
        if (hashedPassword == null) {
            return;
        }
        if (db.getValue("accounts", "verified", "username", username) == null){
            LOGGER.debug("User {} is not verified", username);
            return;
        }
        if (BCRYPT.matches(password, hashedPassword)) {
            LOGGER.debug("{} logged in.", username);
        } else {
            LOGGER.debug("Wrong password for {}", username);
        }
    }
}
