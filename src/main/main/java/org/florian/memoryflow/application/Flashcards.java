package org.florian.memoryflow.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.http.Context;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.florian.memoryflow.account.Login;
import org.florian.memoryflow.api.responses.CardCategoriesResponse;
import org.florian.memoryflow.api.responses.CardsDataResponse;
import org.florian.memoryflow.api.responses.CardsResponse;
import org.florian.memoryflow.api.responses.ErrorResponse;
import org.florian.memoryflow.db.Database;

import java.util.ArrayList;
import java.util.HashMap;


public class Flashcards {

    static Database db = Database.getInstance();
    static final private Logger LOGGER = LogManager.getLogger();
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public static void getFlashCardCategories(Context ctx) throws Exception {
        String user_id = Login.getAccountIDByToken(ctx.cookie("sessionToken"));
        HashMap<String, Object[]> values = db.getCategoriesByOwner(user_id);
        ctx.status(200);
        ctx.contentType("application/json");
        ctx.result(OBJECT_MAPPER.writeValueAsString(new CardCategoriesResponse(values)));
    }

    public static void getFlashcardsByCategory(boolean validSession, JsonNode decodedJson, Context ctx) throws Exception {
        if (isSessionInvalid(validSession, ctx)) {
            return;
        }
        String category = decodedJson.get("category").asText();
        String user_id = Login.getAccountIDByToken(ctx.cookie("sessionToken"));
        HashMap<String, String[]> map = db.getFlashCardsByCategory(user_id, category);

        if (map != null) {
            HashMap<String, String[]> cards = new HashMap<>(map);
            ctx.status(200);
            ctx.contentType("application/json");
            ctx.result(OBJECT_MAPPER.writeValueAsString(new CardsResponse(cards)));
        } else {
            returnFailedRequest(ctx, "No cards found for category " + category);
        }
    }

    public static void editFlashcard(boolean validSession, JsonNode decodedJson, Context ctx) throws Exception {
        if (isSessionInvalid(validSession, ctx)) {
            return;
        }
        String user_id = Login.getAccountIDByToken(ctx.cookie("sessionToken"));
        String card_id = decodedJson.get("card_id").asText();

        if (checkFlashcardOwner(user_id, card_id)) {

            String question = decodedJson.get("question").asText();
            String solution = decodedJson.get("solution").asText();
            String category = decodedJson.get("category").asText();

            db.updateFlashcard(card_id, question, solution, category);
            ctx.status(200);
        } else {
            returnFailedRequest(ctx, "You can't edit another users card.");
        }
    }

    public static void getFlashcardInfo(boolean validSession, JsonNode decodedJson, Context ctx) throws Exception {
        if (isSessionInvalid(validSession, ctx)) {
            return;
        }
        String user_id = Login.getAccountIDByToken(ctx.cookie("sessionToken"));
        String card_id = decodedJson.get("card_id").asText();

        if (checkFlashcardOwner(user_id, card_id)) {
            ArrayList<String> cardData = db.getAllCardData(card_id);
            ctx.contentType("application/json");
            ctx.result(OBJECT_MAPPER.writeValueAsString(new CardsDataResponse(
                    cardData.get(0), cardData.get(1), cardData.get(2))));
        } else {
            returnFailedRequest(ctx, "You can't edit another users card.");
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
        if (isSessionInvalid(validSession, ctx)) {
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

    public static void addNewFlashcard(String user_id, String question, String solution, String category) {

        db.insertValues(
                "flashcards",
                new String[]{"question", "solution", "category", "user_id"},
                new String[]{question, solution, category, user_id}
        );
    }

    public static void deleteFlashcard(boolean validSession, JsonNode jsonData, Context ctx) throws Exception {
        if (isSessionInvalid(validSession, ctx)) {
            return;
        }
        String card_id = jsonData.get("card_id").asText();
        String user_id = Login.getAccountIDByToken(ctx.cookie("sessionToken"));
        if (card_id == null) {
            returnFailedRequest(ctx, "No card id found.");
        }

        String cardOwner = db.getValue("flashcards", "user_id", "card_id", card_id);

        if (!cardOwner.equals(user_id)) {
            returnFailedRequest(ctx, "You don't own this card.");
        } else {
            LOGGER.debug(card_id);
            db.deleteValue("flashcards", "card_id", card_id);
            ctx.status(200);
        }
    }

    private static boolean checkFlashcardOwner(String user_id, String card_id) {
        if (card_id != null) {
            String real_owner = db.getValue("flashcards", "user_id", "card_id", card_id);
            return real_owner.equals(user_id);
        } else {
            return false;
        }
    }

    private static boolean isSessionInvalid(boolean validSession, Context ctx) throws Exception {
        if (validSession) {
            return false;
        }
        returnFailedRequest(ctx, "You're not logged in.");
        return true;
    }

    private static void returnFailedRequest(Context ctx, String input) throws JsonProcessingException {
        ctx.status(500);
        ctx.contentType("application/json");
        ctx.result(OBJECT_MAPPER.writeValueAsString(new ErrorResponse(input)));
    }

    public static void toggleFlashcardVisibility(boolean validSession, JsonNode jsonData, Context ctx) throws Exception {
        if (isSessionInvalid(validSession, ctx)) {
            return;
        }
        String user_id = Login.getAccountIDByToken(ctx.cookie("sessionToken"));
        String category = jsonData.get("category").asText();
        String visibility = jsonData.get("visibility").asText();
        db.updateValueWithTwoConditions("flashcards", "visibility", "category", category, "user_id", user_id, visibility);
        ctx.status(200);
        ctx.contentType("application/json");
        ctx.result(visibility);
    }

    public static void queryFlashcardCategories(boolean validSession, JsonNode jsonData, Context ctx) throws Exception {
        if (isSessionInvalid(validSession, ctx)) {
            return;
        }
        String query = jsonData.get("query").asText();
        String user_id = Login.getAccountIDByToken(ctx.cookie("sessionToken"));

        if (query != null) {
            ctx.status(200);
            ctx.contentType("application/json");
            ctx.result(OBJECT_MAPPER.writeValueAsString(new CardCategoriesResponse(db.queryForCategory(user_id, query))));
        } else {
            returnFailedRequest(ctx, "No query given.");
        }
    }

    public static void duplicateFlashcardCategory(boolean validSession, JsonNode jsonData, Context ctx) throws Exception {
        if (isSessionInvalid(validSession, ctx)) {
            return;
        }
        String category;
        String card_id;
        try {
            category = jsonData.get("category").asText();
            card_id = jsonData.get("card_id").asText();
            String user_id = Login.getAccountIDByToken(ctx.cookie("sessionToken"));

            if (db.getValueWith2Conditions("flashcards",
                    "category", "user_id", user_id,
                    "category", category) != null) {
                LOGGER.debug("User tried to request existing category.");
                returnFailedRequest(ctx, "Category already exists.");
            } else {
                db.copyPasteCategory(card_id, category, user_id);
                ctx.contentType("application/json");
                ctx.result("");
                ctx.status(200);
            }
        } catch (Exception _) {
            returnFailedRequest(ctx, "Invalid category.");
        }
    }
}
