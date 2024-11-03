package org.florian.memoryflow.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.http.Context;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.florian.memoryflow.account.Login;
import org.florian.memoryflow.api.responses.CardCategoriesResponse;
import org.florian.memoryflow.api.responses.ErrorResponse;
import org.florian.memoryflow.db.Database;

import java.util.ArrayList;
import java.util.HashMap;


public class Flashcards {

    static Database db = Database.getInstance();
    static final private Logger LOGGER = LogManager.getLogger();
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public static void getFlashCardCategories(Context ctx) throws Exception {
        String user_id =  Login.getAccountIDByToken(ctx.cookie("sessionToken"));
        HashMap<String, Integer> values = db.getCategoriesByOwner(user_id);
        ctx.status(200);
        ctx.contentType("application/json");
        ctx.result(OBJECT_MAPPER.writeValueAsString(new CardCategoriesResponse(values)));

    }

    public void getFlashCardsByCategory(String user_id, String category) {
        HashMap<String, String> map = db.getFlashCardsByOwner(user_id, category);

        if (map != null) {
            map.forEach((key, value) -> {
                System.out.println("Key=" + key + ", Value=" + value);
            });
        }
    }

    private static String getCardFromUserId(String user_id, String question) {
        return db.getValueWith2Conditions(
                "flashcards", "question",
                "user_id", user_id,
                "question", question
        );
    }

    public static void handleFlashcardAdd(boolean validSession, JsonNode decodedJson, Context ctx) throws Exception {

        if (!validSession) {
            returnFailedRequest(ctx, "You're not logged in.");
            return;
        }

        String solution = decodedJson.get("solution").asText();
        String question = decodedJson.get("question").asText();
        String category = decodedJson.get("category").asText();

        if (category == null || category.isEmpty() || category.isBlank()) {
            returnFailedRequest(ctx, "Invalid category, try selecting a different one.");
        } else if (solution == null || solution.isEmpty()) {
            returnFailedRequest(ctx, "You haven't defined a solution.");
        } else if (question == null || question.isEmpty()) {
            returnFailedRequest(ctx, "You haven't defined a question.");
        } else if (solution.length() > 200) {
            returnFailedRequest(ctx, "Come on, storage isn't free, keep your answer under 200 letters.");
        } else if (question.length() > 200) {
            returnFailedRequest(ctx, "Come on, storage isn't free, keep your solution under 200 letters.");
        } else {
            String accountId = Login.getAccountIDByToken(ctx.cookie("sessionToken"));
            if (getCardFromUserId(accountId, question) != null) {
                returnFailedRequest(ctx, "You've already added a Flashcard with that question.");
            } else {
                addNewFlashcard(accountId, question, solution, category);
                ctx.status(200);
            }
        }
    }

    private static void returnFailedRequest(Context ctx, String input) throws JsonProcessingException {
        ctx.status(500);
        ctx.contentType("application/json");
        ctx.result(OBJECT_MAPPER.writeValueAsString(new ErrorResponse(input)));
    }

    public static void addNewFlashcard(String user_id, String question, String solution, String category) {

        db.insertValues(
                "flashcards",
                new String[]{"question", "solution", "category", "user_id"},
                new String[]{question, solution, category, user_id}
        );
    }

    public void removeFlashcard(String user_id, Integer card_id) {
        String cardOwner = db.getValue("flashcards", "user_id", "card_id", card_id);

        if (!cardOwner.equals(user_id)) {
            LOGGER.debug("{} tried to remove card with id {}.", user_id, card_id);
        } else {
            db.deleteValue("flashcards", "card_id", card_id);
            LOGGER.debug("Successfully deleted: {}.", card_id);
        }
    }

    public void updateFlashcard(String user_id, String card_id, String question, String solution, String category) {
        String cardOwner = db.getValue("flashcards", "user_id", "card_id", card_id);

        if (!cardOwner.equals(user_id)) {
            LOGGER.debug("{} tried to edit card with id {}.", user_id, card_id);
        } else {
            if (!StringUtils.isBlank(question)) {
                updateField("question", question, card_id);
            }
            if (!StringUtils.isBlank(solution)) {
                updateField("solution", solution, card_id);
            }
            if (!StringUtils.isBlank(category)) {
                updateField("category", category, card_id);
            }
            LOGGER.debug("Successfully updated: {}.", card_id);
        }
    }

    private void updateField(String column, String value, String card_id) {
        db.updateValues("flashcards", column, "card_id", card_id, value);
    }
}
