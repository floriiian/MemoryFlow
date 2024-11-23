package org.florian.memoryflow.api.responses;

import java.util.HashMap;

public record CardsResponse(HashMap<String, String[]> cards) {
}