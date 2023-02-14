# AliyunPlayScript
在阿里云网页版通过获取直链调用potplayer等播放器播放原画视频，使用用户脚本管理器安装该脚本。

# 修好了

~~由于官方API更新，原画播放暂不可用，分享链接下载功能可用。~~

参考
`https://www.52pojie.cn/thread-1745677-1-1.html`
`https://github.com/kazutoiris/ali_ecc`
添加sign算法

# 使用
苦于alist不够好用，emby过于笨重，为简化观影步骤，该脚本在阿里云网页版视频预览界面添加原画播放按钮，点击后调用potplayer等播放器播放原画视频。
![image](https://user-images.githubusercontent.com/19631976/215684134-d7cfb289-1b85-4ba6-b865-b51645c6cd13.png)

苦于协议分析，分享的链接可以点击原画下载，调用播放器待完善。目前请保存到自己云盘后播放。
![image](https://user-images.githubusercontent.com/19631976/215684656-2b04391f-a85b-448f-87af-718cdd1099d3.png)

# 设置
使用potplyer播放需安装potplayer插件 [https://github.com/gene9831/AliyunDrivePotPlayer](https://github.com/gene9831/AliyunDrivePotPlayer)

使用其他播放器可以在脚本管理器的数据项中修改字段的值为你的播放器的url-scheme前缀，或者直接编辑脚本变量。
