package org.florian.memoryflow.application;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.florian.memoryflow.db.Database;

public class Progression {

    Database db = Database.getInstance();
    final private Logger LOGGER = LogManager.getLogger();

    public String getLevel(String user_id){
        return db.getValue("progress", "level", "user_id", user_id);
    }

    public String getXP(String user_id){
        return db.getValue("progress", "xp", "user_id", user_id);
    }

    public String getStreak(String user_id){
        return db.getValue("progress", "streak", "user_id", user_id);
    }
}
