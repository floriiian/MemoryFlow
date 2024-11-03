package org.florian.memoryflow.api.responses;

import org.florian.memoryflow.leaderboard.Competitor;

import java.util.ArrayList;

public record LeaderboardResponse(ArrayList<Competitor>  competitors) {
}