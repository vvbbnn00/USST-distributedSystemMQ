"use client"
import { Button, Modal, Popconfirm, Tag, Tooltip } from 'antd';
import { ProForm, ProFormText, ProTable } from '@ant-design/pro-components';
import { useRouter } from 'next-nprogress-bar';
import { ai, student } from '@/api/index';
import {
    PlusOutlined,
    FileTextOutlined,
    DownloadOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { timestampToTime } from '@/util/string';
import { useEffect, useRef, useState } from 'react';

export default function StudentPage() {
    const router = useRouter();
    const actionRef = useRef();

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = ProForm.useForm();


    useEffect(() => {
        console.log('selectedStudent: ', selectedStudent);
        form.setFieldsValue(selectedStudent);
    }, [selectedStudent, form]);

    const STUDENT_COLUMN = [
        {
            title: '学生ID',
            dataIndex: 'id',
            ellipsis: true,
            disable: true,
            hideInSearch: true,
            align: 'center'
        },
        {
            title: '姓名',
            dataIndex: 'name',
            ellipsis: true,
            hideInSearch: true,
            width: 120,
            align: 'center',
        },
        {
            title: '学号',
            dataIndex: 'student_id',
            ellipsis: true,
            hideInSearch: true,
            width: 120,
            align: 'center',
        },
        {
            title: '学院',
            dataIndex: 'college',
            ellipsis: true,
            hideInSearch: true,
            width: 120,
            align: 'center',
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            align: 'center',
            width: 120,
            render: (text, record, _, action) => {
                return <div className='flex justify-end gap-1'>
                    <Tooltip title="编辑">
                        <Button
                            type="text"
                            size='small'
                            onClick={() => {
                                setSelectedStudent(record);
                                setIsModalOpen(true);
                            }}
                            icon={<EditOutlined />}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="确定删除吗?"
                        onConfirm={async () => {
                            await student.deleteStudent(record.id);
                            actionRef.current.reload();
                        }}
                    >
                        <Tooltip title="删除">
                            <Button
                                type="text"
                                size='small'
                                icon={<DeleteOutlined />}
                                danger
                            />
                        </Tooltip>
                    </Popconfirm>
                </div>
            },
        },
    ];


    return (
        <div className={"p-10"}>
            <h1 className={"text-2xl font-bold mt-2"}>学生管理 - Redis</h1>

            <Modal
                title="学生信息"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                maskClosable={true}
                footer={null}
            >
                <div className="py-5">
                    <ProForm
                        form={form}
                        onFinish={async (values) => {
                            try {
                                if (selectedStudent) {
                                    await student.updateStudent(selectedStudent.id, values);
                                }
                                else {
                                    await student.createStudent(values);
                                }
                                setIsModalOpen(false);
                                actionRef.current.reload();
                            } catch (error) {
                                console.error('error: ', error);
                            }
                        }}
                    >
                        {selectedStudent && <ProFormText
                            name="id"
                            label="学生ID"
                            required
                            rules={[{ required: true, message: '请输入学生ID' }]}
                            disabled
                        />}
                        <ProFormText
                            name="name"
                            label="姓名"
                            required
                            rules={[{ required: true, message: '请输入姓名' }]}
                        />
                        <ProFormText
                            name="student_id"
                            label="学号"
                            required
                            rules={[{ required: true, message: '请输入学号' }]}
                        />
                        <ProFormText
                            name="college"
                            label="学院"
                            required
                            rules={[{ required: true, message: '请输入学院' }]}
                        />
                    </ProForm>
                </div>
            </Modal>
            <ProTable
                actionRef={actionRef}
                className="mt-5"
                columns={STUDENT_COLUMN}
                cardBordered
                request={async (params, sort, filter) => {
                    return await student.getStudents();
                }}
                editable={false}
                columnsState={{
                    persistenceKey: 'distributed_system_mq:student-redis-columns',
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
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={() => {
                            setSelectedStudent(null);
                            setIsModalOpen(true);
                            form.resetFields();
                        }}
                    >
                        新建
                    </Button>
                ]}
            />
        </div>
    )
}
