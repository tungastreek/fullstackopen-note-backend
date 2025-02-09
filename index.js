const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const NoteModel = require("./src/models/note");

const app = express();
app.use(express.static("dist"));
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/api/notes", (request, response) => {
  NoteModel
    .find()
    .then((notes) => {
      response.json(notes);
    })
    .catch((error) => {
      response.status(500).json({error: error.message});
    });
});

app.get("/api/notes/:id", (request, response) => {
  NoteModel
    .findById(request.params.id)
    .then((note) => {
      if (!note) {
        return response.status(404).end()
      }
      response.json(note);
    })
    .catch((error) => {
      response.status(500).json({error: error.message});
    })
});

app.put("/api/notes/:id", (request, response) => {
  NoteModel
    .findById(request.params.id)
    .then((note) => {
      if (note) {
        const body = request.body;
        if (!body.content) {
          return response.status(400).json({error: "Content is missing"});
        }
        if (body.important === null) {
          return response.status(400).json({error: "Important is missing"});
        }
        note.content = body.content;
        note.important = body.important;
        note.save().then((savedNote) => {
          response.json(savedNote);
        })
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => {
      response.status(500).json({error: error.message});
    });
});

app.delete("/api/notes/:id", (request, response) => {
  NoteModel
    .findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => {
      response.status(500).json({error: error.message});
    })
});

app.post("/api/notes", (request, response) => {
  const body = request.body;
  if (body.content === undefined || body.content.trim() === "") {
    return response.status(400).json({error: "Content is missing"});
  }

  const newNote = new NoteModel({
    content: body.content,
    important: body.important || false,
  });

  newNote
    .save()
    .then((savedNote) => {
      response.json(savedNote);
    })
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server starting on port ${PORT}`);
});
