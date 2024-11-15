package org.florian.memoryflow.db;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.http.Context;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.florian.memoryflow.account.Login;
import org.florian.memoryflow.api.requests.CardSessionRequest;
import org.florian.memoryflow.api.responses.ErrorResponse;

import org.florian.memoryflow.api.responses.endFlashcardSessionResponse;
import org.florian.memoryflow.session.FlashcardSession;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import redis.clients.jedis.*;

import java.util.HashMap;
import java.util.Set;

public class Redis {

    final static private Logger LOGGER = LogManager.getLogger();
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final Database db = Database.getInstance();
    static JedisPool jedisPool = new JedisPool(new JedisPoolConfig(), "localhost", 6379);

    public static void addFlashcardSession(boolean isLoggedIn, String requestedData, Context ctx) throws Exception {
        if (!isLoggedIn  || isRedisOffline()) {
            ctx.status(500);
            return;
        }
        int user_id = Integer.parseInt(Login.getAccountIDByToken(ctx.cookie("sessionToken")));
        deleteFlashcardSession(user_id);

        CardSessionRequest request = OBJECT_MAPPER.readValue(requestedData, CardSessionRequest.class);
        String[] card_ids = request.card_ids();
        try (Jedis jedis = jedisPool.getResource()) {
            Set<String> flashcardIDs = db.getAllFlashcardIDsFromUser(String.valueOf(user_id));
            HashMap<String, HashMap<String, String>> flashcardData = new HashMap<>();
            for (String card_id : card_ids) {
                if (!flashcardIDs.contains(card_id)) {
                    returnFailedRequest(ctx, "Unknown card id", user_id);
                    return;
                }
                flashcardData.put(card_id,  db.getQuestionAndSolution(String.valueOf(card_id)));
            }
            if (flashcardData.isEmpty()) {
                returnFailedRequest(ctx, "No flashcards found", user_id);
            } else {
                String sessionObject = OBJECT_MAPPER.writeValueAsString(new FlashcardSession(flashcardData));
                jedis.set("flashcardSession:" + user_id, sessionObject);
                ctx.status(200);
                ctx.contentType("application/json");
                ctx.result(sessionObject);
            }
        } catch (Exception e) {
            ctx.status(500);
            LOGGER.debug(e);
        }
    }

    public static void evaluateAnswer(boolean isLoggedIn, JsonNode jsonData, Context ctx) throws Exception {
        if (!isLoggedIn || isRedisOffline()) {
            ctx.status(500);
            return;
        }
        int user_id = Integer.parseInt(Login.getAccountIDByToken(ctx.cookie("sessionToken")));
        try {
            String answer = jsonData.get("answer").asText();
            String card_id = jsonData.get("card_id").asText();
            FlashcardSession user_session = getFlashcardSession(user_id);
            if (user_session == null) {
                returnFailedRequest(ctx, null, user_id);
                return;
            }

            HashMap<String, HashMap<String, String>> flashcards = user_session.getFlashcards();
            boolean solution = flashcards.get(card_id).containsValue(answer);
            if (solution) {
                user_session.addCorrect();
                flashcards.remove((card_id));
            } else {
                user_session.addMistake();
                ctx.status(500);
            }
            updateFlashcardSession(user_id, user_session);
        } catch (Exception e) {
            ctx.status(400);
            LOGGER.debug(e);
        }
    }

    public static void endFlashcardSession(Context ctx) throws Exception {
        int user_id = Integer.parseInt(Login.getAccountIDByToken(ctx.cookie("sessionToken")));

        FlashcardSession session = getFlashcardSession(user_id);
        if (session == null) {
            returnFailedRequest(ctx, "No active session", user_id);
            return;
        }
        if(isRedisOffline()){
            ctx.status(500);
            return;
        }

        int correct = session.getCorrect();
        int mistakes = session.getMistakes();
        long collectedXP = Math.min(Math.round(correct * 20 - (mistakes * 0.5)), 1000);

        // TODO: Implement support for daily-missions.
        deleteFlashcardSession(user_id);
        ctx.status(200);
        ctx.contentType("application/json");
        ctx.result(OBJECT_MAPPER.writeValueAsString(new endFlashcardSessionResponse(correct, mistakes, collectedXP)));
    }

    private static void deleteFlashcardSession(int user_id) {
        try (Jedis jedis = jedisPool.getResource()) {
            jedis.del("flashcardSession:" + user_id);
        } catch (Exception e) {
            LOGGER.debug("Redis Database is probably offline.");
        }
    }

    private static boolean isRedisOffline() {
        try (Jedis _ = jedisPool.getResource()) {
            return false;
        } catch (Exception e) {
            LOGGER.debug("Redis is most likely offline.");
            return true;
        }
    }

    private static void updateFlashcardSession(int user_id, FlashcardSession session) {
        try (Jedis jedis = jedisPool.getResource()) {
            jedis.set("flashcardSession:" + user_id, OBJECT_MAPPER.writeValueAsString(session));
        } catch (Exception e) {
            LOGGER.debug(e);
        }
    }

    @Nullable
    private static FlashcardSession getFlashcardSession(int user_id) {
        try (Jedis jedis = jedisPool.getResource()) {
            return OBJECT_MAPPER.readValue(jedis.get("flashcardSession:" + user_id), FlashcardSession.class);
        } catch (Exception e) {
            return null;
        }
    }

    private static void returnFailedRequest(@NotNull Context ctx, String errorMessage, int user_id) throws Exception {
        ctx.status(400);
        ctx.contentType("application/json");
        ctx.result(OBJECT_MAPPER.writeValueAsString(new ErrorResponse(errorMessage)));
        deleteFlashcardSession(user_id);
    }
}

