package org.florian.memoryflow.account;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
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
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final Database DB = Database.getInstance();
    private static final Base64.Decoder BASE64_DECODER = Base64.getUrlDecoder();

    final static int HOUR = 3600;
    final static int REFRESH_TOKEN_LIFETIME = 720;
    final static int ACCESS_TOKEN_LIFETIME = 900;
    final static int CURRENT_SECONDS = (int) (System.currentTimeMillis() / 1000);

    public static void handleLoginRequest(Context ctx, LoginRequest decodedJson) throws JsonProcessingException {

        String username = decodedJson.username();
        String password = decodedJson.password();

        Object[] loginAttempt = loginAccount(username, password);
        String status = loginAttempt[0].toString();
        Boolean success = (Boolean) loginAttempt[1];

        if (success) {
            String user_id = DB.getValue("accounts", "user_id", "username", username);
            String webToken = createWebToken(user_id, 0);
            ctx.removeCookie("sessionToken");
            ctx.removeCookie("refreshToken");
            ctx.cookie("sessionToken", webToken);
            ctx.cookie("refreshToken", webToken);
            DB.updateValues("accounts", "token", "user_id", user_id, webToken);
        }
        ctx.status(success ? 200 : 500);
        ctx.contentType("application/json");
        ctx.result(OBJECT_MAPPER.writeValueAsString(new LoginResponse(status)));
    }

    public static boolean validateSessionToken(String accessToken, String refreshToken, Context ctx) {
        try {
            Object[] refreshTokenData = checkRefreshToken(refreshToken);
            if (!((boolean) refreshTokenData[0])) {
                return false;
            } else if (!checkAccessToken(accessToken)) {
                ctx.removeCookie("sessionToken");
                ctx.cookie("sessionToken", createWebToken(accessToken, 0));
                LOGGER.debug("HERE!!!!!! IT HAPPENED YOU DUMB ASS RETARD ");
                return true;
            } else {
                return true;
            }
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

    public static String createWebToken(String accountID, int currentTime) throws JsonProcessingException {

        Map<String, Object> jsonPayload = new HashMap<>();
        Map<String, String> jsonHeader = new HashMap<>();

        jsonHeader.put("alg", "HS256");
        jsonHeader.put("typ", "JWT");

        if (currentTime == 0) {
            currentTime = CURRENT_SECONDS;
        }

        jsonPayload.put("id", accountID);
        jsonPayload.put("iat", currentTime);

        String payload = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(OBJECT_MAPPER.writeValueAsString(jsonPayload).getBytes());

        String header = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(OBJECT_MAPPER.writeValueAsString(jsonHeader).getBytes());

        String secureKey = System.getenv("jTokenKey");
        String signature = generateSignature(header, payload, secureKey);

        return header + "." + payload + "." + signature;
    }

    private static String generateSignature(String header, String payload, String secret) {
        try {
            String data = header + "." + payload;
            SecretKeySpec signingKey = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(signingKey);
            byte[] rawSignature = mac.doFinal(data.getBytes());
            return Base64.getUrlEncoder().withoutPadding().encodeToString(rawSignature);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate JWT signature", e);
        }
    }

    private static Object[] checkRefreshToken(String refreshToken) throws JsonProcessingException {
        JsonNode refreshTokenJSON = OBJECT_MAPPER.readTree(decodeToken(refreshToken));
        String refreshTokenAccountID = refreshTokenJSON.get("id").asText();
        int refreshTokenIssued = refreshTokenJSON.get("iat").asInt();

        if (refreshTokenAccountID == null || refreshTokenIssued == 0) {
            return new Object[]{false};
        }
        if ((refreshTokenIssued / HOUR) + REFRESH_TOKEN_LIFETIME <= (CURRENT_SECONDS / HOUR)) {
            return new Object[]{false};
        } else return new Object[]{
                refreshToken.equals(DB.getValue("accounts", "token", "user_id", refreshTokenAccountID)),
                refreshTokenAccountID
        };
    }

    private static boolean checkAccessToken(String accessToken) throws JsonProcessingException {
        String decodedJson = decodeToken(accessToken);
        if (decodedJson == null) {
            return false;
        } else {
            JsonNode accessTokenJSON = OBJECT_MAPPER.readTree(decodedJson);
            String accessTokenAccountID = accessTokenJSON.get("id").asText();
            int accessTokenIssued = accessTokenJSON.get("iat").asInt();

            if (accessTokenAccountID == null || accessTokenIssued == 0) {
                return false;

            } else if (accessTokenIssued + ACCESS_TOKEN_LIFETIME <= CURRENT_SECONDS) {
                return false;
            } else {
                return accessToken.equals(createWebToken(accessTokenAccountID, accessTokenIssued));
            }
        }
    }

    private static String decodeToken(String token) {
        try {
            byte[] tokenPayload = BASE64_DECODER.decode(token.split("\\.")[1]);
            return new String(tokenPayload, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return null;
        }
    }

    public static String getAccountIDByToken(String token) throws Exception {

        DecodedJWT jwt = JWT.decode(token);
        return jwt.getClaim("id").asString();
    }
}
