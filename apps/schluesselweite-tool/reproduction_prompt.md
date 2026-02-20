**Ziel:** Erstelle eine interaktive Web-App zur Berechnung von Schlüsselweiten (SW) für metrische Gewinde, optimiert für eine Portfolio-Card-Ansicht.

### Verzeichnisstruktur
Erstelle folgenden Ordner und Dateien:
- `apps/schluesselweite-tool/`
  - `index.html` (Hauptstruktur, Meta-Daten, Verlinkung)
  - `style.css` (Glassmorphism Design, Responsive Layout)
  - `script.js` (Logik, Daten, SVG-Manipulation)
  - `package.json` (Metadaten für automatische Indexierung: Name, Keywords, Kategorie 'tool')
  - `README.md` (Kurzbeschreibung)

### Integration & Standards
- Binde `../../card-integration.css` und `../../card-fit.js` ein.
- Das Design muss responsive sein und sich nahtlos in Container (Popups/Cards) einfügen.
- Nutze **keine** externen Frameworks (nur Vanilla JS/CSS).
- Sprache: Deutsch.

### Funktionalität (Logik)
1.  **Datenbasis:** Erstelle ein Objekt mit metrischen Größen (M1.6 bis M64).
    - Zu jeder Größe speichere: `sw_iso` (ISO-Norm), `sw_din` (DIN-Norm), `pitch` (Steigung), `clearance` (Durchgangsloch mittel), `tap_drill` (Kernloch/Vorbohren).
    - Berücksichtige Unterschiede zwischen ISO und DIN (z.B. M10: SW 16 vs 17, M12: SW 18 vs 19).
2.  **Toggle:** Ein Schalter um zwischen ISO und DIN zu wechseln.
3.  **Berechnung:** Bei Eingabe (Textfeld) oder Klick (Button) sollen alle Werte (SW, Steigung, Kernloch, Durchgangsloch) angezeigt werden.
4.  **Animation:** Zahlen sollen bei Änderung hochzählen (`animateValue`).

### Design & UI (Wichtig!)
1.  **Stil:** "Best Modern Glassmorphism" (Transparenz, Unschärfe/Blur, feine weiße Rahmen, moderne Schriftart wie Inter/Segoe UI).
2.  **Layout:**
    - **Keine Überschrift (H1):** Der visuelle Fokus liegt auf dem Inhalt.
    - **Kein großer Ergebnis-Banner:** Das Ergebnis wird in der Tabelle angezeigt.
    - **Mitte:** Ein großes, dynamisches **SVG-Hexagon** (Schraubenkopf), das sich je nach gewählter Größe skaliert (M3 klein, M64 groß) und bei Änderung leicht rotiert.
    - **Darunter:** Eingabefeld (Nummer) und eine **Schnellauswahl-Tabelle**.
    - **Buttons:** Die Schnellauswahl-Buttons müssen den Text **"M[Größe] | SW [Wert]"** enthalten (z.B. "M6 | SW 10").
    - **Unten:** Eine detaillierte **Datentabelle** (Data Card) als primäre Ergebnisanzeige.
        - Zeilen: Gewinde (M), Schlüsselweite (SW), Steigung (P), Kernloch (Bohrer), Durchgangsloch.
        - Zeige Abweichungen (DIN/ISO) nur an, wenn sie existieren.

### Technische Details
- Nutze `requestAnimationFrame` für die Zahlen-Animation.
- Das SVG soll per JavaScript (`path` d-Attribut) gezeichnet werden, um die Größe dynamisch anzupassen.
- Die Tabelle soll ein sauberes, zeilenbasiertes Layout haben (Hover-Effekte, feine Linien).
