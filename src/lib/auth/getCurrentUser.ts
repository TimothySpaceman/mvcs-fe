import {cookies} from "next/headers";
import {UserMetadata} from "@/lib/auth/types";
import {USER_METADATA_COOKIE_NAME} from "@/lib/auth";

export async function getCurrentUser(): Promise<UserMetadata | undefined> {
    const cookieStore = await cookies();
    const raw = cookieStore.get(USER_METADATA_COOKIE_NAME)?.value;
    if (!raw) return;

    try {
        const parsed = JSON.parse(raw);
        if (parsed.exp * 1000 < Date.now()) return;
        return parsed as UserMetadata;
    } catch {
        return;
    }
}