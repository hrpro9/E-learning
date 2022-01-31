import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
    ActivatedRouteSnapshot,
    Resolve,
    RouterStateSnapshot,
} from "@angular/router";
import { Observable, BehaviorSubject } from "rxjs";

@Injectable()
export class FileManagerService implements Resolve<any> {
    onFilesChanged: BehaviorSubject<any>;
    onFileSelected: BehaviorSubject<any>;
    header: any;

    Server_URL: string = "http://localhost:83/TestApi/api/FileUpload";
    downloadURL: string =
        "http://localhost:83/TestApi/api/FileDownloading/Download?fileName=";
    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(private _httpClient: HttpClient) {
        // Set the defaults
        this.onFilesChanged = new BehaviorSubject({});
        this.onFileSelected = new BehaviorSubject({});
        this.header = new HttpHeaders({
            Authorization: "Basic " + btoa("Mohamed:123456"),
        });
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Promise<any> | any {
        return new Promise((resolve, reject) => {
            Promise.all([this.getFiles()]).then(([files]) => {
                resolve();
            }, reject);
        });
    }

    /**
     * Get files
     *
     * @returns {Promise<any>}
     */

    getFiles(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .get(this.Server_URL, { headers: this.header })
                .subscribe((response: any) => {
                    this.onFilesChanged.next(response);
                    this.onFileSelected.next(response[0]);
                    resolve(response);
                }, reject);
        });
    }

    //Download File
    downloadFile(fileName: string): Observable<any> {
        return this._httpClient.get(this.downloadURL + fileName, {
            headers: this.header,
            responseType: "blob",
        });
    }

    //Upload Files
    public upload(formData) {
        return this._httpClient.post<any>(this.Server_URL, formData, {
            headers: this.header,
        });
    }
}
