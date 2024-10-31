package org.florian.memoryflow.api.responses;

import java.util.ArrayList;

public record DailyMissionsResponse(ArrayList<org.florian.memoryflow.missions.Mission> missions) {
}