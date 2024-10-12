package org.florian.memoryflow.account;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.florian.memoryflow.db.Database;

import org.apache.commons.validator.routines.EmailValidator;

import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class Register {

    private final Pattern USERNAME_REGEX = Pattern.compile("^[A-Za-z]\\w{5,29}$");
    final static private Logger LOGGER = LogManager.getLogger();

    public void registerAccount(String username, String email, String password) {
        Database db = Database.getInstance();
        if (username == null || email == null || password == null) {
            return;
        }
        Matcher m = USERNAME_REGEX.matcher(username);
        if (!m.matches()) {
            return;
        }
        if (!isPasswordValid(password)) {
            return;
        }
        if (!EmailValidator.getInstance().isValid(email)) {
            return;
        }
        if (db.getValues("email", "email" , email) == null && db.getValues("username" , "username", username) == null) {
            db.addAccountToDatabase(username, email, password);
        }else{
            LOGGER.debug("{} has not been added.", email);
        }
    }

    private boolean isPasswordValid(String password) {
        int passwordLength = password.length();
        if (passwordLength < 10 || passwordLength > 100) {
            return false;
        }
        boolean hasSymbol = false, hasNumber = false, hasUppercase = false, hasLowercase = false;
        char[] passwordChars = password.toCharArray();

        for (char c : passwordChars) {
            if (Character.isUpperCase(c)) {
                hasUppercase = true;
            } else if (Character.isLowerCase(c)) {
                hasLowercase = true;
            } else if (Character.isDigit(c)) {
                hasNumber = true;
            } else if (!Character.isLetterOrDigit(c)) {
                hasSymbol = true;
            }
            if (hasSymbol && hasNumber && hasUppercase && hasLowercase) {
                return true;
            }
        }
        return false;
    }
}
