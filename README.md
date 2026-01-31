# 🎮 Webgame Repository

Eine Sammlung von interaktiven Web-Spielen und -Anwendungen, die automatisch in das Portfolio von Abdulkerim Sesli geladen werden.

## 📁 Struktur

```
Webgame/
├── README.md
├── LICENSE
└── apps/
    ├── schere-stein-papier/
    ├── zahlen-raten/
    ├── color-changer/
    ├── todo-liste/
    └── [weitere-projekte]/
```

## 🚀 Apps

Alle Apps im `apps/` Ordner werden automatisch auf [abdulkerimsesli.de/projekte](https://www.abdulkerimsesli.de/projekte/) angezeigt.

### Verfügbare Apps:

- **Schere Stein Papier** - Der Klassiker gegen den Computer
- **Zahlen Raten** - Finde die geheime Zahl zwischen 1 und 100
- **Color Changer** - Dynamische Hintergrundfarben per Klick
- **To-Do Liste** - Produktivitäts-Tool zum Verwalten von Aufgaben

## 📋 App-Struktur

Jede App sollte folgende Struktur haben:

```
apps/app-name/
├── index.html          # Haupt-App-Datei
├── package.json        # Metadaten für automatisches Laden
├── README.md           # Projektbeschreibung (optional)
└── assets/             # Bilder, Icons, etc. (optional)
```

## 🔧 Neue App hinzufügen

1. Erstelle einen neuen Ordner in `apps/`
2. Füge `index.html` und `package.json` hinzu
3. Teste die App lokal
4. Committe und pushe zum Repository
5. Die App erscheint automatisch im Portfolio

## 📱 Anforderungen

- Responsive Design (Mobile-first)
- Vanilla JavaScript bevorzugt
- Inline CSS/JS für Performance
- Keine externen CSS-Frameworks
- Schnelle Ladezeiten (< 2 Sekunden)

## 🏷️ Kategorien

- **game**: Spiele und Unterhaltung
- **puzzle**: Logik-Spiele und Rätsel
- **ui**: Design-Tools und UI-Komponenten
- **productivity**: Produktivitäts-Tools
- **web**: Web-APIs und Services
- **utility**: Hilfsprogramme und Rechner

## ✨ Card Integration

Alle Apps werden jetzt durch eine zentrale Datei `card-integration.css` (Root) für die Portfolio-Card-Ansicht optimiert. Diese Datei sorgt für:

- Transparente Hintergründe und keine Vollbild-Overlays
- Responsives Verhalten in Card-Größen (1000×600 und 350×500)
- Einheitliche Container-Styles (`.app-container`, `.game-container`, `#root`, `main`, ...)

Zum Testen steht `card-test.html` im Projekt-Root zur Verfügung. Öffne die Datei über einen lokalen Server (z.B. `python -m http.server`) und prüfe jede App in den Größen 1000×600 und 350×500.

## 📄 Lizenz

MIT License - Siehe [LICENSE](LICENSE) für Details.

## 👨‍💻 Autor

**Abdulkerim Sesli**

- Website: [abdulkerimsesli.de](https://www.abdulkerimsesli.de)
- Portfolio: [abdulkerimsesli.de/projekte](https://www.abdulkerimsesli.de/projekte)
