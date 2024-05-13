"use client"
import { Modal, message } from 'antd';
import { useState } from 'react';
import { ai } from '@/api/index';
import { ProForm, ProFormItem, ProFormSelect } from '@ant-design/pro-components';
import UploadButton from '@/components/upload_button';

export default function CreateOCRModal({ onCreate, children }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [form] = ProForm.useForm();
    const [uploadFile, setUploadFile] = useState(null)
    const [messageApi, contextHolder] = message.useMessage();

    return <>
        {contextHolder}
        <div onClick={(e) => {
            setIsModalOpen(true)
            e.stopPropagation()
        }}>{children}</div>

        <Modal
            title={"创建OCR任务"}
            centered
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            maskClosable={false}
            footer={null}
        >
            <div className="py-5">
                <ProForm
                    form={form}
                    onFinish={async (values) => {
                        const payload = {
                            lang: values.lang,
                            file_uuid: uploadFile.session_id
                        }

                        try {
                            await ai.createAiOcrTask(payload)
                            onCreate()
                            form.resetFields()
                            setUploadFile(null)
                            setIsModalOpen(false)

                        } catch (error) {
                            messageApi.error(error?.message || '创建OCR任务失败')
                        }
                    }}
                >
                    <ProFormSelect
                        name="lang"
                        label="识别语言"
                        options={[
                            { label: '中英文', value: 'CHN_ENG' },
                            { label: '英文', value: 'ENG' },
                            { label: '日语', value: 'JAP' },
                            { label: '韩语', value: 'KOR' },
                            { label: '西班牙语', value: 'SPA' },
                            { label: '德语', value: 'GER' },
                            { label: '意大利语', value: 'ITA' },
                            { label: '俄语', value: 'RUS' },
                        ]}
                        required
                        rules={[{ required: true }]}
                    />
                    <ProFormItem
                        name="file_uuid"
                        label="图片上传"
                        required
                        rules={[{ required: true, message: "请选择文件以上传" }]}
                    >
                        <UploadButton onUploaded={
                            (data) => {
                                const file = data[0];
                                setUploadFile(file);
                                form.setFieldValue("file_uuid", file?.session_id);
                            }
                        } />
                        {uploadFile && <span className='pl-2'>{uploadFile.name}</span>}
                    </ProFormItem>
                </ProForm>
            </div>
        </Modal>

    </>
}
