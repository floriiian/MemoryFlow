package org.florian.memoryflow;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.Javalin;
import io.javalin.http.Context;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import org.florian.memoryflow.account.Login;
import org.florian.memoryflow.account.Register;
import org.florian.memoryflow.api.requests.LoginRequest;
import org.florian.memoryflow.api.requests.RegisterRequest;
import org.florian.memoryflow.db.Database;

public class Main {

    enum RequestType {
        LOGIN, REGISTER, LOGOUT
    }

    final static private Logger LOGGER = LogManager.getLogger();
    public static ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public static void main(String[] args) {

        Database db = Database.getInstance();
        Javalin app = Javalin.create().start(8888);

        db.startDatabase();

        app.post("/register", ctx -> handlePostRequest("/register", ctx));
        app.post("/login", ctx -> handlePostRequest("/login", ctx));

    }

    private static void handlePostRequest(String path, Context ctx) throws Exception {

        LOGGER.debug(path);

        String requestedData = ctx.body();
        JsonNode jsonData = OBJECT_MAPPER.readTree(requestedData);

        String sessionToken = ctx.cookieStore().get("sessionToken");
        if(sessionToken != null && Login.validateSessionToken(sessionToken)){
            LOGGER.debug("Has a valid token");
        } else{
           LOGGER.debug("Invalid session token.");
        }

        switch (path) {
            case "/login":
                LOGGER.debug("Logging in user..");
                Login.handleLoginRequest(ctx, OBJECT_MAPPER.treeToValue(jsonData, LoginRequest.class));
                break;
            case "/register":
                LOGGER.debug("Registering in user..");
                Register.handleRequest(OBJECT_MAPPER.treeToValue(jsonData, RegisterRequest.class));
                break;
        }
    }
}