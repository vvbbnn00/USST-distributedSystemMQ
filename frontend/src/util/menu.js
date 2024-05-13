"use client";
import {
    DashboardOutlined,
    SettingOutlined,
    UserOutlined,
    ProfileOutlined,
    AuditOutlined,
    UsergroupAddOutlined,
    IdcardOutlined,
    ReadOutlined,
    UngroupOutlined,
    SnippetsOutlined,
    CarryOutOutlined,
    TagsOutlined,
    TeamOutlined,
    TrophyOutlined,
    FolderOpenOutlined,
    FormOutlined,
    HomeTwoTone,
    CarryOutTwoTone,
    BookTwoTone,
    FolderOpenTwoTone,
    PhoneTwoTone
} from '@ant-design/icons';

export const BASIC_MENU = [
    {
        key: 'ocr',
        label: 'OCR识别',
        icon: <UngroupOutlined />,
        href: '/ai/ocr',
    },
    {
        key: 'info',
        label: '登录凭证',
        icon: <IdcardOutlined />,
        href: '/ai/my',
    }
];


export function getMenuItems(me, menu) {
    const role = me.user_type;
    menu = menu || MANAGE_MENU;


    const menuItems = [];

    for (const item of menu) {
        if (item.hidden) {
            continue;
        }

        if (item.roles && !item.roles.includes(role)) {
            continue;
        }

        let subItem = {
            key: item.key,
            label: item.label,
            icon: item.icon,
            href: item.href,
        }
        if (item.children) {
            subItem.children = getMenuItems(me, item.children);
            if (!subItem?.children?.length) {
                subItem.children = undefined;
            }
        }
        menuItems.push(subItem);
    }

    return menuItems;
}


function replaceUrl(url, id) {
    // 如果 id 为数字，替换掉 pattern 中的 {id}
    if (id > 0 && (typeof id === 'number' || typeof id === 'string')) {
        url = url.replaceAll('{id}', id);
    }
    // 如果 id 为字典，替换掉 pattern 中字典中的 key
    if (id && typeof id === 'object') {
        for (const key in id) {
            url = url.replaceAll(`{${key}}`, id[key]);
        }
    }
    return url;
}


function match(pattern, text, id) {
    if (!pattern || !text) {
        return false;
    }
    pattern = replaceUrl(pattern, id);
    // console.log('pattern', pattern, 'text', text);
    if (pattern?.indexOf('*') > -1) {
        pattern = pattern.replace('*', '');
        // console.log(text?.startsWith(pattern));
        return text?.startsWith(pattern);
    }
    return pattern === text;
}


export function getSelectedKeys(route, menu, id) {
    for (const item of menu) {
        if (item.children) {
            const keys = getSelectedKeys(route, item.children, id);
            if (keys.length > 0) {
                return keys;
            }
        }
        if (match(item.href, route, id)) {
            return [item.key];
        }
    }
    return []
}


export function getRedirectPath(me, menu, key, id) {
    for (const item of menu) {
        if (key === item.key) {
            if (id) {
                return replaceUrl(item.href, id);
            }
            return item.href;
        }
        if (item.children) {
            const path = getRedirectPath(me, item.children, key, id);
            if (path) {
                if (id) {
                    return replaceUrl(path, id);
                }
                return path;
            }
        }
    }
}


export function getOpenKeys(route, menu, id) {
    for (const item of menu) {
        if (item.children) {
            const keys = getOpenKeys(route, item.children, id);
            if (keys.length > 0) {
                return [item.key];
            }
        }
        if (match(item.href, route, id)) {
            return [item.key];
        }
    }
    return []
}

export function hasAccess(me, href, menu, id) {
    for (const item of menu) {
        if (match(item.href, href, id)) {
            if (item.roles && !item.roles.includes(me.user_type)) {
                return false;
            }
            return true;
        }
        if (item.children) {
            if (hasAccess(me, href, item.children, id)) {
                return true;
            }
        }
    }
    return true;
}

export function getBreadcrumb(route, menu, id) {
    for (const item of menu) {
        if (item.children) {
            const crumbs = getBreadcrumb(route, item.children, id);
            if (crumbs.length > 0) {
                crumbs.unshift(item);
                return crumbs;
            }
        }
        if (match(item.href, route, id)) {
            return [item];
        }
    }
    return []
}

export function getBreadcrumbItems(route, menu, router, id) {
    const l = getBreadcrumb(route, menu, id);
    return l.map((item, index) => {
        return {
            key: item.key,
            title: item.label,
            href: index < l.length - 1 ? '#' : undefined,
            onClick: () => {
                let href = index < l.length - 1 ? item.href : undefined;
                if (!href) return;
                if (id) {
                    href = replaceUrl(href, id);
                }
                router.push(href);
            }
        }
    });
}