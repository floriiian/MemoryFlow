package org.florian.memoryflow.api.responses;

public record endFlashcardSessionResponse(int correct, int mistakes, long xp) {
}