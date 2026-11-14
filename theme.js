// Wird im <head> vor dem ersten Zeichnen geladen: Farbschema und Textbox-Größe setzen (kein Aufblitzen).
(function () {
  var t; try { t = JSON.parse(localStorage.getItem('wf.theme')); } catch (e) {}
  if (['sand', 'salbei', 'himmel', 'rose', 'nacht'].indexOf(t) < 0) t = 'sand';
  document.documentElement.dataset.theme = t;
  var pn; try { pn = JSON.parse(localStorage.getItem('wf.panel')); } catch (e) {}
  // Textbox in drei Stufen (Klein 38, Mittel 50, Groß 64); alte Zwischenwerte rasten auf die nächste Stufe ein.
  if (typeof pn === 'number') document.documentElement.style.setProperty('--panel', pn < 44 ? 38 : pn < 57 ? 50 : 64);
  var ts; try { ts = JSON.parse(localStorage.getItem('wf.tabscale')); } catch (e) {}
  if (ts >= 80 && ts <= 140) document.documentElement.style.setProperty('--tab-scale', ts / 100);
  // Helle Schemata: dunkle Schrift in der Statusleiste (wirkt nach einem Neustart der App)
  if (t !== 'nacht') document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]').content = 'default';
})();
