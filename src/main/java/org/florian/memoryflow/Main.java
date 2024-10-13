package org.florian.memoryflow;

import io.javalin.Javalin;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import org.florian.memoryflow.account.Login;
import org.florian.memoryflow.account.Register;
import org.florian.memoryflow.application.Flashcards;
import org.florian.memoryflow.db.Database;

public class Main {

    final static private Logger LOGGER = LogManager.getLogger();

    //  ADD_ACCOUNT
    enum DatabaseQueries {

    }

    public static void main(String[] args) {
        Javalin app = Javalin.create().start(8888);
        Database db = Database.getInstance();

        db.startDatabase();
        app.post("/", ctx -> ctx.result("Hello World"));

        Register register = new Register();
        Login login = new Login();
        Flashcards flashcards = new Flashcards();

        register.registerAccount("florin", "florianswzz@gmail.com", "W{}mm?YM\\3;29^");
        login.loginAccount("florin", "W{}mm?YM\\3;29^");
        flashcards.getFlashCardsByCategory("1", "Retards");
    }
}