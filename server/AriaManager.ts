import Aria2 from "aria2";
import config from './config';

export default class AriaManager {
    aria: Aria2;
    dlGuids: string[];

    constructor() {
        console.info("Initializing AriaManager...");
        if(config.aria.enabled) {
            this.aria = new Aria2({
                host: config.aria.host,
                port: config.aria.port,
                path: config.aria.path, 
                secret: config.aria.secret,
                secure: config.aria.secure
            });
            this.aria.on("output", m => {
                console.info("aria2 OUT: ", m);
              });
            this.dlGuids = new Array<string>();

            this.aria.call("getVersion")
                        .then(verObj => { console.info("AriaManager initialized, got version " + verObj.version); })
                        .catch(err => { console.warn("Error connecting to Aria2, disabling AriaManager: " + JSON.stringify(err.cause)); this.aria = null; });
        
        }
    }

    addDownload(uri, fileName): boolean {
        if(this.aria == null) return false;
        if(uri == null) return false;

        const dUri = decodeURI(uri.toString());
        const msg = {};
    
        if(fileName != null) {
	        const fno = { out: decodeURI(fileName.toString()) }
	        Object.assign(msg, fno);
        }
   
        try {
            this.aria.call("addUri",[dUri], msg).then(value => { this.dlGuids.push(value); console.info("[AriaManager] Added URI with guid " + JSON.stringify(value)) });
            return true;
        } catch(e) {
            console.warn("Error communicating with Aria2, disabling AriaManager...");
            this.aria = null;
            return false;
        }
    }

    private nFormatter(num: number, digits: number): string {
        const lookup = [
          { value: 1, symbol: "" },
          { value: 1e3, symbol: "k" },
          { value: 1e6, symbol: "M" },
          { value: 1e9, symbol: "G" },
          { value: 1e12, symbol: "T" },
          { value: 1e15, symbol: "P" },
          { value: 1e18, symbol: "E" }
        ];
        const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        var item = lookup.slice().reverse().find(function(item) {
          return num >= item.value;
        });
        return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
    }

    private convertFilesArray(input: Array<any>): Array<any> {
        input.forEach((gpart, gindex, gArray) => {
            gArray[gindex].files = gArray[gindex].files[0].path.split('\\').pop().split('/').pop();
            gArray[gindex].downloadSpeed = this.nFormatter(gArray[gindex].downloadSpeed, 1) + "B/s";
            gArray[gindex].progress = Math.round((gArray[gindex].completedLength / gArray[gindex].totalLength) * 100) + "%";
            gArray[gindex].completedLength = this.nFormatter(gArray[gindex].completedLength, 1) + "B";
            gArray[gindex].totalLength = this.nFormatter(gArray[gindex].totalLength, 1) + "B";
            gArray[gindex].status = gArray[gindex].status.replace("complete", "fertig").replace("waiting", "warten").replace("active", "läuft");
            //gArray[gindex].files.forEach((fpart, findex, fArray) => {
            //    fArray[findex] = fArray[findex].path;
            //});
        });
        return input;
    }

    async getDownloads(): Promise<string> {
        return new Promise( (res, rej) => {
            if(this.aria == null) { rej("{\"active\":[],\"waiting\":[],\"stopped\":[]}"); return; }
            Promise.all([
                new Promise((res,rej) => { 
                    this.aria.call("tellActive", ["completedLength", "totalLength", "downloadSpeed", "status", "gid", "files"])
                                .then(val => res(this.convertFilesArray(val))).catch(err => rej(err));
                }),
                new Promise((res,rej) => { 
                    this.aria.call("tellWaiting", 0, 30, ["completedLength", "totalLength", "downloadSpeed", "status", "gid", "files"])
                                .then(val => res(this.convertFilesArray(val))).catch(err => rej(err));
                }),
                new Promise((res,rej) => { 
                    this.aria.call("tellStopped", 0, 30, ["completedLength", "totalLength", "downloadSpeed", "status", "gid", "files"])
                                .then(val => res(this.convertFilesArray(val))).catch(err => rej(err));
                })
            ]).then(([activeD, waitingD, stoppedD]) => res(JSON.stringify( { active: activeD, waiting: waitingD, stopped: stoppedD })))
            .catch(err => rej(err));
        });
    }

    removeDownload(gid: string): Promise<string> {
        return new Promise( (res, rej) => {
            if(this.aria == null) { rej("{}"); return; }
            this.aria.call("tellStatus", gid, ["status"]).then(val => {
                if(["complete", "error", "removed"].includes(val.status)) {
                    this.aria.call("removeDownloadResult", gid).then(val => res(JSON.stringify(val)))
                                .catch(err => res(JSON.stringify(err)));
                } else {
                    this.aria.call("remove", gid).then(val => res(JSON.stringify(val)))
                                .catch(err => res(JSON.stringify(err)));
                }

            }).catch(err => res(JSON.stringify(err)));

            //this.aria.call("removeDownloadResult")

            //
        });
    }
}