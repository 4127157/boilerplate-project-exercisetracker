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
    log: [logSchema],
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
        let temp = async () =>{ 
            let tempo = await User.findOne({username:usr}).select({username: 1, _id: 1});
            return {
                username: tempo.username,
                _id: tempo._id
            };
        }
        if(findUser) {
            res.json( await temp());
        } else {
            findUser = new User({
                username: usr
            });
            await findUser.save();
            res.json( await temp());
        }
    } catch (err) {
        console.error(err);
        res.json({
            "error": "There was a server error while processing your request. Try again later."
        });
    }       
});

app.get('/api/users', async (req, res) => {
    let retObj = await User.find().select({__v:0, log:0});
    res.json(retObj);
});

app.get('/api/users/:id/logs', async (req, res) => {
    console.log(req.params.id);
    let userId = req.params.id;
    let findUser = async () => {
        let temp;
        try {
            temp = await User.findOne({
                _id:userId
            });
        } catch (err) {
            res.json({"error":"User does not exist or there was an error"});
            console.error(err);
        }
        return temp;
    }
    findUser = await findUser();
    console.log(findUser.log);
});


app.post('/api/users/:_id/exercises', async (req, res) => {
    let userId = req.params._id;
    let findUser = async () => {
        let temp;
        try {
            temp = await User.findOne({
                _id:userId
            });
        } catch (err) {
            res.json({"error":"User does not exist or there was an error"});
            console.error(err);
        }
        return temp;
    }
    let logDesc = req.body.description;
    let logDur = req.body.duration;
    let logDate = req.body.date;
    
    console.log(await findUser());
    if(await findUser()){
        if(!logDesc || !logDur){
            res.json({
                "error":"Missing required field(s)"
            });
        } else { 
            if(!logDate) {
                let date = new Date();
                let temp = date.getMonth() < 10 ? '0'+(date.getMonth()+1) : (date.getMonth()+1);
                logDate = new Date(`${date.getFullYear()}-${temp}-${date.getDate()}`).toDateString();
            }
            let tempUser = await findUser();
            let updateUser = await User.updateOne(
                {username: tempUser.username}, 
                {
                    $push : {
                        log : {
                            description: logDesc,
                            duration: parseInt(logDur),
                            date: logDate
                        }
                    }
                });
            tempUser = await User.findOne({_id:userId});
            console.log(tempUser.log.length); //Useful for logs endpoint
            res.json({
                username: tempUser.username,
                description: logDesc,
                duration: logDur,
                date: logDate,
                _id: tempUser._id
            });
        }
    }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
