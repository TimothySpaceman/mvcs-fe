"use client";

import {parseAsString, useQueryState} from "nuqs";
import ProjectFilesView from "@/components/projectFilesView/projectFilesView";
import SnapshotMetadataView from "@/components/snapshotMetadataView/snapshotMetadataView";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";

type Props = {
    projectId: string;
}


export default function FilesAndMetadata({projectId}: Props) {
    const [commitId] = useQueryState("commitId", parseAsString);
    const [refName] = useQueryState("refName", parseAsString);

    const showMetadata = !!(commitId ?? refName);

    if (!showMetadata) return <ProjectFilesView projectId={projectId}/>;

    return (
        <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel defaultSize={60} minSize={200}>
                <ProjectFilesView projectId={projectId}/>
            </ResizablePanel>
            <ResizableHandle className="w-1 bg-transparent"/>
            <ResizablePanel defaultSize={40} minSize={200}>
                <SnapshotMetadataView projectId={projectId}/>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
