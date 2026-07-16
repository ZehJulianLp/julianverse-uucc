# julianverse-uucc

Universal Unit & Currency Converter: ein schneller, statisch hostbarer Konverter für Einheiten, Währungen und ein paar praktische Spezialrechner.

Die App läuft komplett mit HTML, CSS und JavaScript ohne Build-Schritt. Feste Einheiten werden lokal berechnet. Währungen werden über die Frankfurter API geladen und lokal gecacht.

## Features

- Freitext-Eingabe wie `10km mi`, `1/2 cup ml`, `2 * 49.99 usd eur`
- Alternative Eingabe mit Wert/Von/Nach-Dropdowns
- Lokale Einheitenumrechnung für viele technische, alltägliche und Webdev-Einheiten
- Währungsumrechnung mit Kursdatum und Cache
- URL-Parameter, z. B. `/?q=49.99%20USD%20EUR`
- Verlauf und Favoriten in `localStorage`
- Ergebnis und Share-Link kopieren
- PWA-Dateien und Service Worker
- OpenSearch-Datei für Browser-Suche
- Alles-Modus für bewusst absurde Umrechnungen

## Beispiele

```text
10km mi
1mm m
5 ft cm
98 f c
1 gb mib
49.99 eur usd
1 PS kW
760 torr atm
100 Mbit/s MB/s
2.5 rem px
1920x1080 px MP
3 shulker items
1 nether_block block
50GB 100Mbit/s time
5000mAh 3.7V Wh
600km 7l/100km eur
100km car co2
```

## Einheitenbereiche

- Länge, Masse, Fläche, Volumen
- Geschwindigkeit, Beschleunigung, Durchfluss
- Temperatur, Zeit, Uhrwinkel
- Datenmenge und Datenrate
- Energie, Leistung, Drehmoment, Kraft
- Druck, Dichte, Frequenz
- Elektrik: Spannung, Strom, Widerstand, Ladung, Kapazität, Induktivität
- Licht, Radioaktivität, Magnetismus
- Konzentration, Stoffmenge, Viskosität
- Typografie/CSS: `px`, `rem`, `em`, `pt`, `pc`, `vw`, `vh`, `ch`, `lh`, usw.
- Minecraft: Blocks, Chunks, Regions, Nether/Overworld, Stacks, Shulker, Chests
- Bildgröße, Pixeldichte, Papierformate
- Schuhgrößen und Ringgrößen
- Währungen per Frankfurter API

## Spezialrechner

Einige Eingaben sind keine einfache Einheitenumrechnung, sondern kleine Rechner:

```text
1920x1080 ratio
1920x1080 rgba MB
300 dpi 10cm px
50GB 100Mbit/s time
350W 4h eur
2 kWh eur
600km 7l/100km eur
5000mAh 3.7V Wh
100km car co2
```

Die Annahmen für CSS, Viewport, Strompreis, Spritpreis und CO2-Faktor sind in der UI einstellbar und werden lokal gespeichert.

## Alles-Modus

Der Alles-Modus erlaubt absurde Umrechnungen wie:

```text
1mm eur
10 USD km
1 meeting eur
```

Diese Ergebnisse sind bewusst als Spaßmodus markiert und nicht physikalisch oder finanziell sinnvoll.

## URL-Parameter

Freie Eingabe:

```text
/?q=10%20km%20mi
```

Strukturierte Eingabe:

```text
/?value=49.99&from=USD&to=EUR
```

Optionale Parameter:

```text
precision=2
theme=system|light|dark
lang=de|en
mode=compact
copy=true
```

## Lokal starten

```bash
npm run serve
```

oder direkt:

```bash
python3 -m http.server 4173
```

Dann öffnen:

```text
http://localhost:4173/
```

## Tests

```bash
npm test
```

Die Tests prüfen Kernumrechnungen, neue Spezialfälle und den Alles-Modus.

## Projektstruktur

```text
.
├── index.html
├── styles.css
├── manifest.json
├── opensearch.xml
├── sw.js
├── src
│   ├── app.js
│   ├── parser.js
│   ├── router.js
│   ├── storage.js
│   ├── ui.js
│   ├── converters
│   │   ├── absurd.js
│   │   ├── currency.js
│   │   ├── index.js
│   │   ├── special.js
│   │   ├── temperature.js
│   │   └── units.js
│   └── data
│       ├── aliases.js
│       ├── currencies.js
│       └── unit-definitions.js
└── tests
    └── acceptance.mjs
```

## Datenschutz

- Keine Werbung
- Kein Tracking
- Keine externen Skripte
- Lokale Einheiten funktionieren ohne Netzwerk
- Verlauf, Favoriten, Einstellungen und Währungscache liegen lokal im Browser
- Netzwerkzugriff wird nur für Währungen und die optionale Währungsliste genutzt

## Hinweise

- Währungskurse sind Referenzwerte und nicht sekundengenau.
- Schuh- und Ringgrößen sind näherungsweise Tabellen/Formeln.
- CSS-Viewport-Einheiten nutzen die in der UI eingestellten Annahmen.
- Strom-, Sprit- und CO2-Rechner verwenden konfigurierbare Annahmen.
