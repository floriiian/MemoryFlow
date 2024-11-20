package org.florian.memoryflow.account;

public class Streak {

    String user_id;
    int streak;
    long last_completion;

    public Streak(String user_id, int streak, long last_completion) {
        this.user_id = user_id;
        this.streak = streak;
        this.last_completion = last_completion;
    }
}