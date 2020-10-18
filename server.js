// importing
import express from 'express';
import mongoose from 'mongoose';
import Pusher from 'pusher'


// model 
import Message from './models/Messages.js'

import { MONGO_CONNECTION, PUSHER_CONFIG } from './config/connections.js'
// app config 
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Header", "*");
    next();
})

// DB config
mongoose.connect(MONGO_CONNECTION, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log(`connected to mongoDB : ${mongoose.connection.name}`))
    .catch(e => console.log(`error while connecting to mongoDB , message : ${e}`))

// pusher
const pusher = new Pusher(PUSHER_CONFIG);

const db = mongoose.connection;
db.once('open', () => {
    const messageCollection = db.collection('messages');
    const changeStream = messageCollection.watch();


    changeStream.on('change', change => {
        change.operationType === 'insert' ?
            pusher.trigger('messages', 'inserted', {
                name: change.fullDocument.name,
                message: change.fullDocument.message,
            })
            : console.log('Error triggering Pusher')
    })
});




// api routers
app.get('/api/messages/sync', (req, res) => {
    Message.find((err, data) => {
        err ? res.status(500).send(err) : res.status(200).send(data);
    })
})

app.post('/api/message/new', (req, res) => {
    const dbMessage = req.body;
    Message.create(dbMessage, (err, data) => {
        err ? res.status(500).send(err) : res.status(200).send(`new message created: \n ${data}`)
    })
})


// listed
app.listen(port, () => console.log(`Listening on port : ${port}`))