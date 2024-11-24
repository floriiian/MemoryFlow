# Memoryflow
A web app that makes use of flashcards.
While you can add your own, you can also get public cards made by other users.
Additionally there is Streaks, Levels, XP and a daily Leaderboard implemented.
The account system is fully functional and working with JWT Authentication, **note that you have to set a jTokenKey ENV.**

For that, open your CMD and run: ``SET jTokenKey=yourkey``.
You also need Docker with a running [Redis container](https://www.docker.com/blog/how-to-use-the-redis-docker-official-image/), 
configure it to your liking and modify the values inside the Redis class.

If you're running this locally you'll have to disable Chrome's CORS restrictions 
/ start Chrome without CORS, this will allow you to send and receive POST/GET requests.
This is possible with this command: 
``"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --disable-gpu --user-data-dir=%LOCALAPPDATA%\Google\chromeTemp``. 
Of course only if you've installed Chrome in that directory.

Now once that's done, you should be good to go. Just run Main.java and the React web-server.

![loginScreen](https://iili.io/2aBzFQ2.png)
![startScreen](https://iili.io/2aBzHkG.png)
![categorySelect](https://iili.io/2aBz97s.png)
![flashcards](https://iili.io/2aBxy2n.png)
![searchScreen](https://iili.io/2aBxmrX.png)
