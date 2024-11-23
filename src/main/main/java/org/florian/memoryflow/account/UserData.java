package org.florian.memoryflow.account;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.http.Context;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.florian.memoryflow.api.responses.UserdataResponse;
import org.florian.memoryflow.db.Database;

import java.util.ArrayList;

public class UserData {

    static final private Logger LOGGER = LogManager.getLogger();
    static final private Database DATABASE = Database.getInstance();
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public static void handleUserDataRequest(Context ctx) {
        try {
            String accountId = Login.getAccountIDByToken(ctx.cookie("sessionToken"));
            ArrayList<String> userData = DATABASE.getUserData(accountId);

            boolean success = false;
            String username = null, streak = null, level = null, xp = null;
            if (userData != null) {
                username = userData.getFirst();
                streak = userData.get(1);
                level = userData.get(2);
                xp = userData.get(3);
                success = true;
            }
            ctx.status(success ? 200 : 500);
            ctx.contentType("application/json");
            ctx.result(OBJECT_MAPPER.writeValueAsString(new UserdataResponse(username, streak, level, xp)));


        } catch (Exception e) {
            LOGGER.debug("Error trying to handle user-data request." + e);
        }
    }
}
