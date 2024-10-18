package org.florian.memoryflow.account;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.florian.memoryflow.api.requests.LoginRequest;
import org.florian.memoryflow.db.Database;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

public class Login {

    static final private Logger LOGGER = LogManager.getLogger();
    private static final BCryptPasswordEncoder BCRYPT = new BCryptPasswordEncoder();
    public static ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    static Database db = Database.getInstance();

    public static void handleLoginRequest(LoginRequest decodedJson) throws NoSuchAlgorithmException, JsonProcessingException {
        loginAccount(decodedJson.username(), decodedJson.password());
    }

    private static void loginAccount(String username, String password) throws JsonProcessingException {
        if (username == null || password == null) {
            LOGGER.debug("Username and password is null!");
            return;
        }
        String hashedPassword = db.getValue("accounts", "password", "username", username);
        if (hashedPassword == null) {
            return;
        }
        if (db.getValue("accounts", "verified", "username", username) == null) {
            LOGGER.debug("User {} is not verified", username);
            return;
        }
        if (BCRYPT.matches(password, hashedPassword)) {
            LOGGER.debug("{} logged in.", username);
            String accountID = db.getValue("accounts", "id", "username", username);

            LOGGER.debug(createWebToken(accountID));


        } else {
            LOGGER.debug("Wrong password for {}", username);
        }
    }

    private static String createWebToken(String accountID) throws JsonProcessingException {

        Map<String, String> jsonPayload = new HashMap<>();
        Map<String, String> jsonHeader = new HashMap<>();

        jsonHeader.put("alg", "HS256");
        jsonHeader.put("typ", "JWT");

        int currentTime = (int) (System.currentTimeMillis() / 1000);

        jsonPayload.put("id", accountID);
        jsonPayload.put("iat", String.valueOf(currentTime));

        String payload = Base64.getUrlEncoder().withoutPadding().encodeToString(
                OBJECT_MAPPER.writeValueAsString(jsonPayload).getBytes());

        String header = Base64.getUrlEncoder().withoutPadding().encodeToString(
                OBJECT_MAPPER.writeValueAsString(jsonHeader).getBytes());

        // set jTokenKey="php9FC5S/RZ.~1Z6duA4iMSY2&I8x#h+"
        String secureKey = System.getenv("jTokenKey");
        String signature = generateSignature(header, payload, secureKey);

        return header + "." + payload + "." + signature;
    }

    private static String generateSignature(String header, String payload, String secret) {
        try {
            String data = header + "." + payload;
            Mac hmacSHA256 = Mac.getInstance("HmacSHA256");   // MAC = MessageAuthenticationCode
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
            hmacSHA256.init(secretKeySpec);
            byte[] signatureBytes = hmacSHA256.doFinal(data.getBytes());

            return Base64.getUrlEncoder().withoutPadding().encodeToString(signatureBytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate HMAC signature", e);
        }
    }
}
