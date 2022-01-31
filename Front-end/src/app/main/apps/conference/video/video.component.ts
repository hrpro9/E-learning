import { Component, OnInit, AfterViewInit } from "@angular/core";
import * as JitsiMeetExternalAPI from "./vendor/external_api.js";
import { ActivatedRoute } from "@angular/router";

@Component({
    selector: "conference-video",
    templateUrl: "./video.component.html",
    styleUrls: ["./video.component.css"],
})
export class VideoComponent implements OnInit, AfterViewInit {
    domain: string = "meet.jit.si";
    options: any;
    api: any;

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        throw new Error("Method not implemented.");
    }

    ngAfterViewInit(): void {
        this.options = {
            roomName: this.route.snapshot.paramMap.get("id"),
            width: "100%",
            height: "90%",
            parentNode: document.querySelector("#meet"),
        };

        this.api = new JitsiMeetExternalAPI(this.domain, this.options);
    }
}
