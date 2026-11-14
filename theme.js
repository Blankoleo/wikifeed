// Wird im <head> vor dem ersten Zeichnen geladen: Farbschema und Textbox-Größe setzen (kein Aufblitzen).
(function () {
  var t; try { t = JSON.parse(localStorage.getItem('wf.theme')); } catch (e) {}
  if (['sand', 'salbei', 'himmel', 'rose', 'nacht'].indexOf(t) < 0) t = 'sand';
  document.documentElement.dataset.theme = t;
  var pn; try { pn = JSON.parse(localStorage.getItem('wf.panel')); } catch (e) {}
  if (pn >= 30 && pn <= 75) document.documentElement.style.setProperty('--panel', pn);
  // Helle Schemata: dunkle Schrift in der Statusleiste (wirkt nach einem Neustart der App)
  if (t !== 'nacht') document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]').content = 'default';
})();
