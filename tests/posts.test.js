const request = require('supertest');
const initApp = require('../server');
const mongoose = require('mongoose');
const postModel = require('../models/posts_model');

var app;
beforeAll(async () => {
    console.log('beforeAll');
    app = await initApp();
    await postModel.deleteMany();
});

afterAll(async () => {   
    console.log('afterAll');
    await mongoose.connection.close();
});
var postId = '';
var postTest = {
    title: 'Test Post',
    content: 'Test Content',
    owner: 'Test Owner'
}
describe('Posts test suite', () => {
    test('Posts : TEST GetAllPosts before adding post', async () => {
        const response = await request(app).get('/posts');
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(0);
    });
    test('Posts : TEST CreatePost', async () => {
        const response = await request(app)
            .post('/posts')
            .send({
                title: postTest.title,
                content: postTest.content,
                owner: postTest.owner
            });
        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe(postTest.title);
        expect(response.body.content).toBe(postTest.content);
        expect(response.body.owner).toBe(postTest.owner);
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
        const response = await request(app).delete(`/posts/${postId}`);
        expect(response.statusCode).toBe(201);
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
        expect(response.statusCode).toBe(404);
    });
    test('Posts: Test DeletePost no format failure', async () => {
        const response = await request(app).delete(`/posts/${postId}5`);
        expect(response.statusCode).toBe(400);
    });
    test('Posts: Test DeletePost not exists failure', async () => {
        const response = await request(app).delete(`/posts/67332305594350d4ce5475de`);
        expect(response.statusCode).toBe(404);
    });
    test('Posts: Test CreatePost failure', async () => {
        const response = await request(app)
            .post('/posts')
            .send({
                title: postTest.title,
                content: postTest.content
            });
        expect(response.statusCode).toBe(400);
    });

    test('about page', async () => {
        const response = await request(app).get('/about');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("About page");
    });
});
