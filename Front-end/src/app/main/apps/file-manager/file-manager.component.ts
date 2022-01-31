import {
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
    ViewChild,
    ElementRef,
} from "@angular/core";
import { Subject, of } from "rxjs";
import { takeUntil, map, catchError, window } from "rxjs/operators";

import { fuseAnimations } from "@fuse/animations";
import { FuseSidebarService } from "@fuse/components/sidebar/sidebar.service";

import { FileManagerService } from "app/main/apps/file-manager/file-manager.service";
import { HttpEventType, HttpErrorResponse } from "@angular/common/http";

@Component({
    selector: "file-manager",
    templateUrl: "./file-manager.component.html",
    styleUrls: ["./file-manager.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class FileManagerComponent implements OnInit, OnDestroy {
    selected: any;
    pathArr: string[];

    // Private
    private _unsubscribeAll: Subject<any>;

    @ViewChild("fileInput", { static: false }) fileUpload: ElementRef;
    files = [];
    myFiles: File[];

    /**
     * Constructor
     *
     * @param {FileManagerService} _fileManagerService
     * @param {FuseSidebarService} _fuseSidebarService
     */
    constructor(
        private _fileManagerService: FileManagerService,
        private _fuseSidebarService: FuseSidebarService
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._fileManagerService.onFileSelected
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((selected) => {
                this.selected = selected;
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle the sidebar
     *
     * @param name
     */
    toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }

    onClick() {
        const fileUpload = this.fileUpload.nativeElement;

        fileUpload.onchange = () => {
            for (let index = 0; index < fileUpload.files.length; index++) {
                const file = fileUpload.files[index];
                this.files.push({ data: file, inProgress: false, progress: 0 });
            }
            this.uploadFiles();
        };
        fileUpload.click();
    }

    private uploadFiles() {
        this.fileUpload.nativeElement.value = "";
        this.files.forEach((file) => {
            this.uploadFile(file);
        });
    }

    uploadFile(file) {
        const formData = new FormData();
        formData.append("file", file.data);
        file.inProgress = true;

        this._fileManagerService
            .upload(formData)
            .pipe(
                map((event) => {
                    switch (event.type) {
                        case HttpEventType.UploadProgress:
                            file.progress = Math.round(
                                (event.loaded * 100) / event.total
                            );
                            break;
                        case HttpEventType.Response:
                            return event;
                    }
                }),
                catchError((error: HttpErrorResponse) => {
                    file.inProgress = false;
                    return of(`${file.data.name} upload failed.`);
                })
            )
            .subscribe((event: any) => {
                if (typeof event === "object") {
                    console.log(event.body);
                }
            });
    }
}
