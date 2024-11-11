package org.florian.memoryflow.db;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.http.Context;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.florian.memoryflow.account.Login;
import org.florian.memoryflow.api.responses.ErrorResponse;

import org.florian.memoryflow.session.FlashcardSession;
import redis.clients.jedis.*;

import java.util.ArrayList;
import java.util.HashMap;

public class Redis {

    final static private Logger LOGGER = LogManager.getLogger();
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final Database db = Database.getInstance();
    static JedisPool jedisPool = new JedisPool(new JedisPoolConfig(), "localhost", 6379);

    public static void addFlashcardSession(boolean isLoggedIn, JsonNode jsonData, Context ctx) throws Exception {
        if (!isLoggedIn) {
            ctx.status(500);
            return;
        }
        int user_id = Integer.parseInt(Login.getAccountIDByToken(ctx.cookie("sessionToken")));
        String cardIdText = String.valueOf(jsonData.get("card_ids"));

        LOGGER.debug(cardIdText);
        int[] card_ids = {34, 2};

        try (Jedis jedis = jedisPool.getResource()) {
            deleteFlashcardSession(user_id); // TODO: Debug
            ArrayList<Integer> flashcardIDs = db.getAllFlashcardIDsFromUser(String.valueOf(user_id));
            HashMap<Integer, String> flashcardData = new HashMap<>();
            for (Integer card_id : card_ids) {
                if (!flashcardIDs.contains(card_id)) {
                    returnFailedRequest(ctx, "Exposed invalid card id", user_id);
                } else {
                    flashcardData.put(card_id, db.getSolution(String.valueOf(card_id)));
                }
            }
            String sessionObject = OBJECT_MAPPER.writeValueAsString(new FlashcardSession(flashcardData));
            jedis.set("flashcardSession:" + user_id, sessionObject);
            ctx.status(200);
            ctx.contentType("application/json");
            ctx.result(sessionObject);
        } catch (Exception e) {
            LOGGER.debug(e);
        }
    }

    public static void evaluateAnswer(boolean isLoggedIn, JsonNode jsonData, Context ctx) throws Exception {
        if (!isLoggedIn) {
            ctx.status(500);
            return;
        }
        int user_id = Integer.parseInt(Login.getAccountIDByToken(ctx.cookie("sessionToken")));
        String answer = jsonData.get("answer").asText();
        int card_id = jsonData.get("card_id").asInt();

        FlashcardSession user_session = getFlashcardSession(user_id);

        if (user_session == null) {
            returnFailedRequest(ctx, null, user_id);
            return;
        }
        HashMap<Integer, String> flashcards = user_session.getFlashcards();
        String solution = flashcards.get(card_id);
        if (solution == null) {
            returnFailedRequest(ctx, "No solution found", user_id);
        } else {
            if (solution.equals(answer)) {
                user_session.addCorrect();
                flashcards.remove(card_id);
            } else {
                user_session.addMistake();
            }
            updateFlashcardSession(user_id, user_session);
        }
    }

    private static void deleteFlashcardSession(int user_id) {
        try (Jedis jedis = jedisPool.getResource()) {
            jedis.del("flashcardSession:" + user_id);
        }
    }

    private static void updateFlashcardSession(int user_id, FlashcardSession session) {
        try (Jedis jedis = jedisPool.getResource()) {
            jedis.set("flashcardSession:" + user_id, OBJECT_MAPPER.writeValueAsString(session));
        } catch (Exception e) {
            LOGGER.debug(e);
        }
    }

    private static FlashcardSession getFlashcardSession(int user_id) {
        try (Jedis jedis = jedisPool.getResource()) {
            return OBJECT_MAPPER.readValue(jedis.get("flashcardSession:" + user_id), FlashcardSession.class);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static void returnFailedRequest(Context ctx, String errorMessage, int user_id) throws Exception {
        ctx.status(500);
        ctx.contentType("application/json");
        ctx.result(OBJECT_MAPPER.writeValueAsString(new ErrorResponse(errorMessage)));
        deleteFlashcardSession(user_id);
    }
}

