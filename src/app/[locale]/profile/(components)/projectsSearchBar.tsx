"use client";

import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {parseAsInteger, parseAsString, useQueryState} from "nuqs";
import {useEffect, useRef} from "react";
import {useUser} from "@/components/userProvider/userProvider";

const DEBOUNCE_MS = 300;

export default function ProfileProjectsSearchBar() {
    const t = useTranslations("ProfilePage.projects.bar");
    const {user} = useUser();

    const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
    const [isPublic, setIsPublic] = useQueryState("isPublic", parseAsString.withDefault("all"));
    const [authorId, setAuthorId] = useQueryState("authorId", parseAsString);
    const [, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            await setPage(1);
            await setSearch(value || null);
        }, DEBOUNCE_MS);
    }

    function handleIsPublicChange(value: string) {
        setPage(1);
        setIsPublic(value === "all" ? null : value);
    }

    function handleOwnershipChange(value: string) {
        setPage(1);
        setAuthorId(value === "mine" ? (user?.id ?? null) : null);
    }

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    return (
        <div className="flex gap-2 flex-wrap">
            <Input
                type="text"
                placeholder={t("placeholder-search")}
                defaultValue={search}
                onChange={handleSearchChange}
                className="flex-1 min-w-32"
            />
            <Select value={isPublic} onValueChange={handleIsPublicChange}>
                <SelectTrigger className="w-36 shrink-0">
                    <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="all">{t("filter-all")}</SelectItem>
                        <SelectItem value="true">{t("filter-public")}</SelectItem>
                        <SelectItem value="false">{t("filter-private")}</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Select value={authorId ? "mine" : "all"} onValueChange={handleOwnershipChange}>
                <SelectTrigger className="w-40 shrink-0">
                    <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="all">{t("ownership-accessible")}</SelectItem>
                        <SelectItem value="mine">{t("ownership-mine")}</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}