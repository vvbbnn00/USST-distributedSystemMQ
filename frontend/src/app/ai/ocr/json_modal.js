"use client"
import { Modal, Spin } from 'antd';
import { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { ai } from '@/api/index';
import useSWR from 'swr';

export default function CodeBlock({ recordId, children, title }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [refreshKey, setRefreshKey] = useState(`AI_${recordId}`)
    const { data, isLoading, error } = useSWR(refreshKey, () => {
        return ai.getAiOcrTask(recordId)
    })

    return <>
        <div onClick={(e) => {
            setIsModalOpen(true)
            e.stopPropagation()
        }}>{children}</div>

        <Modal
            title={title}
            centered
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            width={800}
            maskClosable={true}
            onOk={() => setIsModalOpen(false)}
            cancelButtonProps={null}
        >
            <div className="py-5">
                <Spin spinning={isLoading}>
                    <div style={{ maxHeight: 500, overflow: 'auto' }}>
                        <SyntaxHighlighter language="json" style={{
                            ...docco,
                        }} showLineNumbers>
                            {JSON.stringify(data?.result, null, 2)}
                        </SyntaxHighlighter>
                    </div>
                </Spin>
            </div>
        </Modal>

    </>
}
