package org.florian.memoryflow.account;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.http.Context;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.florian.memoryflow.api.requests.LoginRequest;
import org.florian.memoryflow.api.responses.LoginResponse;
import org.florian.memoryflow.db.Database;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

public class Login {

    static final private Logger LOGGER = LogManager.getLogger();
    private static final BCryptPasswordEncoder BCRYPT = new BCryptPasswordEncoder();
    public static ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final Database DB = Database.getInstance();
    private static final Base64.Decoder BASE64_DECODER = Base64.getUrlDecoder();
    private static final Base64.Encoder BASE64_ENCODER = Base64.getUrlEncoder();

    public static void handleLoginRequest(Context ctx, LoginRequest decodedJson) throws JsonProcessingException {

        String username = decodedJson.username();
        String password = decodedJson.password();

        Object[] loginAttempt = loginAccount(username, password);
        String status = loginAttempt[0].toString();
        Boolean success = (Boolean) loginAttempt[1];

        if (success) {
            String user_id = DB.getValue("accounts", "user_id", "username", username);
            ctx.cookieStore().set("sessionToken", createWebToken(user_id, 0));
        }
        ctx.status(success ? 200 : 500);
        ctx.result(OBJECT_MAPPER.writeValueAsString(new LoginResponse(status)));
    }

    public static boolean validateSessionToken(String sessionToken) {

        try {
            byte[] payload = BASE64_DECODER.decode(sessionToken.split("\\.")[1]);
            String decodedPayload = new String(payload, StandardCharsets.UTF_8);

            JsonNode jsonNode = OBJECT_MAPPER.readTree(decodedPayload);
            String accountID = jsonNode.get("id").asText();
            int issuedAt = jsonNode.get("iat").asInt();

            return sessionToken.equals(createWebToken(accountID, issuedAt));

        } catch (Exception e) {
            LOGGER.debug("Error while validating session-token", e);
            return false;
        }
    }

    private static Object[] loginAccount(String username, String password) {
        if (username == null || password == null) {
            return new Object[]{"Missing Credentials", false};
        }
        String hashedPassword = DB.getValue("accounts", "password", "username", username);
        if (hashedPassword == null) {
            return new Object[]{"User doesn't exist.", false};
        }
        if (DB.getValue("accounts", "verified", "username", username) == null) {
            return new Object[]{"User isn't verified.", false};
        }
        if (BCRYPT.matches(password, hashedPassword)) {
            return new Object[]{"Successful Login", true};

        } else {
            LOGGER.debug("Wrong password for {}", username);
            return new Object[]{"Wrong username or password", false};
        }
    }

    private static String createWebToken(String accountID, int currentTime) throws JsonProcessingException {

        Map<String, String> jsonPayload = new HashMap<>();
        Map<String, String> jsonHeader = new HashMap<>();

        jsonHeader.put("alg", "HS256");
        jsonHeader.put("typ", "JWT");

        if (currentTime == 0) {
            currentTime = (int) (System.currentTimeMillis() / 1000);
        }

        jsonPayload.put("id", accountID);
        jsonPayload.put("iat", String.valueOf(currentTime));

        String payload = Base64.getUrlEncoder().withoutPadding().encodeToString(
                OBJECT_MAPPER.writeValueAsString(jsonPayload).getBytes());

        String header = Base64.getUrlEncoder().withoutPadding().encodeToString(
                OBJECT_MAPPER.writeValueAsString(jsonHeader).getBytes());

        // setx jTokenKey "MA4tsJ8WXxf6IxZVbDQvTfk93hJ0pTId"

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
            throw new RuntimeException("Failed to generate HMAC signature: ", e);
        }
    }
}
