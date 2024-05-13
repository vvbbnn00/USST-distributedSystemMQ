/* eslint-disable @next/next/no-img-element */
"use client"
import { Modal, Spin } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ai } from '@/api/index';
import useSWR from 'swr';

export default function OcrResult({ recordId, children, title }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [refreshKey, setRefreshKey] = useState(`AI_${recordId}`)
    const { data, isLoading, error } = useSWR(refreshKey, () => {
        return ai.getAiOcrTask(recordId)
    })
    const image = useRef(null)

    const [imageWidth, setImageWidth] = useState(0)
    const [imageHeight, setImageHeight] = useState(0)
    const [actualImageWidth, setActualImageWidth] = useState(0)
    const [actualImageHeight, setActualImageHeight] = useState(0)
    const [selected, setSelected] = useState(null)
    const randomPrefix = useMemo(() => Math.random().toString(36).substring(7), [])

    useEffect(() => {
        console.log('imageWidth', imageWidth)
        console.log('imageHeight', imageHeight)
        console.log('actualImageWidth', actualImageWidth)
        console.log('actualImageHeight', actualImageHeight)
    }, [imageWidth, imageHeight, actualImageWidth, actualImageHeight])

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
            width={1000}
            maskClosable={true}
            onOk={() => setIsModalOpen(false)}
            cancelButtonProps={null}
        >
            <div className="py-5">
                <Spin spinning={isLoading}>
                    <div className='flex gap-5'>
                        <div className='w-[600px] relative' style={{
                            display: 'inline-block',
                        }}>
                            <img src={data?.compressed_url} alt={data?._id} className='w-[800px]' onLoad={(e) => {
                                setImageWidth(e.target.width)
                                setImageHeight(e.target.height)
                                setActualImageHeight(image.current.naturalHeight)
                                setActualImageWidth(image.current.naturalWidth)
                            }} ref={image} />
                            <div style={{
                                display: 'inline-block',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                width: '100%',
                                height: '100%',
                            }}>
                                {data?.result?.words_result?.map((item, index) => {
                                    if (imageHeight === 0 || imageWidth === 0 || actualImageWidth === 0 || actualImageHeight === 0) {
                                        return null
                                    }

                                    const top = item.location.top * imageHeight / actualImageHeight
                                    const left = item.location.left * imageWidth / actualImageWidth
                                    const width = item.location.width * imageWidth / actualImageWidth
                                    const height = item.location.height * imageHeight / actualImageHeight

                                    return <div
                                        key={index}
                                        style={{
                                            top, left, width, height, position: 'absolute'
                                        }}
                                        className={`border border-red-500 hover:bg-red-500 hover:opacity-20 cursor-pointer ${selected === `word_${randomPrefix}_${index}` ? 'bg-red-500 opacity-20' : ''}`}
                                        onClick={() => {
                                            setSelected(`word_${randomPrefix}_${index}`)
                                            const element = document.getElementById(`word_${randomPrefix}_${index}`)
                                            element.scrollIntoView({
                                                behavior: 'smooth',
                                                block: 'center',
                                                inline: 'center',
                                            })
                                        }}
                                    ></div>
                                })}
                            </div>
                        </div>
                        <div className='w-[300px]'>
                            <h2 className='text-lg font-bold mb-2.5'>识别结果</h2>
                            <div style={{ maxHeight: 400, overflow: 'auto' }} className='bg-gray-50'>
                                {data?.result?.words_result?.map((item, index) => {
                                    const id = `word_${randomPrefix}_${index}`;
                                    return <div
                                        key={index}
                                        name={id}
                                        id={id}
                                        className={`p-2 cursor-pointer border-b border-gray-200 hover:bg-gray-200 ${selected === id ? 'bg-gray-200' : ''}`}
                                        onClick={() => {
                                            setSelected(id)
                                            console.log(id)
                                            const element = document.getElementsByName(id)[0]
                                            element.scrollIntoView({
                                                behavior: 'smooth',
                                                block: 'center',
                                                inline: 'center',
                                            })
                                        }}
                                    >
                                        {item.words}
                                    </div>
                                })}
                            </div>
                        </div>
                    </div>
                </Spin>
            </div>
        </Modal>

    </>
}
