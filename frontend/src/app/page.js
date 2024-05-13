"use client"

import { auth } from '@/api/index';
import { Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { setLoginSession } from '@/store/session';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        (async () => {
            try {
                const user = await auth.check();
            } catch (error) {
                const newUser = await auth.register();
                const token = newUser.token;
                setLoginSession({
                    session_id: token,
                    user: newUser.user_id
                });
            }

            router.push('/ai/ocr');
        })()
    }, [router])

    return (
        <div className='flex justify-center items-center h-screen gap-5 text-gray-500'>
            <LoadingOutlined style={{ fontSize: 24 }} spin />
            <span>正在载入...</span>
        </div>
    )
}
