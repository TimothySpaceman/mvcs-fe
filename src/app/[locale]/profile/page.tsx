import {getCurrentUser} from "@/lib/auth/getCurrentUser";
import {getLocale, getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";
import {getServerApi} from "@/lib/api";
import {User} from "@/lib/auth/types";
import {notFound} from "next/navigation";
import Container from "@/components/container/container";
import type {Metadata} from "next";
import ProfileUserCard from "@/app/[locale]/profile/(components)/profileUserCard";
import ProjectsSearchBar from "@/app/[locale]/profile/(components)/projectsSearchBar";
import ProjectsList from "@/components/projects/projectsList";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("ProfilePage.meta");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function Page() {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        redirect(`/${await getLocale()}/login?redirectTo=/profile`);
    }

    const api = await getServerApi();
    const resp = await api.fetch(`/users/${currentUser.id}`, {auth: true});
    if (resp.status === 404) notFound();
    if (!resp.ok) throw new Error("Failed to fetch user profile");
    const user = await resp.json() as User;

    return (
        <Container className="max-w-5xl flex gap-6 items-start">
            <aside className="w-56 shrink-0">
                <ProfileUserCard user={user}/>
            </aside>
            <div className="flex-1 min-w-0 flex flex-col gap-2">
                <ProjectsSearchBar/>
                <ProjectsList staticParams={{explicitAccessOnly: "true"}}/>
            </div>
        </Container>
    );
}