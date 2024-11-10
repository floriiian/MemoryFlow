package org.florian.memoryflow.db;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.florian.memoryflow.session.FlashcardSession;
import redis.clients.jedis.*;

import java.util.ArrayList;
import java.util.HashMap;

public class Redis {

    final static private Logger LOGGER = LogManager.getLogger();
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final Database db = Database.getInstance();
    static JedisPool jedisPool = new JedisPool(new JedisPoolConfig(), "localhost", 6379);

    public static void addFlashcardSession(int user_id,  int[] card_ids){
        try(Jedis jedis = jedisPool.getResource()) {
            ArrayList<Integer> flashcardIDs = db.getAllFlashcardIDsFromUser(String.valueOf(user_id));
            HashMap<Integer, ArrayList<String>> flashcardData = new HashMap<>();

            for(Integer card_id : card_ids){
                if(!flashcardIDs.contains(card_id)){
                    LOGGER.debug("Invalid card sent in request");
                    return;
                } else {
                    flashcardData.put(card_id, db.getQuestionSolution(String.valueOf(card_id)));
                }
            }
            FlashcardSession session = new FlashcardSession(flashcardData);
            jedis.set("flashcardSession:" + user_id, OBJECT_MAPPER.writeValueAsString(session));
            //String value = jedis.get("flashcardSession:" + user_id);
        } catch (Exception e) {
            LOGGER.debug(e);
        }

    }
}

