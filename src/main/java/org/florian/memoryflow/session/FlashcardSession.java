package org.florian.memoryflow.session;

import java.util.ArrayList;
import java.util.HashMap;

public class FlashcardSession {

    HashMap<Integer, ArrayList<String>> flashcards = new HashMap<>();
    int mistakes = 0;
    int firstTries = 0;

    public FlashcardSession(HashMap<Integer, ArrayList<String>> flashcards) {
        this.flashcards = flashcards;
    }

    public void setMistakes(int mistakes) {
        this.mistakes = mistakes;
    }
    public void setFirstTries(int firstTries) {
        this.firstTries = firstTries;
    }

    public int getMistakes() {
            return mistakes;
    }
    public int getFirstTries() {
        return firstTries;
    }

    public HashMap<Integer, ArrayList<String>> getFlashcards() {
        return flashcards;
    }

    public void setFlashcards(HashMap<Integer, ArrayList<String>> flashcards) {
        this.flashcards = flashcards;
    }

}
