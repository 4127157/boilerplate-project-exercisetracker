const express = require('express');
const app = express();
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors')
require('dotenv').config()


mongoose.connect(process.env.MONGO_URI, {
                                            serverSelectionTimeoutMS: 5000,
                                            retryWrites: true,
                                            useUnifiedTopology: true,
                                            useNewUrlParser: true
                                        })
    .catch(err => console.error(err));



app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:false}));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {
    let usr = req.params.username;
    console.log(usr);
    res.json({
        username: usr
    });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
