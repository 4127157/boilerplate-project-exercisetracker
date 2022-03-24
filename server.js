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

const Schema = mongoose.Schema;

const logSchema = new Schema({
    description: String,
    duration: Number,
    date: String
});

const userSchema = new Schema({
    username: String,
    log: [logSchema]
    });

const User = mongoose.model("USER", userSchema);

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:false}));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {
    let usr = req.body.username;
    try{
        let findUser = await User.findOne({
            username: usr
        });
        let temp = findUser.select({username: 1, _id:1});
        if(findUser) {
            res.json(temp);
        } else {
            findUser = new User({
                username: usr
            });
            await findUser.save();
            res.json(temp);
        }
    } catch (err) {
        console.error(err);
        res.json({
            "error": "There was a server error while processing your request. Try again later."
        });
    }       
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
