// ==UserScript==
// @name              阿里云原画播放
// @version           1.0.0
// @author            GreasyFork
// @date              2023-01-31
// @description       在画质选项中加入原画播放选项，使用potplayer播放阿里云盘原画视频（需要安装potplayer插件）
// @license           AGPL-3.0-or-later
// @antifeature       membership
// @match             *://www.aliyundrive.com/s/*
// @match             *://www.aliyundrive.com/drive*
// @require           https://unpkg.com/jquery@3.6.0/dist/jquery.min.js
// @connect           aliyundrive.com
// @connect           localhost
// @connect           *
// @run-at            document-idle
// @grant             unsafeWindow
// @grant             GM_xmlhttpRequest
// @grant             GM_setClipboard
// @grant             GM_setValue
// @grant             GM_getValue
// @grant             GM_openInTab
// @grant             GM_info
// @grant             GM_registerMenuCommand
// @grant             GM_cookie
// @icon              https://gw.alicdn.com/imgextra/i3/O1CN01aj9rdD1GS0E8io11t_!!6000000000620-73-tps-16-16.ico
// ==/UserScript==

(function () {
    'use strict';
    let g_drive_id = "", g_file_id = "", g_file_name = "", g_share_id = "";
    let api_url = {
            "0": "https://api.aliyundrive.com/v2/file/get_share_link_download_url",
            "1": "https://api.aliyundrive.com/v2/file/get_download_url"
        };


    let main = {

        isType(obj) {
            return Object.prototype.toString.call(obj).replace(/^\[object (.+)\]$/, '$1').toLowerCase();
        },

        post(url, data, headers, type) {
            if (this.isType(data) === 'object') {
                data = JSON.stringify(data);
            }
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "POST", url, headers, data,
                    responseType: type || 'json',
                    onload: (res) => {
                        type === 'blob' ? resolve(res) : resolve(res.response || res.responseText);
                    },
                    onerror: (err) => {
                        reject(err);
                    },
                });
            });
        },

        getStorage(key) {
            try {
                return JSON.parse(localStorage.getItem(key));
            } catch (e) {
                return localStorage.getItem(key);
            }
        },

        async getRealLink(d, f) {
            let authorization = `${this.getStorage('token').token_type} ${this.getStorage('token').access_token}`;
            let res = await this.post(api_url[1], {
                drive_id: d,
                file_id: f
            }, {
                authorization,
                "content-type": "application/json;charset=utf-8",
            });
            //console.log("getRealLink", d,f,res);
            if (res.url) {
                return res.url;
            }
            return '';
        },

        async getPCSLink(f, s){
            try {
                let authorization = `${this.getStorage('token').token_type} ${this.getStorage('token').access_token}`;
                let xShareToken = this.getStorage('shareToken').share_token;
                let res = await this.post(api_url[0], {
                    expire_sec: 600,
                    file_id: g_file_id,
                    share_id: g_share_id
                }, {
                    authorization,
                    "content-type": "application/json;charset=utf-8",
                    "x-share-token": xShareToken
                });
                if (res.download_url) {
                    return res.download_url;
                }
            } catch (e) {
                //console.log('提示：请先登录网盘！');
            }
        },


        initDefaultConfig() {
            let value = [{
                name: 'url-scheme',
                value: 'potplayer://'
            },];

            value.forEach((v) => {
                GM_getValue(v.name) === undefined && GM_setValue(v.name, v.value);
            });
        },

        init() {
            main.initDefaultConfig();
            //识别页面类型
            let sharepage=window.location.href.indexOf("s/")>0;
            //劫持XMLHttpRequest
            var send = XMLHttpRequest.prototype.send;
            XMLHttpRequest.prototype.send = function (data) {
                let url = this.openParams ? this.openParams[1] : this.responseURL;
                //console.log("aopsend",data)
                if (url.indexOf("/file/get_video_preview_play_info") > 0) {
                    //console.log("inject",data)
                    g_drive_id = JSON.parse(data).drive_id;
                    g_file_id = JSON.parse(data).file_id;
                    g_share_id = JSON.parse(data).share_id;
                    if (sharepage) {
                        g_file_name = document.getElementsByClassName("header-file-name--CN_fq")[0].textContent;
                    }
                    else {
                        g_file_name = document.getElementsByClassName("text--2KGvI")[0].textContent;
                    }
                    //console.log("got:", url, g_drive_id, g_file_id, g_file_name);

                    //循环检测dom创建，添加按钮 
                    let ins = setInterval(() => {
                        let quality = document.getElementsByClassName("drawer-list--JYzyI");
                        if (quality.length > 0) {
                            if (sharepage) {
                                quality[0].innerHTML += `<li class="drawer-item--2cNtQ original-video-play" data-is-current="false">
                                            <div class="text--AMJbu">原画下载</div>
                                        </li>`;
                                let play_button = document.getElementsByClassName("original-video-play")[0];
                                play_button.addEventListener("click", async function () {
                                    let url = await main.getPCSLink(g_file_id, g_share_id);
                                    let d = document.createElement("a");
                                    d.download = g_file_name;
                                    d.rel = "noopener";
                                    d.href = url;
                                    d.dispatchEvent(new MouseEvent("click"));
                                });
                            }
                            else {
                                quality[2].innerHTML += `<li class="drawer-item--2cNtQ original-video-play" data-is-current="false">
                                            <div class="text--AMJbu">原画播放</div>
                                        </li>`;
                                let play_button = document.getElementsByClassName("original-video-play")[0];
                                play_button.addEventListener("click", async function () {
                                    let url = await main.getRealLink(g_drive_id, g_file_id);
                                    let scheme = GM_getValue('url-scheme');
                                    url = scheme + url;
                                    let d = document.createElement("a");
                                    d.download = g_file_name;
                                    d.rel = "noopener";
                                    d.href = url;
                                    d.dispatchEvent(new MouseEvent("click"));
                                });
                            }
                            clearInterval(ins);
                        }
                    }, 50);

                }
                
                send.apply(this, arguments);
            };
        }
    };
    main.init();
})();
