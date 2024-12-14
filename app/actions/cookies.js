"use server"
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose';


export async function validate(token) {
    if (!token || token === undefined) { return; }
    try {
        const secret= await loadConfig();
        const secretKey = new TextEncoder().encode(secret.Secret_Key);
        const { payload } = await jwtVerify(token, secretKey);
        return payload;
    } catch (err) {
        console.error('Token verification failed: ', err);
        return;
    }
}

export async function getAuthUser() {
    const cookieStore = cookies()
    const auth = cookieStore.get('user')
    return auth
}

export async function setAuthUser(token) {
    console.log("i am here");
    cookies().set('user', token )
}

export async function deleteAuthUser() {
    cookies().set('user', 'false' )
}
