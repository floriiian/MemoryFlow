# Memoryflow: A Flashcard web app
## Features

* **Personalized Learning:** Create and customize your own flashcards.
* **Community-Powered:** Access or contribute to database of public flashcards.
* **Gamification:** Stay motivated with streaks, levels, XP, and daily leaderboards.
* **Secure Accounts:** Robust JWT authentication for secure access.

## Getting Started

1. **Environment Setup:**
   * Set the `jTokenKey` environment variable: `SET jTokenKey=yourkey`
   * Ensure a running Redis container: Refer to the Redis Docker Image documentation.
   * Configure Redis connection details in the source code.

2. **Local Development:**
   * **Disable Chrome CORS (for development only):**
     ```bash
     "C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --disable-gpu --user-data-dir=%LOCALAPPDATA%\Google\chromeTemp"
     ```
   * **Run the Application:**
     Start the `Main.java` and React web server.

## Note
Disabling Chrome CORS is a development-only workaround. For production, implement proper CORS configuration.

![loginScreen](https://iili.io/2aBzFQ2.png)
![startScreen](https://iili.io/2aBzHkG.png)
![categorySelect](https://iili.io/2aBz97s.png)
![flashcards](https://iili.io/2aBxy2n.png)
![searchScreen](https://iili.io/2aBxmrX.png)
