package org.florian.memoryflow.session;

import java.util.HashMap;

public class FlashcardSession {

    HashMap<String, HashMap<String, String>> flashcards = new HashMap<>();
    int mistakes = 0;
    int correct = 0;

    public FlashcardSession() {
    }

    public FlashcardSession(HashMap<String, HashMap<String, String>> flashcards) {
        this.flashcards = flashcards;
    }

    public void setCorrect(int correct) {
        this.correct = correct;
    }

    public void addCorrect() {
        this.correct += 1;
    }

    public int getCorrect() {
        return correct;
    }

    public void setMistakes(int mistakes) {
        this.mistakes = mistakes;
    }

    public void addMistake() {
        this.mistakes += 1;
    }

    public int getMistakes() {
        return mistakes;
    }

    public HashMap<String, HashMap<String, String>> getFlashcards() {
        return flashcards;
    }

    public void setFlashcards(HashMap<String, HashMap<String, String>> flashcards) {
        this.flashcards = flashcards;
    }

}
