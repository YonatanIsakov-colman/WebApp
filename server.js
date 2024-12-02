const express = require('express');
const app = express();
const dotenv = require("dotenv").config();

const mongoose = require('mongoose');




const initApp = () => {
     return new Promise((resolve, reject) => {
    const db = mongoose.connection;
    db.on('error', (err) => { console.error(err); });
    db.once('open', () => console.log("connected to mongo"))

    mongoose.connect(process.env.MONGO_URI).then(() => {
        const bodyParser = require("body-parser");
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));


        const postsRoutes = require("./routes/posts_routes");
        app.use("/posts", postsRoutes);

        app.get('/about', (req, res) => {
            res.send("About page");
        });
        resolve(app);
    })
});
};



module.exports = initApp;