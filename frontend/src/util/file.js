import {
    FileOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    FilePptOutlined,
    FileExcelOutlined,
    FileTextOutlined,
    FileImageOutlined
} from '@ant-design/icons';

export function renderFileIcon(fileName) {
    const ext = fileName.split('.').pop();

    switch (ext) {
        case 'pdf':
            return <FilePdfOutlined />;
        case 'doc':
        case 'docx':
            return <FileWordOutlined />;
        case 'ppt':
        case 'pptx':
            return <FilePptOutlined />;
        case 'xls':
        case 'xlsx':
            return <FileExcelOutlined />;
        case 'txt':
            return <FileTextOutlined />;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'webp':
        case 'svg':
            return <FileImageOutlined />;
        default:
            return <FileOutlined />;
    }
}