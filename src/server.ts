import express, { Express } from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import PostsRoutes from './routes/posts_routes';
import CommentsRoutes from './routes/comments_routes';
import AuthRoutes from './routes/auth_routes';
import swaggerUI from "swagger-ui-express"
import swaggerJsDoc from "swagger-jsdoc"

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/posts", PostsRoutes);
app.use("/comments", CommentsRoutes);
app.use("/auth", AuthRoutes);

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Web Dev 2025 REST API",
            version: "1.0.0",
            description: "REST server including authentication using JWT",
        },
        servers: [{ url: "http://localhost:3000", },],
    },
    apis: ["./src/routes/*.ts"],
};
const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

const initApp = () => {
    return new Promise<Express>((resolve, reject) => {
        const db = mongoose.connection;
        db.on('error', (err) => { console.error(err); });
        db.once('open', () => { console.log("connected to mongo") });

        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            reject(new Error("MONGO_URI is not defined in the environment variables"));
            return;
        }
        mongoose.connect(mongoUri).then(() => {
            resolve(app);
        });
    }
    )
};



export default initApp;