const mongoose = require('mongoose');

const mongoDbUri = process.env.MONGODB_URI;
mongoose.set('strictQuery', false);
mongoose
  .connect(mongoDbUri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.log('Error connecting to MongoDB:', err.message);
  });

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    minlength: 5,
  },
  important: Boolean,
});

noteSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

const NoteModel = mongoose.model('Note', noteSchema);

module.exports = NoteModel;
