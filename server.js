import express from "express";
import { readFileSync, writeFileSync } from "node:fs";
import { v4 as uuid } from "uuid";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  const data = readFileSync("sightings.json", "utf-8");
  const result = JSON.parse(data);
  res.json(result);
});

app.post("/", (req, res) => {
  const { species } = req.body;
  const date = new Date();
  const entry = {
    date: date.toISOString().split("T").at(0),
    species,
    id: uuid(),
  };
  // Einlesen der JSON Datei, da wir die Struktur der JSON Datei behalten wollen
  const data = readFileSync("sightings.json", "utf-8");
  // Parsen der Datei, damit wir Array Methoden benutzen können, ansonsten wäre das nur ein String!
  const result = JSON.parse(data);
  result.push(entry);
  // Speichern unseren neuen Array als JSON
  writeFileSync("sightings.json", JSON.stringify(result, null, 2)); // Bessere Formattierung unseren JSON Objektes
  res.send(entry);
});

// einen bestimmten Eintrag anhand einer vohandenen ID löschen
app.delete("/:id", (req, res) => {
  // in req.params ist die id, die in der Url (/:id) eingetragen wird
  const { id } = req.params;
  const data = readFileSync("sightings.json", "utf-8");
  const species = JSON.parse(data);
  // Wir entfernen den Eintrag mit der gesuchten Id
  const result = species.filter((entry) => entry.id !== id);
  writeFileSync("sightings.json", JSON.stringify(result, null, 2));
  res.sendStatus(204); // Status code 204: Erfolgreiche Anfrage auf unseren Server, und kein Rückgabewert wird zurückgeschickt
});

// mit put einen Eintrag suchen und ändern
app.put("/", (req, res) => {
  const { id, species, date } = req.body;

  const data = readFileSync("sightings.json", "utf-8");
  const entries = JSON.parse(data);
  // einen Eintrag anhand der ID suchen
  const entryIndex = entries.findIndex((entry) => entry.id === id);

  if (entryIndex < 0) {
    res.sendStatus(404); // Fehlerbehandlung
    return; // Wichtig, bricht hier die Funktion ab
  } else {
    const { species: oldSpecies, date: oldDate } = entries[entryIndex];
    entries[entryIndex] = {
      id,
      species: species ?? oldSpecies, // wenn kein Eintrag mitgegeben wurde, nimm den alten Eintrag
      date: date ?? oldDate,
    };
    writeFileSync("sightings.json", JSON.stringify(entries, null, 2));
    res.sendStatus(200);
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Server gestartet auf http://localhost:${process.env.PORT}`)
);
