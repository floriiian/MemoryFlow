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
import org.florian.memoryflow.api.responses.ErrorResponse;
import org.florian.memoryflow.api.responses.RegisterResponse;
import org.florian.memoryflow.application.Flashcards;
import org.florian.memoryflow.db.Database;
import org.florian.memoryflow.db.Redis;
import org.florian.memoryflow.leaderboard.Leaderboard;
import org.florian.memoryflow.missions.DailyMissions;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;

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
        app.post("/complete", ctx -> handlePostRequest("/complete", ctx));
        app.post("/add_card", ctx -> handlePostRequest("/add_card", ctx));
        app.post("/cards", ctx ->  handlePostRequest("/cards", ctx));
        app.post("/card_info", ctx ->  handlePostRequest("/card_info", ctx));
        app.post("/edit_card", ctx ->  handlePostRequest("/edit_card", ctx));
        app.post("/delete/card", ctx -> handlePostRequest("/delete/card", ctx));
        app.post("/toggle/category", ctx -> handlePostRequest("/toggle/category", ctx));
        app.post("/card_session/start", ctx -> handlePostRequest("/card_session/start", ctx));
        app.post("/card_session/solve", ctx -> handlePostRequest("/card_session/solve", ctx));
        app.post("/query/categories", ctx -> handlePostRequest("/query/categories", ctx));
        app.post("/download/category", ctx -> handlePostRequest("/download/category", ctx));

        app.get("/get/userdata", ctx -> handleGetRequest("/get/userdata", ctx));
        app.get("/get/leaderboard", ctx -> handleGetRequest("/get/leaderboard", ctx));
        app.get("/get/daily_missions", ctx -> handleGetRequest("/get/daily_missions", ctx));
        app.get("/get/card_categories", ctx -> handleGetRequest("/get/card_categories", ctx));
        app.get("/get/card_session/end", ctx -> handleGetRequest("/get/card_session/end", ctx));
        app.get("/auth", ctx -> handleGetRequest("/auth", ctx));
        app.get("/logout", ctx -> handleGetRequest("/logout", ctx));
    }

    private static void handleGetRequest(String path, Context ctx) throws Exception {

        boolean isValidSession = verifySession(ctx);
        if (!isValidSession) {
            ctx.status(500);
            ctx.contentType("application/json");
            ctx.result(OBJECT_MAPPER.writeValueAsString(
                    new ErrorResponse("Not logged in.")));
        } else {
            switch (path) {
                case "/get/userdata":
                    UserData.handleUserDataRequest(ctx);
                    break;
                 case "/get/leaderboard":
                    Leaderboard.handleLeaderboardRequest(ctx);
                    break;
                case "/get/daily_missions":
                    DailyMissions.handleDailyMissionsRequest(ctx);
                    break;
                case "/get/card_categories":
                    Flashcards.getFlashCardCategories(ctx);
                    break;
                case "/get/card_session/end":
                    Redis.endFlashcardSession(ctx);
                    break;
                case "/auth":
                    boolean validSession = verifySession(ctx);
                    ctx.status(validSession ? 200 : 500);
                    ctx.contentType("application/json");
                    ctx.result(OBJECT_MAPPER.writeValueAsString(validSession));
                    break;
                case "/logout":
                    handleLogoutRequest(ctx);
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
            case "/add_card":
                Flashcards.handleFlashcardAdd(isValidSession, jsonData, ctx);
            case "/cards":
                Flashcards.getFlashcardsByCategory(isValidSession, jsonData, ctx);
                break;
            case "/edit_card":
                Flashcards.editFlashcard(isValidSession, jsonData, ctx);
                break;
            case "/card_info":
                Flashcards.getFlashcardInfo(isValidSession, jsonData, ctx);
                break;
            case "/delete/card":
                Flashcards.deleteFlashcard(isValidSession, jsonData, ctx);
                break;
            case "/card_session/start":
                Redis.addFlashcardSession(isValidSession, requestedData, ctx);
                break;
            case "/card_session/solve":
                Redis.evaluateAnswer(isValidSession, jsonData, ctx);
                break;
            case "/toggle/category":
                Flashcards.toggleFlashcardVisibility(isValidSession, jsonData, ctx);
                break;
            case "/query/categories":
                Flashcards.queryFlashcardCategories(isValidSession, jsonData, ctx);
                break;
            case "/download/category":
                Flashcards.duplicateFlashcardCategory(isValidSession, jsonData, ctx);
                break;
        }
    }

    public static boolean verifySession(Context ctx) {
        String accessToken = ctx.cookie("sessionToken");
        String refreshToken = ctx.cookie("refreshToken");

        if (accessToken == null || refreshToken == null || !Login.validateSessionToken(accessToken, refreshToken, ctx)) {
            ctx.removeCookie("sessionToken");
            ctx.removeCookie("refreshToken");
            LOGGER.debug("Removed Refresh & Session-token.");
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
                        break;
                    case REGISTER:
                        Register.handleRegisterRequest(ctx, OBJECT_MAPPER.treeToValue(jsonData, RegisterRequest.class));
                        break;
                }
            }
        } catch (Exception e) {
            LOGGER.debug(e);
            ctx.status(500);
        }
    }
    private static void handleLogoutRequest(Context ctx) {
        boolean isValidSession = verifySession(ctx);

        if (isValidSession) {
            Database db = Database.getInstance();
            try {
                String user_id = Login.getAccountIDByToken(ctx.cookie("sessionToken"));
                db.updateValues("accounts", "token", "user_id",user_id , "");
            } catch (Exception _){}
        }
        ctx.removeCookie("sessionToken");
        ctx.removeCookie("refreshToken");
    }

}