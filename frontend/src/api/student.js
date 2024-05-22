import { get, post, put, del } from './request';

export async function getStudents() {
    return get('/student/');
}

export async function getStudent(id) {
    return get(`/student/${id}`);
}

export async function createStudent(data) {
    return post('/student/create', data);
}

export async function updateStudent(id, data) {
    return put(`/student/${id}`, data);
}


export async function deleteStudent(id) {
    return del(`/student/${id}`);
}