"use client";
import { Button, Modal, Upload, message } from "antd";
import {
    UploadOutlined,
    InboxOutlined
} from '@ant-design/icons';
import { useState } from "react";
import { flushSync } from 'react-dom';
import { file } from '@/api/index';


export default function UploadButton({ onCancel, onUploaded }) {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { Dragger } = Upload;
    const [messageApi, contextHolder] = message.useMessage();
    const [fileList, setFileList] = useState([]);

    const props = {
        name: 'file',
        multiple: true,
        beforeUpload: (_, fileList) => {
            setFileList([...fileList]);
        },
        onChange(info) {
            const f = info.file;
            if (f.status === 'removed') {
                if (f.session_id) {
                    file.cancelUpload(f.session_id).catch(() => {
                        const newFileList = fileList.filter(x => x.uid !== f.uid);
                        setFileList(newFileList);
                    });
                } else {
                    const newFileList = fileList.filter(x => x.uid !== f.uid);
                    setFileList(newFileList);
                }
                return;
            }
        },
        onDrop(e) {
            setFileList([...fileList, ...e.dataTransfer.files]);
        },
    };

    const closeUploadModal = (notCancel) => {
        setFileList([]);
        setIsUploadModalOpen(false);
        if (onCancel && !notCancel) {
            onCancel();
        }
    }

    const doUpload = async () => {
        if (uploading) {
            return
        }

        if (fileList.length !== 1) {
            messageApi.open({
                type: "error",
                key: "upload_file",
                content: "只能上传一个文件"
            })
            return;
        }

        // 检查所有文件，大小不能超过8MB
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            if (file.size > 1024 * 1024 * 8) {
                messageApi.open({
                    type: "error",
                    key: "upload_file",
                    content: `文件${file.name}大小超过8MB`
                })
                return;
            }
        }

        let successCount = 0;
        setUploading(true);
        // 上传文件
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            try {
                await uploadFile(file, i);
                successCount++;
            } catch (e) {
                if (e.cancel) {
                    return;
                }
            }
        }
        setUploading(false);

        if (onUploaded && successCount === fileList.length) {
            messageApi.open({
                type: "success",
                key: "upload_file",
                content: "文件上传成功"
            })
            onUploaded(fileList);
            closeUploadModal(true);
        }
    }

    const uploadFile = async (uploadFile, index) => {
        if (uploadFile.status === "done" || uploadFile.status === "removed") {
            return;
        }

        const newFileList = fileList.copyWithin()

        newFileList[index].status = "uploading";
        newFileList[index].percent = 0;
        flushSync(() => {
            setFileList([...newFileList]);
        });
        let cancel = false;

        try {
            const { url: upload_url, file_uuid: session_id } = await file.startUploadSession();
            uploadFile.session_id = session_id;

            newFileList[index].percent = 10;
            flushSync(() => {
                setFileList([...newFileList]);
            });

            await file.startUpload(upload_url, uploadFile, ({ loaded, total }) => {
                newFileList[index].percent = Math.floor(loaded / total * 80) + 10;
                flushSync(() => {
                    setFileList([...newFileList]);
                });
            }, () => {
                if (newFileList[index].status === "removed") {
                    const newFileList = fileList.filter(x => x.uid !== uploadFile.uid);
                    setFileList(newFileList);
                    cancel = true;
                    return true;
                }
            });

            await file.finishUpload(session_id);
            newFileList[index].status = "done";
            newFileList[index].percent = 100;
            flushSync(() => {
                setFileList([...newFileList]);
            });
        } catch (e) {
            if (!cancel) {
                newFileList[index].status = "error";
                newFileList[index].percent = 0;
                flushSync(() => {
                    setFileList([...newFileList]);
                });
                messageApi.open({
                    type: "error",
                    key: "upload_file",
                    content: `上传文件失败: ${e.message}`
                })
                throw e;
            } else {
                throw new Error({
                    cancel: true
                });
            }
        }
    }


    return <>
        {contextHolder}
        <Modal
            title="上传文件"
            centered
            okText="上传"
            maskClosable={false}
            closeIcon={false}
            open={isUploadModalOpen}
            onOk={doUpload}
            onCancel={() => {
                if (uploading) return;
                closeUploadModal(false)
            }}
        >
            <div className="pt-5 pb-5">
                {/* 限定只能上传一个文件，图片格式，大小不能超过8MB */}
                <Dragger {...props} fileList={fileList} accept="image/*" maxCount={1}>
                    <div className="p-5">
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">点击或拖动文件至该区域以上传</p>
                        <p className="ant-upload-hint pt-2 pb-5">
                            文件最大不能超过8MB，点击“上传”后才会开始上传，请耐心等待上传完毕再关闭该对话框。
                        </p>
                    </div>
                </Dragger>
            </div>
        </Modal>

        <Button
            key="button"
            icon={<UploadOutlined />}
            onClick={() => {
                setIsUploadModalOpen(true);
            }}
        >
            上传文件
        </Button>
    </>
}