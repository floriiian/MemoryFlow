package org.florian.memoryflow;

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
import org.florian.memoryflow.leaderboard.Leaderboard;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import static java.util.concurrent.TimeUnit.SECONDS;

public class Main {

    enum PostRequestType {
        LOGIN, REGISTER, LOGOUT
    }

    final static private Logger LOGGER = LogManager.getLogger();
    public static ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    public static void main(String[] args) {

        Database db = Database.getInstance();
        Javalin app = Javalin.create().start(8888);

        db.startDatabase();

        final ScheduledFuture<?> leaderboardHandler = scheduler.scheduleAtFixedRate(
                Leaderboard.getTopTenCompetitors, 0, 60, SECONDS);

        app.post("/register", ctx -> handlePostRequest("/register", ctx));
        app.post("/login", ctx -> handlePostRequest("/login", ctx));

        app.get("/get/userdata", ctx -> handleGetRequest("/get/userdata", ctx));
        app.get("/get/leaderboard", ctx -> handleGetRequest("/get/leaderboard", ctx));
    }


    private static void handleGetRequest(String path, Context ctx) throws Exception {
        boolean isValidSession = verifySession(ctx);
        if (!isValidSession) {
            ctx.status(500);
            ctx.contentType("application/json");
            ctx.result(OBJECT_MAPPER.writeValueAsString(
                    new UserdataResponse(null, null, null, null)));
        } else {
            switch (path) {
                case "/get/userdata":
                    UserData.handleUserDataRequest(ctx);
                    break;
                case "/get/leaderboard":
                    Leaderboard.handleLeaderboardRequest(ctx);
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
                handleLogin(isValidSession, jsonData, ctx, PostRequestType.LOGIN);
                break;
            case "/register":
                handleLogin(isValidSession, jsonData, ctx, PostRequestType.REGISTER);
                break;
        }
    }

    private static boolean verifySession(Context ctx) {

        String accessToken = ctx.cookie("sessionToken");
        String refreshToken = ctx.cookie("refreshToken");

        LOGGER.debug(accessToken);
        LOGGER.debug(refreshToken);


        if (accessToken == null || refreshToken == null || !Login.validateSessionToken(accessToken, refreshToken, ctx)) {
            ctx.removeCookie("sessionToken");
            ctx.removeCookie("refreshToken");
            return false;
        }
        return true;
    }

    private static void handleLogin(boolean isLoggedIn, JsonNode jsonData, Context ctx, PostRequestType requestType) {
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