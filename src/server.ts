import express, { Express } from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import PostsRoutes from './routes/posts_routes';
import CommentsRoutes from './routes/comments_routes';
import AuthRoutes from './routes/auth_routes';



const initApp = () => {
    return new Promise<Express>((resolve, reject) => {
        const db = mongoose.connection;
        db.on('error', (err) => { console.error(err); });
        db.once('open',  () => { console.log("connected to mongo")});

        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            reject(new Error("MONGO_URI is not defined in the environment variables"));
            return;
        }
        mongoose.connect(mongoUri).then(() => {
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use("/posts", PostsRoutes);
        app.use("/comments", CommentsRoutes);
        app.use("/auth", AuthRoutes);
        app.get('/about', (req, res) => {
            res.send("About page");
        });
        resolve(app);
    });
    }
)};



export default initApp;