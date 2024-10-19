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
import org.florian.memoryflow.api.responses.LoginResponse;
import org.florian.memoryflow.api.responses.RegisterResponse;
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
        boolean isInValidSession = false;

        String requestedData = ctx.body();
        JsonNode jsonData = OBJECT_MAPPER.readTree(requestedData);

        String accessToken = ctx.cookieStore().get("sessionToken");
        String refreshToken = ctx.cookieStore().get("refreshToken");

        if (accessToken == null || refreshToken == null || !Login.validateSessionToken(accessToken, refreshToken, ctx)) {
            ctx.removeCookie("sessionToken");
            ctx.removeCookie("refreshToken");
        } else {
            isInValidSession = true;
        }

        switch (path) {
            case "/login":
                if(!isInValidSession){
                    Login.handleLoginRequest(ctx, OBJECT_MAPPER.treeToValue(jsonData, LoginRequest.class));
                } else {
                    ctx.status(500);
                    ctx.result(OBJECT_MAPPER.writeValueAsString(new LoginResponse("Already logged in.")));
                }
                break;
            case "/register":
                if(!isInValidSession) {
                    Register.handleRegisterRequest(ctx, OBJECT_MAPPER.treeToValue(jsonData, RegisterRequest.class));
                } else{
                    ctx.status(500);
                    ctx.result(OBJECT_MAPPER.writeValueAsString(new RegisterResponse("Already logged in.")));
                }
                break;
        }
    }
}