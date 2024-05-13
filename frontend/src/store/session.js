import { auth } from '@/api/index';
const SITE_SESSION_KEY = 'distributed_system_mq:session';

export async function setLoginSession(session) {
    localStorage.setItem(SITE_SESSION_KEY, JSON.stringify({
        session_id: session.session_id,
        user: session.user,
    }));
}

export async function getLoginSession() {
    const sessionStr = localStorage.getItem(SITE_SESSION_KEY);

    try {
        const session = JSON.parse(sessionStr);
        return session || null;
    } catch (error) { 
        localStorage.removeItem(SITE_SESSION_KEY);
    }

    return null;
}

export async function clearLoginSession() {
    localStorage.removeItem(SITE_SESSION_KEY);
}

export async function isLoggedIn() {
    return !!(await getLoginSession());
}

export async function getUser() {
    const session = await getLoginSession();
    return session?.user;
}

export async function getSessionId() {
    const session = await getLoginSession();
    return session?.session_id;
}


export {SITE_SESSION_KEY};