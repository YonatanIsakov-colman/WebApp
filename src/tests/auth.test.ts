import request from 'supertest';
import initApp from '../server';
import mongoose from 'mongoose';
import postModel from "../models/posts_model";
import { Express } from 'express';
import userModel from '../models/user_model';

let app: Express;

beforeAll(async () => {
    console.log('beforeAll');
    app = await initApp();
    await userModel.deleteMany();
    await postModel.deleteMany();
});

afterAll(async () => {   
    console.log('afterAll');
    await mongoose.connection.close();
});
type UserInfo = {
    email: string;
    password: string;
    accessToken?: string;
    refreshToken?: string;
    _id?: string;
}
const userInfo:UserInfo = {
    email: 'testUser@gmail.com',
    password: 'testPassword'
}
const invalidUserInfo = {
    email: 'invalidTestUser@gmail.com',
    password: 'invalidTestPassword'
}
const postTest = {
    title: 'Test Post',
    content: 'Test Content',
    owner: userInfo.email
}
describe('AUTH test suite', () => {
    test('AUTH : Registration test', async () => {
        const response = await request(app).post('/auth/register').send(userInfo);
        console.log(response.body);
        expect(response.statusCode).toBe(200);
    });
    test('AUTH: Registration test with existing user', async () => {
        const response = await request(app).post('/auth/register').send(userInfo);
        console.log(response.body);
        expect(response.statusCode).toBe(400);
    });

    test('AUTH : Login test', async () => {
        const response = await request(app).post('/auth/login').send(userInfo);
        console.log(response.body);
        expect(response.statusCode).toBe(200);
        const accessToken = response.body.accessToken;
        expect(accessToken).toBeDefined();
        const refreshToken = response.body.refreshToken;
        expect(refreshToken).toBeDefined();
        const userid = response.body._id;
        expect(userid).toBeDefined();
        userInfo.accessToken = accessToken;
        userInfo.refreshToken = refreshToken;
        userInfo._id = userid;
    })
    test('AUTH : Login test with invalid user', async () => {
        const response = await request(app).post('/auth/login').send(invalidUserInfo);
        console.log(response.body);
        expect(response.statusCode).toBe(400);
    })
    test('AUTH : Login with not same access token', async () => {
        const response = await request(app).post('/auth/login').send({
            email: userInfo.email,
            password: userInfo.password
        });
        expect(response.body.accessToken).not.toEqual(userInfo.accessToken);
    })
    test('AUTH : Posts post only by users', async () => {
        const response = await request(app).post('/posts').set({
            authorization: 'JWT ' + userInfo.accessToken})
        .send(postTest)
        console.log(userInfo.accessToken);
        expect(response.statusCode).toBe(200);
    });
    test('AUTH: Posts post only by user without token', async () => {
        const response = await request(app).post('/posts').send(postTest)
        console.log(response.body);
        expect(response.statusCode).toBe(400);
    });
    test('AUTH: Posts post with invalid token', async () => {
        const response = await request(app).post('/posts').set({
        authorization: 'JWT ' + userInfo.accessToken + '1'})
        .send(postTest)
        console.log(response.body);
        expect(response.statusCode).toBe(400);
    });
    test('AUTH: Refresh token', async () => {
        const response = await request(app).post('/auth/refresh')
        .send({refreshToken: userInfo.refreshToken});
        expect(response.statusCode).toBe(200);
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
        userInfo.accessToken = response.body.accessToken;
        userInfo.refreshToken = response.body.refreshToken;
    });
    test('AUTH: Logout - invalidate refresh token', async () => {
        const response = await request(app).post('/auth/logout')
        .send({refreshToken: userInfo.refreshToken});
        expect(response.statusCode).toBe(200);
        const response2 = await request(app).post('/auth/refresh').send({
        refreshToken: userInfo.refreshToken
        });
        expect(response2.statusCode).not.toBe(200);
    });
    test('AUTH: Refresh token multiple times', async () => {
        const response = await request(app).post('/auth/login').send({
            email: userInfo.email,
            password: userInfo.password
        });
        expect(response.statusCode).toBe(200);
        userInfo.accessToken = response.body.accessToken;
        userInfo.refreshToken = response.body.refreshToken;

        const response2 = await request(app).post('/auth/refresh').send({
            refreshToken: userInfo.refreshToken
        });
        expect(response2.statusCode).toBe(200);
        const newRefreshToken = response2.body.refreshToken;
        const response3 = await request(app).post('/auth/refresh').send({
            refreshToken: userInfo.refreshToken
        });
        expect(response3.statusCode).not.toBe(200);
        const response4 = await request(app).post('/auth/refresh').send({
            refreshToken: newRefreshToken
        });
        expect(response4.statusCode).not.toBe(200);
    });
    jest.setTimeout(30000);
    test("timeout on refresh access token", async () => {
        const response = await request(app).post('/auth/login').send({
            email: userInfo.email,
            password: userInfo.password
        });
        expect(response.statusCode).toBe(200);
        userInfo.accessToken = response.body.accessToken;
        userInfo.refreshToken = response.body.refreshToken;

        // wait 6 seconds
        await new Promise(resolve => setTimeout(resolve, 6000));

        // try to access with expired token
        const response2 = await request(app).post("/posts").set({
            authorization: "JWT " + userInfo.accessToken
        }).send(postTest);
        expect(response2.statusCode).toBe(400);
        const response3 = await request(app).post('/auth/refresh').send({
            refreshToken: userInfo.refreshToken
        });
        expect(response3.statusCode).toBe(200);
        userInfo.accessToken = response3.body.accessToken;
        userInfo.refreshToken = response3.body.refreshToken;
        const response4 = await request(app).post("/posts").set({
            authorization: "JWT " + userInfo.accessToken
        }).send(postTest);
        expect(response4.statusCode).toBe(200);
    });
    });