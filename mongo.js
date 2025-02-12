const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('Give password as an argument');
  process.exit(1);
}

const dbPassword = process.argv[process.argv.length - 1];
const url = `mongodb+srv://root:${dbPassword}@toycluster0.u5cfb.mongodb.net/noteApp?retryWrites=true&w=majority&appName=ToyCluster0`;

mongoose.set('strictQuery', false);
mongoose.connect(url).then(() => console.log('Connected to MongoDB'));

const noteSchema = mongoose.Schema({
  content: String,
  important: Boolean,
});
const Note = mongoose.model('Note', noteSchema);

// const note = new Note({
//   content: "GET and POST are the most important methods of HTTP protocol",
//   important: true,
// });

// note.save().then((result) => {
//   console.log(result);
//   mongoose.connection.close().then(() => {console.log("Connection closed")});
// });

Note.find({}).then(notes => {
  console.log(notes);
  mongoose.connection.close().then(() => console.log('Connection closed'));
});
