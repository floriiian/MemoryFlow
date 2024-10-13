package org.florian.memoryflow.application;

import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.florian.memoryflow.db.Database;

import java.util.ArrayList;
import java.util.HashMap;

public class Flashcards {

    Database db = Database.getInstance();
    final private Logger LOGGER = LogManager.getLogger();

    public void getFlashCardCategories(String user_id) {
        ArrayList<String> val = db.getAllValuesByType("flashcards", "category", "user_id", user_id);
        val.forEach(LOGGER::debug);
    }

    public void getFlashCardsByCategory(String user_id, String category) {
        HashMap<String, String> map = db.getFlashCardsByOwner(user_id, category);

        if(map != null){
            map.forEach((key, value) -> {
                System.out.println("Key=" + key + ", Value=" + value);
            });
        }
    }

    public void addNewFlashcard(String user_id, String question, String solution, String category) {

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
