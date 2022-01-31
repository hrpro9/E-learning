import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { FuseSharedModule } from "@fuse/shared.module";

const routes = [
    {
        path: "",
        redirectTo: "sample",
        pathMatch: "full",
    },
    {
        path: "sample",
        loadChildren: () =>
            import("./sample/sample.module").then((m) => m.SampleModule),
    },
    {
        path: "file-manager",
        loadChildren: () =>
            import("./file-manager/file-manager.module").then(
                (m) => m.FileManagerModule
            ),
    },
    {
        path: "chat",
        loadChildren: () =>
            import("./chat/chat.module").then((m) => m.ChatModule),
    },
    {
        path: "stream/:id",
        loadChildren: () =>
            import("./stream/stream.module").then((m) => m.StreamModule),
    },
    {
        path: "conference/:id",
        loadChildren: () =>
            import("./conference/conference.module").then(
                (m) => m.ConferenceModule
            ),
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes), FuseSharedModule],
})
export class AppsModule {}
