import { get, post, put, del } from './request';

export async function getAiOcrList(params, sort, filter) {
    params.page = params.current;
    params.page_size = params.pageSize;

    delete params.current;
    delete params.pageSize;

    if (sort) {
        Object.keys(sort).forEach(key => {
            params['order_by'] = key;
            params['asc'] = sort[key] === 'ascend';
        })
    }

    if (!params['order_by']) {
        params['order_by'] = 'id';
        params['asc'] = false;
    }

    const urlParams = new URLSearchParams(params);
    const data = await get(`/ai/ocr/tasks?${urlParams.toString()}`);

    data.success = true;
    return data;
}


export async function getAiOcrTask(id) {
    const data = await get(`/ai/ocr/task/${id}`);
    return data?.data;
}

export async function createAiOcrTask(data) {
    const response = await post('/ai/ocr/task', data);
    return response;
}