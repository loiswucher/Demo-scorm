/* Alarmotron — connecteur SCORM 1.2 minimal.
   Cherche l'API du LMS (Theia) dans les fenêtres parentes, s'initialise,
   marque la ressource comme suivie, et se termine proprement à la fermeture.
   Aucune erreur n'est levée si aucun LMS n'est détecté (usage hors SCORM). */
(function () {
  function safeGet(win, prop) {
    try { return win[prop]; } catch (e) { return null; }
  }

  function findAPI(win) {
    var attempts = 0;
    while (win && attempts < 10) {
      var api = safeGet(win, "API");
      if (api) return api;
      var parent = safeGet(win, "parent");
      if (!parent || parent === win) break;
      win = parent;
      attempts++;
    }
    return null;
  }

  function getAPI() {
    var api = findAPI(window);
    if (!api && window.opener) api = findAPI(window.opener);
    return api;
  }

  var API = getAPI();
  window.__scormAPI = API;

  if (!API) return; // pas de LMS détecté : le fichier fonctionne comme une page autonome

  try {
    API.LMSInitialize("");
    var status = API.LMSGetValue("cmi.core.lesson_status");
    if (!status || status === "not attempted") {
      API.LMSSetValue("cmi.core.lesson_status", "completed");
    }
    API.LMSCommit("");
  } catch (e) { /* silencieux */ }

  window.addEventListener("beforeunload", function () {
    try {
      API.LMSCommit("");
      API.LMSFinish("");
    } catch (e) { /* silencieux */ }
  });
})();
