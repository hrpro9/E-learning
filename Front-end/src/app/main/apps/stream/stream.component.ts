import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FuseConfigService } from "@fuse/services/config.service";
import { Subject } from "rxjs";
import { StreamService } from "./stream.service";
import { fuseAnimations } from "@fuse/animations";
import { ActivatedRoute } from "@angular/router";

@Component({
    selector: "stream",
    templateUrl: "./stream.component.html",
    styleUrls: ["./stream.component.scss", "bootstrap.min.css"],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class StreamComponent implements OnInit {
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _fuseConfigService: FuseConfigService,
        private _streamService: StreamService
    ) {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    hidden: false,
                    folded: true,
                },
                toolbar: {
                    hidden: false,
                },
                footer: {
                    hidden: true,
                },
                sidepanel: {
                    hidden: true,
                },
            },
        };
    }

    ngOnInit(): void {
        // let chatId = this.route.snapshot.paramMap.get('id');
        // this._streamService.setChatId(chatId);
    }
}
