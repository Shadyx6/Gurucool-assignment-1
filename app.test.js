const request = require('supertest');
const express = require('express');
const app = require('./app'); 


  
describe('User Registration and Login', () => {
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/register')
            .send({ username: 'shad', password: 'shad' });

        expect(res.statusCode).toEqual(201);
        expect(res.text).toContain('User registered');
    });

    it('should login an existing user', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'shad', password: 'shad' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });
});

describe('Queue Management', () => {
    let token;

    beforeAll(async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'shad', password: 'shad' });
        token = res.body.token;
    });
     
    it('should enqueue a request', async () => {
        const res = await request(app)
            .post('/enqueue')
            .set('Cookie', `token=${token}`) 
            .send({ data: 'data of shad(test purpose)' });

        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Request enqueued');
    });

    it('should process the user’s queue', async () => {
        const res = await request(app)
            .post('/process-queue')
            .set('Cookie', `token=${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Processed request');
    });
});
