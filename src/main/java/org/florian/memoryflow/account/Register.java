package org.florian.memoryflow.account;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.http.Context;

import org.florian.memoryflow.api.requests.RegisterRequest;
import org.florian.memoryflow.api.responses.RegisterResponse;

import org.florian.memoryflow.db.Database;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class Register {

    private static final Pattern USERNAME_REGEX = Pattern.compile("^[A-Za-z]\\w{1,20}$");
    private static final Pattern EMAIL_REGEX = Pattern.compile( "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$");
    private static final BCryptPasswordEncoder BCRYPT = new BCryptPasswordEncoder();
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    static Database db = Database.getInstance();


    public static void handleRegisterRequest(Context ctx, RegisterRequest decodedJson) throws JsonProcessingException {
        Object[] registerAttempt = registerAccount(
                decodedJson.username(), decodedJson.email(), decodedJson.password()
        );

        Boolean isSuccess = (Boolean) registerAttempt[0];
        String status = registerAttempt[1].toString();

        ctx.status(isSuccess ? 200 : 500);
        ctx.contentType("application/json");
        ctx.result(OBJECT_MAPPER.writeValueAsString(new RegisterResponse(status)));
    }

    public static Object[] registerAccount(String username, String email, String password) {
        if (username == null || email == null || password == null) {
            return new Object[]{false, "Invalid Credentials"};
        }
        Matcher usernameMatcher = USERNAME_REGEX.matcher(username);
        if (!usernameMatcher.matches() || username.length() > 20 || username.length() < 2) {
            return new Object[]{false, "Your username has to between 2 and 20 characters long."};
        }
        if (!isPasswordValid(password)) {
            return new Object[]{false, "Your password needs: an uppercase letter, a lowercase letter, a number, a symbol."};
        }
        Matcher emailMatcher = EMAIL_REGEX.matcher(email);
        if (!emailMatcher.matches()) {
            return new Object[]{false, "Invalid Email Address"};
        }
        if (db.getValue("accounts", "email", "email", email) == null
                && db.getValue("accounts", "username", "username", username) == null) {
            Integer user_id = db.insertValues(
                    "accounts",
                    new String[]{"username", "email", "password"},
                    new String[]{username, email, BCRYPT.encode(password)}
            );
            db.insertValues(
                    "progress",
                    new String[]{"user_id", "streak", "level", "xp"},
                    new String[]{user_id.toString(), db.DEFAULT_STREAK, db.DEFAULT_LEVEL, db.DEFAULT_XP}
            );
            return new Object[]{true, "Successfully registered"};
        } else {
            return new Object[]{false, "Account already exists."};
        }
    }


    private static boolean isPasswordValid(String password) {
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
