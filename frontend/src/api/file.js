import { post, del } from './request';

export async function startUploadSession() {
    const res = await post(`/file/upload`)
    return res
}

export async function startUpload(uploadUrl, file, progressCallback, isCancel) {
    return new Promise((resolve, reject) => {
        const sliceSize = 1024 * 1024 * 20; // 20MB
        const fileSize = file.size;
        let start = 0;
        let chunkIndex = 0;
        const totalChunks = Math.ceil(fileSize / sliceSize);
        let cancel = false;
        let loaded = 0;

        function uploadNextChunk() {
            if (isCancel() || cancel) {
                cancel = true;
                reject(new Error("Upload canceled"));
                return;
            }

            if (chunkIndex >= totalChunks || cancel) {
                resolve(); // All chunks uploaded
                return;
            }

            let end = Math.min(start + sliceSize, fileSize);
            let chunk = file.slice(start, end);
            let chunkSize = end - start;

            let XHR = new XMLHttpRequest();

            XHR.open('PUT', uploadUrl, true);
            XHR.setRequestHeader('Content-Type', 'application/octet-stream');
            XHR.setRequestHeader('Content-Range', `bytes ${start}-${end - 1}/${fileSize}`);

            XHR.upload.onprogress = (e) => {
                loaded += e.loaded;
                if (cancel) {
                    XHR.abort();
                    reject(new Error("Upload canceled"));
                    return;
                }
                progressCallback({ loaded, total: fileSize });
            };

            XHR.onreadystatechange = () => {
                if (XHR.readyState === XMLHttpRequest.DONE) {
                    if (cancel) {
                        XHR.abort();
                        reject(new Error("Upload canceled"));
                        return;
                    }
                    if (XHR.status >= 200 && XHR.status < 300) {
                        // Move to the next chunk
                        start = end;
                        chunkIndex++;
                        uploadNextChunk();
                    } else {
                        reject(new Error(`Upload failed with status ${XHR.status}`));
                    }
                }
            };

            XHR.send(chunk);
        }

        uploadNextChunk();
    });
}


export async function finishUpload(sessionId) {
    const res = await post(`/file/upload/session`, {
        file_uuid: sessionId
    });
    return res;
}

export async function cancelUpload(sessionId) {
    const res = await del(`/file/upload/session`, {
        file_uuid: sessionId
    });
    return res;
}