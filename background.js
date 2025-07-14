chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;

  const tabUrl = tab?.url || "";
  if (tabUrl.startsWith("chrome://") || tabUrl.startsWith("chrome-extension://")) return;

  chrome.storage.local.get("enabled", async (data) => {
    if (!data.enabled) return;
    console.log("StudyGuard: Extension enabled?", data.enabled);

    if (tabUrl.includes("google.com/search")) {
    console.log("StudyGuard: Skipping Google Search page");
    return;
  }

    // ✅ Skip non-video YouTube pages (home, shorts, etc.)
    if (tabUrl.includes("youtube.com") && !isYouTubeVideoPage(tabUrl)) {
      console.log("StudyGuard: Skipping YouTube homepage or non-video page");
      return;
    }

    // ✅ Inject blocker overlay & pause video
    chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        if (!document.getElementById("studyguard-blocker")) {
          const video = document.querySelector("video");
          if (video && !video.paused) {
            video.pause();
            console.log("StudyGuard: Video paused during analysis");
          }

          const blocker = document.createElement("div");
          blocker.style.position = "fixed";
          blocker.style.top = "0";
          blocker.style.left = "0";
          blocker.style.width = "100vw";
          blocker.style.height = "100vh";
          blocker.style.backgroundColor = "#000000ee";
          blocker.style.color = "white";
          blocker.style.display = "flex";
          blocker.style.alignItems = "center";
          blocker.style.justifyContent = "center";
          blocker.style.fontSize = "2rem";
          blocker.style.zIndex = "999999";
          blocker.innerText = "🧠 Analyzing page content for study relevance...";
          blocker.id = "studyguard-blocker";
          document.body.appendChild(blocker);
        }
      }
    });

    // ✅ Extract video title for YouTube video pages
    if (isYouTubeVideoPage(tabUrl)) {
      chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          return new Promise((resolve) => {
            let attempts = 0;
            const interval = setInterval(() => {
              const titleEl = document.querySelector('h1.title yt-formatted-string') ||
                              document.querySelector('h1.ytd-watch-metadata');
              if (titleEl && titleEl.textContent.trim()) {
                clearInterval(interval);
                resolve(titleEl.textContent.trim());
              }
              attempts++;
              if (attempts > 30) {
                clearInterval(interval);
                resolve(document.title || "");
              }
            }, 100);
          });
        }
      }, handleTitleCheck);
    } else {
      // ✅ Other websites → use document.title
      chrome.scripting.executeScript({
        target: { tabId },
        func: () => document.title
      }, handleTitleCheck);
    }

    // ✅ Helper to detect YouTube video URL
    function isYouTubeVideoPage(url) {
      return url.includes("youtube.com/watch?v=");
    }

    // ✅ Main function to process page title and block/allow
    async function handleTitleCheck(results) {
      if (!results || !results[0] || !results[0].result) {
        console.warn("StudyGuard: Could not extract page title.");
        return;
      }

      const title = results[0].result;
      console.log("StudyGuard: Page title =", title);

      const prompt = `Is this content educational and related to programming or academics? Title: "${title}". Answer only YES or NO.`;

      try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }]
          })
        });

        const result = await response.json();
        if (result.error) {
          console.error("Gemini API error:", result.error);
          return;
        }

        const reply = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase();
        console.log("StudyGuard: Gemini replied =", reply);

        if (reply === "YES") {
          chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
              const blocker = document.getElementById("studyguard-blocker");
              if (blocker) blocker.remove();
            }
          });
        } else {
          chrome.tabs.update(tabId, { url: chrome.runtime.getURL("block.html") });
        }

      } catch (err) {
        console.error("Gemini fetch failed:", err);
      }
    }
  });
});
