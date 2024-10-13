package org.florian.memoryflow;

import io.javalin.Javalin;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import org.florian.memoryflow.db.Database;

public class Main {

    final static private Logger LOGGER = LogManager.getLogger();

    enum applicationEndpoints {

    }

    public static void main(String[] args) {
        Javalin app = Javalin.create().start(8888);
        Database db = Database.getInstance();

        db.startDatabase();
        app.post("/", ctx -> ctx.result("Hello World"));
    }
}