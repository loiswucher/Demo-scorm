/* ============================================================
   Adaptateur SCORM 1.2 — Démarche clinique Mme L.
   ============================================================ */
var SCORM = (function(){
  var API = null, initialise = false, termine = false;
  function chercherAPI(win){
    var essais = 0;
    while (win && essais < 20){
      if (win.API) return win.API;
      if (win.parent && win.parent !== win){ win = win.parent; }
      else break;
      essais++;
    }
    if (window.opener) { try { return chercherAPI(window.opener); } catch(e){} }
    return null;
  }
  function init(){
    API = chercherAPI(window);
    if (!API) { console.log("SCORM : aucun LMS détecté (mode autonome)."); return; }
    try{
      var ok = API.LMSInitialize("");
      if (ok === "true" || ok === true){
        initialise = true;
        var statut = API.LMSGetValue("cmi.core.lesson_status");
        if (statut === "not attempted" || statut === ""){ API.LMSSetValue("cmi.core.lesson_status", "incomplete"); }
        API.LMSCommit("");
        console.log("SCORM : session initialisée.");
      }
    }catch(e){ console.log("SCORM init erreur :", e); }
  }
  function rapporter(score, max){
    if (!initialise || !API) return;
    try{
      API.LMSSetValue("cmi.core.score.min", "0");
      API.LMSSetValue("cmi.core.score.max", String(max));
      API.LMSSetValue("cmi.core.score.raw", String(score));
      API.LMSSetValue("cmi.core.lesson_status", "completed");
      API.LMSCommit("");
      console.log("SCORM : score " + score + "/" + max + " transmis, statut completed.");
    }catch(e){ console.log("SCORM rapport erreur :", e); }
  }
  function fermer(){
    if (!initialise || !API || termine) return;
    try{ API.LMSCommit(""); API.LMSFinish(""); termine = true; }catch(e){}
  }
  if (document.readyState === "loading"){ document.addEventListener("DOMContentLoaded", init); } else { init(); }
  window.addEventListener("beforeunload", fermer);
  window.addEventListener("unload", fermer);
  return { rapporter: rapporter, fermer: fermer };
})();
