package org.florian.memoryflow.api.responses;

import java.util.HashMap;

public record FlashcardSessionResponse(HashMap<String, Integer> categories) {
}