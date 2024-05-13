import { get, post, put, del, request } from './request';

export async function register() {
    return await post('/auth/reg');
}

export async function check() {
    return await get('/auth/check');
}

export async function checkNotAuth(newToken) {
    return await request('/auth/check', {
        method: 'GET',
    }, false, newToken);
}