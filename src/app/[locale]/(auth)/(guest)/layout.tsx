import {PropsWithChildren} from "react";
import GuardLayout from "@/components/guardLayout/guardLayout";

export default function Layout({children}: PropsWithChildren) {
    return <GuardLayout rules={[
        {
            trigger: "unauthenticated",
            redirectTo: "/"
        }
    ]}>
        {children}
    </GuardLayout>
}