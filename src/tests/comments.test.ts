import request from 'supertest';
import initApp from '../server';
import mongoose from 'mongoose';
import commentsModel from '../models/comments_model';
import { Express } from 'express';

let app: Express;

beforeAll(async () => {
    console.log('beforeAll');
    app = await initApp();
    await commentsModel.deleteMany();
});

afterAll(async () => {   
    console.log('afterAll');
    await mongoose.connection.close();
});
let commentId = '';
const testComment = {
    comment: 'Test Comment',
    postId: new mongoose.Types.ObjectId().toString(), // Generate a valid ObjectId
    owner: 'Test Owner'
};
const invalidComment = {
    comment: 'Test invalid Comment',
}
describe('Comments test suite', () => {
    test('Comments : TEST GetAllComments before adding comment', async () => {
        const response = await request(app).get('/comments');
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(0);
    });
    test('Comments : TEST CreateComment', async () => {
        const response = await request(app)
            .post('/comments')
            .send(testComment);
        expect(response.statusCode).toBe(201);
        expect(response.body.comment).toBe(testComment.comment);
        expect(response.body.postId).toBe(testComment.postId);
        expect(response.body.owner).toBe(testComment.owner);
        commentId = response.body._id;
    });
    test('Comments : TEST GetAllComments after adding comment', async () => {
        const response = await request(app).get('/comments');
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
    });
    test('Comments: TEST GetCommentsByOwner', async () => {
        const response = await request(app).get('/comments?owner=' + testComment.owner);
        expect(response.statusCode).toBe(200);
        expect(response.body[0].owner).toBe(testComment.owner);
    });
    test('Comments : TEST GetCommentById', async () => {
        const response = await request(app).get(`/comments/${commentId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(commentId);
    });
    test('Comments : TEST DeleteComment', async () => {
        const response = await request(app).delete(`/comments/${commentId}`);
        expect(response.statusCode).toBe(201);
        expect(response.body.deletedCount).toBe(1);
    });
    test('Comments : TEST GetAllComments after deleting comment', async () => {
        const response = await request(app).get('/comments');
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(0);
    });
    test('Comments: Test GetCommentById no format failure', async () => {
        const response = await request(app).get(`/comments/${commentId}5`);
        expect(response.statusCode).toBe(400);
    });
    test('Comments: Test GetCommentById not exists failure', async () => {
        const response = await request(app).get(`/comments/67332305594350d4ce5475de`);
        expect(response.statusCode).toBe(404);
    });
    test('Comments: Test DeleteComment no format failure', async () => {
        const response = await request(app).delete(`/comments/${commentId}5`);
        expect(response.statusCode).toBe(400);
    });
    test('Comments: Test DeleteComment not exists failure', async () => {
        const response = await request(app).delete(`/comments/67332305594350d4ce5475de`);
        expect(response.statusCode).toBe(404);
    });
    test('Comments: Test CreateComment failure', async () => {
        const response = await request(app)
            .post('/comments')
            .send(invalidComment);
        expect(response.statusCode).toBe(400);
    });

    test('about page', async () => {
        const response = await request(app).get('/about');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("About page");
    });
});
