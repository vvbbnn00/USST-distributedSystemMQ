"use client"
import { Button, Popconfirm, message } from 'antd';
import { ProForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { useRouter } from 'next-nprogress-bar';
import { useCallback, useEffect } from 'react';
import { SITE_SESSION_KEY } from '@/store/session'
import { auth } from '@/api';


export default function MyInfo() {
    const router = useRouter()
    const [form] = ProForm.useForm();
    const [messageApi, contextHolder] = message.useMessage();


    const loadSession = useCallback(() => {
        const session = JSON.parse(localStorage.getItem(SITE_SESSION_KEY))

        form.setFieldsValue({
            uid: session?.user,
            token: session?.session_id
        })
    }, [form])

    useEffect(() => {
        loadSession()
    }, [loadSession])

    const resetToken = () => {
        localStorage.removeItem(SITE_SESSION_KEY)
        router.push('/')
    }

    const checkNewToken = async (token) => {
        try {
            const result = await auth.checkNotAuth(token)
            console.log(result)
            const { user_id } = result
            localStorage.setItem(SITE_SESSION_KEY, JSON.stringify({
                session_id: token,
                user: user_id
            }))

            loadSession()
            messageApi.success('登录凭证更新成功')
        } catch (error) {
            messageApi.error('登录凭证无效')
        }
    }

    return <>
        {contextHolder}
        <div className={"p-10"}>
            <h1 className={"text-2xl font-bold mt-2"}>登录凭证</h1>

            <div className={"mt-5 p-5 bg-white rounded-md max-w-md"}>
                <ProForm
                    form={form}
                    onFinish={async (values) => {
                        console.log(values)
                        checkNewToken(values.token)
                    }}
                    submitter={false}
                >
                    <ProFormText
                        name="uid"
                        label="用户ID"
                        placeholder="用户ID"
                        readonly
                    />
                    <ProFormTextArea
                        name="token"
                        label="登录凭证"
                        placeholder="登录凭证"
                        required
                        tooltip="请妥善保管您的登录凭证，不要泄露给他人"
                    />

                    <Button type="primary" htmlType="submit">更新</Button>
                    <Popconfirm
                        title={
                            <span>您确定要重置登录凭证吗？<br />重置后，使用原凭证创建的任务将无法查询。</span>
                        }
                        onConfirm={() => {
                            resetToken()
                        }}
                        okText="确定"
                        cancelText="取消"
                        danger
                    >
                        <Button danger className={"ml-2"}>重置</Button>
                    </Popconfirm>
                </ProForm>
            </div>
        </div>
    </>
}