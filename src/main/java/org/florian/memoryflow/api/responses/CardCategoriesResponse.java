package org.florian.memoryflow.api.responses;

import java.util.HashMap;

public record CardCategoriesResponse(HashMap<String, Integer> categories) {
}