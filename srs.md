# SRS.md – julianverse-uucc

## Projektname

**julianverse-uucc**

Langform:

**Universal Unit & Currency Converter**

Kurzbeschreibung:

Ein schneller, werbefreier Universal-Konverter für Maßeinheiten und Währungen mit freier Texteingabe, URL-Parametern, lokaler Einheitenlogik und API-basierter Währungsumrechnung.

1. Einleitung
1.1 Zweck

Dieses Dokument beschreibt die Anforderungen an einen webbasierten Universal-Rechner zur Umrechnung von Maßeinheiten, Währungen und weiteren numerischen Einheiten.

Ziel ist ein schneller, werbefreier, datensparsamer und alltagstauglicher Rechner, der als Alternative zu Suchmaschinen- oder werbefinanzierten Umrechnungsseiten dient.

Die Anwendung soll besonders für spontane Umrechnungen geeignet sein, z. B. wenn eine Website Preise in US-Dollar anzeigt oder Maßeinheiten wie Inch, Feet, Pounds oder Gallons verwendet werden.

1.2 Projektziel

Das System soll eine einfache Eingabe wie

49.99 USD EUR

oder

5 ft cm

verarbeiten und direkt ein Ergebnis anzeigen.

Zusätzlich soll die Anwendung über URL-Übergabeparameter steuerbar sein, damit bestimmte Umrechnungen direkt per Link geöffnet werden können.

Beispiel:

/?value=49.99&from=USD&to=EUR

oder

/?q=49.99%20USD%20EUR
1.3 Zielgruppe

Die primäre Zielgruppe sind Nutzerinnen und Nutzer, die schnell Einheiten oder Währungen umrechnen möchten, ohne Werbung, Tracking oder unnötige Ablenkung.

Die Anwendung richtet sich besonders an Personen, die regelmäßig mit internationalen Websites, technischen Daten, Rezepten, Preisen oder Maßeinheiten arbeiten.

1.4 Begriffe
Begriff	Bedeutung
Einheit	Eine messbare Größe wie Meter, Kilogramm, Liter oder Celsius
Kategorie	Gruppe zusammengehöriger Einheiten, z. B. Länge, Masse, Temperatur
Währung	Dynamische Einheit wie EUR, USD oder GBP
Umrechnung	Berechnung eines Wertes von einer Einheit in eine andere
URL-Parameter	Übergabewerte in der URL, z. B. ?value=10&from=USD&to=EUR
PWA	Progressive Web App, installierbare Webanwendung
API	Schnittstelle zur Abfrage externer Daten, z. B. Wechselkurse
2. Gesamtbeschreibung
2.1 Produktperspektive

Die Anwendung ist eine eigenständige Webanwendung. Sie soll im Browser laufen und möglichst viele Umrechnungen lokal durchführen.

Nur dynamische Werte, insbesondere Währungen, sollen über externe APIs geladen werden.

Die Anwendung soll optional als PWA installierbar sein.

2.2 Produktfunktionen

Die Anwendung soll folgende Hauptfunktionen bieten:

Umrechnung von festen Maßeinheiten
Umrechnung von Währungen über eine externe API
Unterstützung einer freien Texteingabe
Unterstützung strukturierter URL-Parameter
Unterstützung eines Query-Parameters für freie Eingaben
Verlauf zuletzt genutzter Umrechnungen
Favoriten für häufig verwendete Umrechnungen
Offline-Nutzung für feste Maßeinheiten
Caching von Währungskursen
Anzeige des Kursdatums bei Währungen
Kopieren des Ergebnisses
Responsive Design für Desktop und Mobilgeräte
2.3 Benutzerklassen
Normale Nutzer

Normale Nutzer möchten schnell eine Umrechnung durchführen, ohne sich mit technischen Details zu beschäftigen.

Power-User

Power-User möchten direkte Links, URL-Parameter, Shortcuts und schnelle Tastaturbedienung verwenden.

Entwickler

Entwickler möchten die Anwendung erweitern, neue Einheiten hinzufügen oder eigene Konverter-Module ergänzen.

2.4 Betriebsumgebung

Die Anwendung soll in modernen Browsern funktionieren:

Firefox
Chrome
Chromium-basierte Browser
Safari
Mobile Browser auf Android und iOS

Die Anwendung soll ohne Serverlogik betreibbar sein, sofern keine eigene Proxy-API für Wechselkurse verwendet wird.

Mögliche Hosting-Optionen:

GitHub Pages
Netlify
Vercel
eigener Webserver
statisches Hosting
2.5 Einschränkungen
Feste Maßeinheiten sollen ohne API berechnet werden.
Währungen benötigen aktuelle Wechselkurse aus einer externen Quelle.
Wechselkurse sind nicht sekundengenau und sollen als Referenzwerte behandelt werden.
Die Anwendung ersetzt keine professionelle Finanzsoftware.
Die Anwendung soll keine personenbezogenen Daten erfassen.
Die Anwendung soll möglichst ohne Cookies funktionieren.
3. Funktionale Anforderungen
3.1 Freie Eingabe
FR-001 – Texteingabe

Die Anwendung muss eine zentrale Texteingabe bereitstellen.

Beispiele:

10 USD EUR
10 USD to EUR
10 USD in EUR
10 dollar euro
5 ft cm
180 cm ft
32 oz l
98 F C
FR-002 – Automatische Interpretation

Die Anwendung muss versuchen, Eingaben automatisch zu interpretieren.

Eine Eingabe soll mindestens bestehen aus:

Zahlenwert
Ausgangseinheit
Zieleinheit

Beispiel:

49.99 USD EUR

wird interpretiert als:

{
  "value": 49.99,
  "from": "USD",
  "to": "EUR"
}
FR-003 – Unterstützte Trennwörter

Die Anwendung soll folgende Trennwörter unterstützen:

to
in
nach
zu
as
=>
->

Beispiele:

10 usd to eur
10 usd in eur
10 usd -> eur
10 usd nach eur
FR-004 – Dezimaltrennzeichen

Die Anwendung soll sowohl Punkt als auch Komma als Dezimaltrennzeichen akzeptieren.

Beispiele:

10.5 USD EUR
10,5 USD EUR
FR-005 – Fehlertoleranz

Die Anwendung soll übliche Aliase erkennen.

Beispiele:

Eingabe	Interne Einheit
euro	EUR
eur	EUR
€	EUR
dollar	USD
usd	USD
$	USD
meter	m
metre	m
meters	m
km	km
kilometer	km
feet	ft
foot	ft
inch	in
inches	in
zoll	in
3.2 Lokale Einheitenumrechnung
FR-006 – Lokale Konvertierung

Die Anwendung muss feste Maßeinheiten lokal berechnen können, ohne externe API.

FR-007 – Unterstützte Kategorien

Die Anwendung soll mindestens folgende Kategorien unterstützen:

Länge
Masse / Gewicht
Fläche
Volumen
Geschwindigkeit
Temperatur
Zeit
Datenmengen
Energie
FR-008 – Länge

Die Anwendung soll mindestens folgende Längeneinheiten unterstützen:

Millimeter
Zentimeter
Meter
Kilometer
Inch
Foot
Yard
Mile
Nautical Mile
FR-009 – Masse

Die Anwendung soll mindestens folgende Masseeinheiten unterstützen:

Milligramm
Gramm
Kilogramm
Tonne
Ounce
Pound
Stone
FR-010 – Fläche

Die Anwendung soll mindestens folgende Flächeneinheiten unterstützen:

Quadratmillimeter
Quadratzentimeter
Quadratmeter
Quadratkilometer
Hektar
Acre
Square Foot
Square Mile
FR-011 – Volumen

Die Anwendung soll mindestens folgende Volumeneinheiten unterstützen:

Milliliter
Liter
Kubikmeter
Teaspoon
Tablespoon
Fluid Ounce
Cup
Pint
Quart
Gallon
FR-012 – Geschwindigkeit

Die Anwendung soll mindestens folgende Geschwindigkeitseinheiten unterstützen:

Meter pro Sekunde
Kilometer pro Stunde
Meilen pro Stunde
Knoten
FR-013 – Temperatur

Die Anwendung muss Temperaturumrechnungen mit Offset unterstützen.

Unterstützte Einheiten:

Celsius
Fahrenheit
Kelvin

Temperatur darf nicht nur über lineare Faktoren berechnet werden.

FR-014 – Zeit

Die Anwendung soll mindestens folgende Zeiteinheiten unterstützen:

Millisekunde
Sekunde
Minute
Stunde
Tag
Woche
Jahr
FR-015 – Datenmengen

Die Anwendung soll Dezimal- und Binäreinheiten unterscheiden können.

Dezimale Einheiten:

B
KB
MB
GB
TB

Binäre Einheiten:

KiB
MiB
GiB
TiB
FR-016 – Energie

Die Anwendung soll mindestens folgende Energieeinheiten unterstützen:

Joule
Kilojoule
Wattstunde
Kilowattstunde
Kalorie
Kilokalorie
3.3 Währungsumrechnung
FR-017 – Währungsumrechnung

Die Anwendung muss Währungen umrechnen können.

Beispiele:

49.99 USD EUR
100 GBP EUR
250 EUR JPY
FR-018 – Wechselkurs-API

Die Anwendung soll eine externe Wechselkurs-API verwenden.

Empfohlene Standard-API:

Frankfurter API
FR-019 – API-Austauschbarkeit

Die Anwendung soll so aufgebaut sein, dass die Wechselkurs-API später ersetzt werden kann.

Dafür soll ein eigenes Modul verwendet werden, z. B.:

src/converters/currency.js
FR-020 – Caching

Die Anwendung muss Wechselkurse lokal cachen.

Der Cache soll verhindern, dass bei jeder Eingabe eine neue API-Anfrage gesendet wird.

Empfohlene Cache-Dauer:

6 Stunden
FR-021 – Kursdatum

Bei Währungsumrechnungen muss das Datum des verwendeten Wechselkurses angezeigt werden.

Beispiel:

49.99 USD ≈ 46.12 EUR
Kursdatum: 2026-06-08
FR-022 – API-Ausfall

Wenn die Wechselkurs-API nicht erreichbar ist, soll die Anwendung:

eine verständliche Fehlermeldung anzeigen
falls möglich gecachte Kurse verwenden
anzeigen, dass der verwendete Kurs eventuell veraltet ist
4. URL-Übergabeparameter
4.1 Zweck

Die Anwendung muss per URL-Parameter steuerbar sein.

Dadurch können direkte Links auf bestimmte Umrechnungen erstellt werden.

Beispiele:

/?value=49.99&from=USD&to=EUR
/?q=49.99%20USD%20EUR
4.2 Strukturierte Parameter
FR-023 – Parameter value

Der Parameter value gibt den umzuwandelnden Zahlenwert an.

Beispiel:

/?value=49.99&from=USD&to=EUR
FR-024 – Parameter from

Der Parameter from gibt die Ausgangseinheit an.

Beispiel:

from=USD
FR-025 – Parameter to

Der Parameter to gibt die Zieleinheit an.

Beispiel:

to=EUR
FR-026 – Automatische Ausführung

Wenn value, from und to vorhanden sind, muss die Anwendung die Umrechnung automatisch beim Laden der Seite ausführen.

Beispiel:

/?value=10&from=km&to=mi
FR-027 – Fehlende Parameter

Wenn einer der Pflichtparameter fehlt, soll keine fehlerhafte Berechnung ausgeführt werden.

Stattdessen soll die Anwendung die vorhandenen Werte in die UI übernehmen und eine neutrale Eingabeaufforderung anzeigen.

4.3 Freier Query-Parameter
FR-028 – Parameter q

Die Anwendung muss den Parameter q unterstützen.

Der Parameter q enthält eine freie Eingabe.

Beispiel:

/?q=49.99%20USD%20EUR

Dies entspricht der manuellen Eingabe:

49.99 USD EUR
FR-029 – Priorität von q

Wenn q vorhanden ist, soll q bevorzugt verarbeitet werden.

Beispiel:

/?q=10%20USD%20EUR&value=5&from=km&to=mi

In diesem Fall soll die Anwendung 10 USD EUR ausführen.

FR-030 – URL-Decoding

Die Anwendung muss URL-codierte Zeichen korrekt dekodieren.

Beispiele:

URL	Eingabe
?q=10%20USD%20EUR	10 USD EUR
?q=10+USD+EUR	10 USD EUR
?q=10%2C5%20EUR%20USD	10,5 EUR USD
4.4 Optionale URL-Parameter
FR-031 – Parameter precision

Die Anwendung soll optional den Parameter precision unterstützen.

Dieser gibt die Anzahl der Nachkommastellen an.

Beispiel:

/?value=49.99&from=USD&to=EUR&precision=2
FR-032 – Parameter copy

Die Anwendung kann optional den Parameter copy unterstützen.

Wenn copy=true gesetzt ist, kann das Ergebnis nach der Berechnung automatisch zum Kopieren vorbereitet werden.

Aus Sicherheits- und Browsergründen soll nicht garantiert werden, dass automatisch in die Zwischenablage geschrieben wird.

Beispiel:

/?q=49.99%20USD%20EUR&copy=true
FR-033 – Parameter theme

Die Anwendung soll optional einen Theme-Parameter unterstützen.

Mögliche Werte:

system
light
dark

Beispiel:

/?theme=dark
FR-034 – Parameter lang

Die Anwendung soll optional einen Sprachparameter unterstützen.

Mögliche Werte:

de
en

Beispiel:

/?lang=de
4.5 Shareable URLs
FR-035 – Link-Erzeugung

Nach einer erfolgreichen Umrechnung soll die Anwendung einen teilbaren Link erzeugen können.

Beispiel:

https://example.com/?q=49.99%20USD%20EUR
FR-036 – Kanonische URL

Die Anwendung soll für Umrechnungen bevorzugt eine kanonische URL mit q erzeugen.

Beispiel:

/?q=49.99%20USD%20EUR

Alternativ kann für maschinelle Nutzung die strukturierte Form verwendet werden:

/?value=49.99&from=USD&to=EUR
5. Benutzeroberfläche
5.1 Hauptansicht
UI-001 – Zentrale Eingabe

Die Anwendung muss eine zentrale Eingabezeile besitzen.

Die Eingabezeile soll beim Laden der Seite automatisch fokussiert werden.

UI-002 – Ergebnisanzeige

Nach einer erfolgreichen Umrechnung soll das Ergebnis prominent angezeigt werden.

Beispiel:

49.99 USD ≈ 46.12 EUR
UI-003 – Detailanzeige

Die Anwendung soll Zusatzinformationen anzeigen können.

Beispiele:

1 USD = 0.9226 EUR
Kursdatum: 2026-06-08

oder

1 ft = 30.48 cm
UI-004 – Fehlermeldungen

Fehlermeldungen sollen verständlich und nicht technisch formuliert sein.

Beispiel:

Diese Umrechnung konnte nicht erkannt werden.

statt:

ParserError: Invalid token at index 3
UI-005 – Verlauf

Die Anwendung soll einen Verlauf zuletzt verwendeter Umrechnungen anzeigen.

Der Verlauf soll lokal im Browser gespeichert werden.

UI-006 – Favoriten

Die Anwendung soll häufig genutzte Umrechnungen als Favoriten speichern können.

Beispiele:

USD → EUR
GBP → EUR
ft → cm
inch → cm
°F → °C
UI-007 – Ergebnis kopieren

Die Anwendung soll eine Schaltfläche zum Kopieren des Ergebnisses anbieten.

UI-008 – Link kopieren

Die Anwendung soll eine Schaltfläche zum Kopieren eines teilbaren Links anbieten.

6. Nichtfunktionale Anforderungen
6.1 Performance
NFR-001 – Schnelle lokale Berechnung

Lokale Einheitenumrechnungen müssen ohne spürbare Verzögerung erfolgen.

NFR-002 – Schneller Start

Die Anwendung soll schnell laden und keine unnötig großen Abhängigkeiten verwenden.

NFR-003 – API-Anfragen minimieren

Währungsumrechnungen sollen durch Caching möglichst wenige API-Anfragen auslösen.

6.2 Datenschutz
NFR-004 – Keine Werbung

Die Anwendung darf keine Werbung anzeigen.

NFR-005 – Kein Tracking

Die Anwendung darf kein Tracking enthalten.

NFR-006 – Keine unnötigen externen Dienste

Externe Dienste dürfen nur verwendet werden, wenn sie für die Funktion notwendig sind.

Für die Grundfunktionalität fester Einheiten sind keine externen Dienste erlaubt.

NFR-007 – Lokale Speicherung

Verlauf, Favoriten und Cache sollen lokal im Browser gespeichert werden.

Mögliche Speicherorte:

localStorage
IndexedDB
6.3 Offlinefähigkeit
NFR-008 – Offline-Nutzung

Die Anwendung soll feste Einheiten auch offline umrechnen können.

NFR-009 – Währungen offline

Währungsumrechnungen sollen offline nur möglich sein, wenn ein gültiger oder alter Cache vorhanden ist.

In diesem Fall muss angezeigt werden, dass der Kurs aus dem Cache stammt.

6.4 Wartbarkeit
NFR-010 – Modulare Struktur

Die Anwendung muss modular aufgebaut sein.

Empfohlene Struktur:

src/
├─ app.js
├─ parser.js
├─ router.js
├─ converters/
│  ├─ units.js
│  ├─ currency.js
│  ├─ temperature.js
│  └─ index.js
├─ data/
│  ├─ unit-definitions.js
│  ├─ aliases.js
│  └─ currencies.js
├─ storage.js
└─ ui.js
NFR-011 – Erweiterbarkeit

Neue Einheiten und Kategorien sollen ohne größere Änderungen an der Kernlogik ergänzt werden können.

NFR-012 – API-Abstraktion

Die Wechselkurs-API soll über eine eigene Abstraktionsschicht angebunden werden.

7. Datenmodell
7.1 Einheitendefinition

Eine Einheit soll mindestens folgende Felder besitzen:

{
  id: "km",
  label: "Kilometer",
  aliases: ["kilometer", "kilometers", "kilometre", "kilometres"],
  category: "length",
  factorToBase: 1000
}
7.2 Kategorie

Eine Kategorie soll mindestens folgende Felder besitzen:

{
  id: "length",
  label: "Länge",
  baseUnit: "m",
  units: []
}
7.3 Umrechnungsanfrage

Eine Umrechnungsanfrage soll intern so dargestellt werden:

{
  value: 49.99,
  from: "USD",
  to: "EUR",
  precision: 2
}
7.4 Umrechnungsergebnis

Ein Umrechnungsergebnis soll intern so dargestellt werden:

{
  inputValue: 49.99,
  inputUnit: "USD",
  outputValue: 46.12,
  outputUnit: "EUR",
  category: "currency",
  rate: 0.9226,
  date: "2026-06-08",
  source: "Frankfurter API",
  cached: false
}

Für lokale Einheiten kann das Ergebnis so aussehen:

{
  inputValue: 5,
  inputUnit: "ft",
  outputValue: 152.4,
  outputUnit: "cm",
  category: "length",
  factor: 30.48
}
8. Parsing-Regeln
8.1 Grundformat

Die Anwendung soll folgende Grundformate erkennen:

<value> <from> <to>
<value> <from> to <to>
<value> <from> in <to>
<value> <from> nach <to>
<value> <from> -> <to>
<value> <from> => <to>
8.2 Beispiele
Eingabe	Erwartete Interpretation
10 usd eur	10 USD → EUR
10 usd to eur	10 USD → EUR
10 usd in eur	10 USD → EUR
10 usd nach eur	10 USD → EUR
10 km mi	10 km → mi
5 ft cm	5 ft → cm
98 f c	98 °F → °C
1 gb mib	1 GB → MiB
8.3 Normalisierung

Vor dem Parsen soll die Eingabe normalisiert werden:

führende und folgende Leerzeichen entfernen
mehrere Leerzeichen zusammenfassen
Dezimalkomma zu Dezimalpunkt umwandeln
Einheiten-Aliase normalisieren
Groß-/Kleinschreibung ignorieren, außer bei Einheiten mit relevanter Schreibweise
8.4 Konflikte

Bei mehrdeutigen Einheiten muss die Anwendung entweder:

eine sinnvolle Standardinterpretation wählen
oder eine Rückfrage bzw. Auswahl anzeigen

Beispiel:

oz

kann bedeuten:

ounce als Masse
fluid ounce als Volumen

In diesem Fall soll abhängig vom Zieltyp entschieden werden.

Beispiel:

10 oz g

bedeutet Masse.

10 oz ml

bedeutet Volumen.

9. Fehlerfälle
9.1 Unbekannte Einheit

Wenn eine Einheit nicht erkannt wird, soll eine verständliche Fehlermeldung angezeigt werden.

Beispiel:

Die Einheit "banane" ist nicht bekannt.
9.2 Unpassende Kategorien

Wenn zwei Einheiten nicht kompatibel sind, soll eine Fehlermeldung angezeigt werden.

Beispiel:

Meter kann nicht direkt in Euro umgerechnet werden.
9.3 Ungültiger Zahlenwert

Wenn der Zahlenwert nicht erkannt wird, soll eine Fehlermeldung angezeigt werden.

Beispiel:

Bitte gib einen gültigen Zahlenwert ein.
9.4 API nicht erreichbar

Wenn die Währungs-API nicht erreichbar ist, soll eine Fehlermeldung angezeigt werden.

Falls ein Cache vorhanden ist, soll dieser verwendet werden.

9.5 Ungültige URL-Parameter

Wenn URL-Parameter ungültig sind, soll die Anwendung nicht abstürzen.

Stattdessen soll sie:

die Startseite anzeigen
eine verständliche Meldung ausgeben
vorhandene verwertbare Werte übernehmen
10. Sicherheit
10.1 Eingaben

Alle Nutzereingaben müssen als unsicher behandelt werden.

Die Anwendung darf Eingaben nicht ungefiltert als HTML ausgeben.

10.2 XSS-Schutz

Ergebnisse und Fehlermeldungen müssen über sichere DOM-Methoden ausgegeben werden.

Nicht erlaubt:

element.innerHTML = userInput;

Empfohlen:

element.textContent = userInput;
10.3 API-Daten

Daten aus externen APIs müssen validiert werden, bevor sie verwendet werden.

11. PWA-Anforderungen
11.1 Installierbarkeit

Die Anwendung soll optional als PWA installierbar sein.

Dazu sollen vorhanden sein:

manifest.json
App-Icon
Service Worker
11.2 Offline-Cache

Der Service Worker soll statische Dateien cachen:

HTML
CSS
JavaScript
Icons
lokale Einheitendaten
11.3 Update-Verhalten

Bei einer neuen Version soll die Anwendung aktualisiert werden können, ohne bestehende Favoriten oder Verlaufsdaten zu löschen.

12. Lokale Speicherung
12.1 Verlauf

Der Verlauf soll lokal gespeichert werden.

Ein Verlaufseintrag soll enthalten:

{
  query: "49.99 USD EUR",
  result: "49.99 USD ≈ 46.12 EUR",
  timestamp: 1780915200000
}
12.2 Favoriten

Favoriten sollen lokal gespeichert werden.

Ein Favorit soll enthalten:

{
  from: "USD",
  to: "EUR",
  label: "USD → EUR"
}
12.3 Währungscache

Der Währungscache soll lokal gespeichert werden.

Beispiel:

{
  "USD": {
    "timestamp": 1780915200000,
    "date": "2026-06-08",
    "rates": {
      "EUR": 0.9226,
      "GBP": 0.7891
    }
  }
}
13. Akzeptanzkriterien
13.1 Grundfunktion

Die Anwendung gilt als funktionsfähig, wenn folgende Eingaben korrekt verarbeitet werden:

10 km mi
5 ft cm
98 f c
49.99 usd eur
1 gb mib
13.2 URL-Parameter

Die Anwendung erfüllt die URL-Anforderung, wenn folgende Links automatisch funktionieren:

/?value=10&from=km&to=mi
/?value=49.99&from=USD&to=EUR
/?q=5%20ft%20cm
/?q=98%20f%20c
13.3 Offline-Funktion

Die Anwendung erfüllt die Offline-Anforderung, wenn nach dem ersten Laden folgende Umrechnungen ohne Internet funktionieren:

10 km mi
5 ft cm
98 f c
1 gb mib
13.4 Datenschutz

Die Anwendung erfüllt die Datenschutzanforderung, wenn:

keine Werbung eingebunden ist
kein Tracking eingebunden ist
keine unnötigen externen Skripte geladen werden
lokale Einheiten ohne externe Anfrage funktionieren
14. Priorisierung
14.1 Muss-Anforderungen
Freie Eingabe
Lokale Einheitenumrechnung
Währungsumrechnung
URL-Parameter value, from, to
URL-Parameter q
Fehlermeldungen
Lokaler Cache für Währungen
Keine Werbung
Kein Tracking
14.2 Sollte-Anforderungen
Verlauf
Favoriten
Ergebnis kopieren
Link kopieren
PWA-Unterstützung
Offline-Unterstützung
Theme-Auswahl
14.3 Kann-Anforderungen
Mehrsprachigkeit
Automatische Zwischenablage-Vorbereitung
Erweiterte Alias-Erkennung
Einheitenvorschläge während der Eingabe
QR-Code für teilbare Links
Widget-Modus
Browser-Suchmaschinenintegration über OpenSearch
15. Mögliche spätere Erweiterungen
15.1 OpenSearch

Die Anwendung kann später als benutzerdefinierte Suchmaschine im Browser registriert werden.

Beispiel:

conv 49.99 usd eur
15.2 Browser-Shortcut

Die Anwendung kann so erweitert werden, dass sie direkt über die Adressleiste genutzt werden kann.

15.3 Widget-Modus

Ein kompakter Modus kann für Einbettungen oder kleine Fenster bereitgestellt werden.

Beispiel:

/?q=49.99%20USD%20EUR&mode=compact
15.4 Weitere dynamische Kategorien

Später könnten zusätzliche dynamische Kategorien ergänzt werden:

Kryptowährungen
Edelmetalle
Kraftstoffpreise
Strompreise

Diese Kategorien sollen jedoch klar von festen Einheiten getrennt werden.

16. Technischer Vorschlag
16.1 Empfohlene Technologien

Die Anwendung kann mit folgenden Technologien umgesetzt werden:

HTML
CSS
JavaScript
optional TypeScript
optional Vite
optional PWA-Service-Worker
16.2 Empfohlene Projektstruktur
universal-converter/
├─ index.html
├─ manifest.json
├─ sw.js
├─ README.md
├─ SRS.md
└─ src/
   ├─ app.js
   ├─ parser.js
   ├─ router.js
   ├─ storage.js
   ├─ ui.js
   ├─ converters/
   │  ├─ index.js
   │  ├─ units.js
   │  ├─ temperature.js
   │  └─ currency.js
   └─ data/
      ├─ aliases.js
      ├─ unit-definitions.js
      └─ currencies.js
16.3 Beispiel-URL-Verarbeitung
function readUrlInput() {
  const params = new URLSearchParams(window.location.search);

  const q = params.get("q");
  if (q) {
    return {
      type: "query",
      query: q
    };
  }

  const value = params.get("value");
  const from = params.get("from");
  const to = params.get("to");

  if (value && from && to) {
    return {
      type: "structured",
      value,
      from,
      to,
      precision: params.get("precision")
    };
  }

  return null;
}
16.4 Beispiel-Ablauf
1. Seite lädt
2. URL-Parameter werden gelesen
3. Falls q vorhanden ist:
   3.1 q wird in die Eingabezeile geschrieben
   3.2 q wird geparst
   3.3 Umrechnung wird ausgeführt
4. Falls value/from/to vorhanden sind:
   4.1 Werte werden normalisiert
   4.2 Umrechnung wird ausgeführt
5. Ergebnis wird angezeigt
6. Verlauf wird aktualisiert
7. Share-URL wird erzeugt
17. Offene Punkte

Folgende Punkte müssen während der Entwicklung entschieden werden:

Soll TypeScript verwendet werden?
Soll die Anwendung ein eigenes Designsystem bekommen?
Welche Wechselkurs-API wird final genutzt?
Wie viele Einheiten sollen in Version 1 enthalten sein?
Soll der Verlauf standardmäßig aktiviert sein?
Soll es eine Option zum Löschen aller lokalen Daten geben?
Soll die Anwendung deutsch, englisch oder zweisprachig starten?
Soll es einen kompakten Embed-Modus geben?
18. Versionierung
Version	Datum	Beschreibung
1.0.0	2026-06-08	Erste Spezifikation