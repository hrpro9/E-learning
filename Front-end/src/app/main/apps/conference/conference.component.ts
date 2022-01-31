import { Component, OnInit } from "@angular/core";
import { FuseConfigService } from "@fuse/services/config.service";

@Component({
    selector: "app-conference",
    templateUrl: "./conference.component.html",
    styleUrls: ["./conference.component.css"],
})
export class ConferenceComponent implements OnInit {
    constructor(private _fuseConfigService: FuseConfigService) {
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

    ngOnInit() {}
}
