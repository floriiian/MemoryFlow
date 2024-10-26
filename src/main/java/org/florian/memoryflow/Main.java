package org.florian.memoryflow;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.Javalin;
import io.javalin.http.Context;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import org.florian.memoryflow.account.Login;
import org.florian.memoryflow.account.Register;
import org.florian.memoryflow.account.UserData;
import org.florian.memoryflow.api.requests.LoginRequest;
import org.florian.memoryflow.api.requests.RegisterRequest;
import org.florian.memoryflow.api.responses.RegisterResponse;
import org.florian.memoryflow.api.responses.UserdataResponse;
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

        app.get("/get/userdata", ctx -> handleGetRequest("/get/userdata", ctx));

    }


    private static void handleGetRequest(String path, Context ctx) throws Exception {

        boolean isValidSession = verifySession(ctx);
        if (!isValidSession) {
            ctx.status(500);
            ctx.contentType("application/json");
            ctx.result(OBJECT_MAPPER.writeValueAsString(
                    new UserdataResponse(null, null, null, null)));
        } else {

            // TODO: THIS IS RESPONSIBLE TO MANAGE USER DATA REQUESTS:

            switch(path) {
                case "/get/userdata":
                    UserData.handleUserDataRequest(ctx);
                    break;
            }
        }
    }

    static void handlePostRequest(String path, Context ctx) throws Exception {
        String requestedData = ctx.body();
        JsonNode jsonData = OBJECT_MAPPER.readTree(requestedData);
        boolean isValidSession = verifySession(ctx);

        switch (path) {
            case "/login":
                handleLogin(isValidSession, jsonData, ctx, RequestType.LOGIN);
                break;
            case "/register":
                handleLogin(isValidSession, jsonData, ctx, RequestType.REGISTER);
                break;
        }
    }

    private static boolean verifySession(Context ctx) {

        String accessToken = ctx.cookieStore().get("sessionToken");
        String refreshToken = ctx.cookieStore().get("refreshToken");

        if (accessToken == null || refreshToken == null || !Login.validateSessionToken(accessToken, refreshToken, ctx)) {
            ctx.removeCookie("sessionToken");
            ctx.removeCookie("refreshToken");
            return false;
        } else {
            return true;
        }
    }

    private static void handleLogin(boolean isLoggedIn, JsonNode jsonData, Context ctx, RequestType requestType) {
        try {
            if (isLoggedIn) {
                ctx.status(500);
                ctx.contentType("application/json");
                ctx.result(OBJECT_MAPPER.writeValueAsString(new RegisterResponse("Already logged in.")));
            } else {
                switch (requestType) {
                    case LOGIN:
                        Login.handleLoginRequest(ctx, OBJECT_MAPPER.treeToValue(jsonData, LoginRequest.class));
                        return;
                    case REGISTER:
                        Register.handleRegisterRequest(ctx, OBJECT_MAPPER.treeToValue(jsonData, RegisterRequest.class));
                }
            }
        } catch (Exception e) {
            LOGGER.debug(e);
            ctx.status(500);
        }
    }
}