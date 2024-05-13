"use client"
import { Button, Tag, Tooltip } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { useRouter } from 'next-nprogress-bar';
import { ai } from '@/api/index';
import {
    PlusOutlined,
    FileTextOutlined,
    DownloadOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { timestampToTime } from '@/util/string';
import CodeBlock from './json_modal';
import OcrResult from './ocr_modal';
import CreateOCRModal from './create_modal';
import { useRef } from 'react';

export default function OcrList() {
    const router = useRouter()
    const actionRef = useRef();

    const OCR_COLUMNS = [
        {
            title: '任务ID',
            dataIndex: '_id',
            ellipsis: true,
            disable: true,
            hideInSearch: true,
            align: 'center'
        },
        {
            title: '识别语言',
            dataIndex: 'lang',
            ellipsis: true,
            hideInSearch: true,
            width: 120,
            align: 'center',
            render: (text, record, _, action) => {
                switch (record?.lang) {
                    case 'CHN_ENG':
                        return <Tag color='blue'>中英文</Tag>
                    case 'ENG':
                        return <Tag color='purple'>英文</Tag>
                    case 'JAP':
                        return <Tag color='yellow'>日语</Tag>
                    case 'KOR':
                        return <Tag color='green'>韩语</Tag>
                    case 'SPA':
                        return <Tag color='orange'>西班牙语</Tag>
                    case 'GER':
                        return <Tag color='cyan'>德语</Tag>
                    case 'ITA':
                        return <Tag color='red'>意大利语</Tag>
                    case 'RUS':
                        return <Tag color='pink'>德语</Tag>
                    default:
                        return <Tag>未知</Tag>
                }
            }
        },
        {
            title: '状态',
            dataIndex: 'status',
            valueType: 'select',
            valueEnum: {
                pending: {
                    text: '排队中',
                    status: 'Default'
                },
                processing: {
                    text: '处理中',
                    status: 'Processing'
                },
                completed: {
                    text: '已完成',
                    status: 'Success'
                },
                failed: {
                    text: '处理失败',
                    status: 'Error'
                },
            },
            width: 100,
            align: 'center'
        },
        {
            title: '更新时间',
            dataIndex: 'updated_at',
            ellipsis: true,
            hideInSearch: true,
            width: 180,
            align: "center",
            editable: false,
            renderText: (text, record, _, action) => {
                return timestampToTime(record.updated_at);
            },
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            ellipsis: true,
            hideInSearch: true,
            width: 180,
            align: "center",
            editable: false,
            renderText: (text, record, _, action) => {
                return timestampToTime(record.created_at);
            },
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            align: 'center',
            width: 120,
            render: (text, record, _, action) => {
                return <div className='flex justify-end gap-1'>
                    {record.status === 'completed' && <OcrResult
                        recordId={record._id}
                        title={"OCR识别结果"}
                    >
                        <Tooltip title="查看结果">
                            <Button
                                type="text"
                                size='small'
                                icon={<EyeOutlined />}
                            />
                        </Tooltip>
                    </OcrResult>}
                    <CodeBlock
                        recordId={record._id}
                        title={"原始响应"}
                    >
                        <Tooltip title="原始响应">
                            <Button
                                type="text"
                                size='small'
                                icon={<FileTextOutlined />}
                            />
                        </Tooltip>
                    </CodeBlock>
                    <Tooltip title="下载图片">
                        <Button
                            type="text"
                            size='small'
                            onClick={() => {
                                const downloadUrl = record.compressed_url;
                                window.open(downloadUrl);
                            }}
                            icon={<DownloadOutlined />}
                        />
                    </Tooltip>
                </div>
            },
        },
    ];


    return (
        <div className={"p-10"}>
            <h1 className={"text-2xl font-bold mt-2"}>OCR识别</h1>

            <ProTable
                actionRef={actionRef}
                className="mt-5"
                columns={OCR_COLUMNS}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params, sort, filter);
                    return await ai.getAiOcrList(params, sort, filter);
                }}
                editable={false}
                columnsState={{
                    persistenceKey: 'distributed_system_mq:baidu-ocr:task-table',
                    persistenceType: 'localStorage',
                    defaultValue: {
                        option: { fixed: 'right', disable: true },
                    },
                    onChange(value) {
                        console.log('value: ', value);
                    },
                }}
                rowKey="_id"
                search={{
                    labelWidth: 'auto',
                }}
                options={{
                    setting: {
                        listsHeight: 400,
                    },
                }}
                pagination={{
                    pageSize: 20,
                }}
                dateFormatter="string"
                toolBarRender={() => [
                    <CreateOCRModal
                        key={"create-ocr"}
                        onCreate={() => {
                            console.log('create ocr task');
                            actionRef.current.reload();
                        }}
                    >
                        <Button
                            key="button"
                            icon={<PlusOutlined />}
                            type="primary"
                        >
                            新建
                        </Button>
                    </CreateOCRModal>
                ]}
            />
        </div>
    )
}
