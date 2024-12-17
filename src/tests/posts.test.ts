import request from 'supertest';
import initApp from '../server';
import mongoose from 'mongoose';
import PostsModel from '../models/posts_model';
import { Express } from 'express';
import userModel from '../models/user_model';

let app: Express;

const testUser = {
    email: "test@user.com",
    password: "123456",
    accessToken: "",
  }
let postId = '';
const postTest = {
    title: 'Test Post',
    content: 'Test Content',
    owner:""
}
const invalidPost = {
    content: 'Test Content',
}
beforeAll(async () => {
    console.log('beforeAll');
    app = await initApp();
    await PostsModel.deleteMany();
    await userModel.deleteMany();
    await request(app).post("/auth/register").send(testUser);
    const response2 = await request(app).post("/auth/login").send(testUser);
    expect(response2.statusCode).toBe(200);
    testUser.accessToken = response2.body.accessToken;
    postTest.owner = response2.body._id;
});

afterAll(async () => {   
    console.log('afterAll');
    await mongoose.connection.close();
});

describe('Posts test suite', () => {
    test('Posts : TEST GetAllPosts before adding post', async () => {
        const response = await request(app).get('/posts')
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(0);
    });
    test('Posts : TEST CreatePost', async () => {
        const response = await request(app)
            .post('/posts')
            .set({
                authorization: "JWT " + testUser.accessToken,
            }).send(postTest);
        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe(postTest.title);
        expect(response.body.content).toBe(postTest.content);
        postId = response.body._id;
    });
    test('Posts : TEST GetAllPosts after adding post', async () => {
        const response = await request(app).get('/posts');
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
    });
    test('Posts: TEST GetPostByOwner', async () => {
        const response = await request(app).get('/posts?owner=' + postTest.owner);
        expect(response.statusCode).toBe(200);
        expect(response.body[0].owner).toBe(postTest.owner);
    });
    test('Posts : TEST GetPostById', async () => {
        const response = await request(app).get(`/posts/${postId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(postId);
    });
    test('Posts : TEST DeletePost', async () => {
        const response = await request(app).delete(`/posts/${postId}`).set({
            authorization: "JWT " + testUser.accessToken,
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.deletedCount).toBe(1);
    });
    test('Posts : TEST GetAllPosts after deleting post', async () => {
        const response = await request(app).get('/posts');
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(0);
    });
    test('Posts: Test GetPostById no format failure', async () => {
        const response = await request(app).get(`/posts/${postId}5`);
        expect(response.statusCode).toBe(400);
    });
    test('Posts: Test GetPostById not exists failure', async () => {
        const response = await request(app).get(`/posts/67332305594350d4ce5475de`);
        expect(response.statusCode).toBe(400);
    });
    test('Posts: Test DeletePost no format failure', async () => {
        const response = await request(app).delete(`/posts/${postId}5`).set({
            authorization: "JWT " + testUser.accessToken,
        });
        expect(response.statusCode).toBe(400);
    });
    test('Posts: Test DeletePost not exists failure', async () => {
        const response = await request(app).delete(`/posts/67332305594350d4ce5475de`).set({
            authorization: "JWT " + testUser.accessToken,
        });
        expect(response.statusCode).toBe(400);
    });
    test('Posts: Test CreatePost failure', async () => {
        const response = await request(app)
            .post('/posts')
            .set({
                authorization: "JWT " + testUser.accessToken,
            })
            .send(invalidPost);
        expect(response.statusCode).toBe(400);
    });

});
