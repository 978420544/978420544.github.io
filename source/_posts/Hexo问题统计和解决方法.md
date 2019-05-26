---
title: Hexo问题统计和解决方法
date: 2019-05-26 19:49:02
tags:
  - Hexo
categories:
  - Hexo
---
### Hexo问题统计和解决方法
#### 置顶>关于Hexo的问题统计会持续更新，如果有遗漏可以邮件联系我
#### 1. 本地代码库迁移
##### 1.1 是否需要把博客hexo初始化?
如果你保存了之前的源码，包含了package.json等相关的一些hexo信息，那么不用初始化，直接安装生成器就可以了
```
cnpm install
```
##### 1.2 hexo发布的时候出现如下错误怎么解决？
```
Please make sure you have the correct access rights
and the repository exists.
FATAL Something's wrong. Maybe you can find the solution here: http://hexo.io/docs/troubleshooting.html
Error: Host key verification failed.
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.

    at ChildProcess.<anonymous> (D:\Hexo\node_modules\hexo-deployer-git\node_modules\hexo-util\lib\spawn.js:42:17)
    at emitTwo (events.js:87:13)
    at ChildProcess.emit (events.js:172:7)
    at maybeClose (internal/child_process.js:817:16)
    at Process.ChildProcess._handle.onexit (internal/child_process.js:211:5)
```
解决方案如下：

1. 检查Git的SSH秘钥是否配置好，如果没有配置好，配置好问题应该就好了
2. 如果Git的SSH秘钥已经配置好，那么检查你是否配置了向多个仓库commit代码，如果有的话，可以尝试检查一下你的两个仓库的链接是否都是有效的；如果其中一个不能无效，也会导致这种错误
3. 检查系统是否配置拥有Git的提交权限，没有权限，commit依然会被拒绝
4. 一个比较新颖的解决方案，删除.deploy_git文件夹试试；问题原因是很长时间没有更新发布，hexo的版本可能更新升级或者其中用到的组件更新升级
5. 如果用的是HTTPS的origin可以尝试把地址更换为SSH的origin url
#### 2. 初试Hexo遇到的问题
##### 2.1 Hexo初始化的时候，提示如下错误？
```
FATAL F:\github not empty, please run `hexo init` on an empty folder and then copy 
your files into it
FATAL Something's wrong. Maybe you can find the solution here: 
http://hexo.io/docs/troubleshooting.html
Error: target not empty
   at Context.initConsole(C:\Users\Administrator\AppData\Roaming\npm\node_modules\hexo-cli\lib\console\init.js:30:27)
   atContext.tryCatcher(C:\Users\Administrator\AppData\Roaming\npm\node_modules\hexo-cli\node_modules\_bluebird@3.5.5@bluebird\js\release\util.js:16:23)
    at Context.<anonymous>(C:\Users\Administrator\AppData\Roaming\npm\node_modules\hexo-cli\node_modules\_bluebird@3.5.5@bluebird\js\release\method.js:15:34)
    at C:\Users\Administrator\AppData\Roaming\npm\node_modules\hexo-cli\lib\context.js:44:9
    at Promise._execute 
(C:\Users\Administrator\AppData\Roaming\npm\node_modules\hexo-cli\node_modules\_bluebird@3.5.5@bluebird\js\release\debuggability.js:313:9)
    at Promise._resolveFromExecutor 
(C:\Users\Administrator\AppData\Roaming\npm\node_modules\hexo-cli\node_modules\_bluebird@3.5.5@bluebird\js\release\promise.js:488:18)
    at new Promise 
(C:\Users\Administrator\AppData\Roaming\npm\node_modules\hexo-cli\node_modules\_bluebird@3.5.5@bluebird\js\release\promise.js:79:10)
    at Context.call 
(C:\Users\Administrator\AppData\Roaming\npm\node_modules\hexo-cli\lib\context.js:40:10)
    at C:\Users\Administrator\AppData\Roaming\npm\node_modules\hexo-cli\lib\hexo.js:68:17
    at tryCatcher 
(C:\Users\Administrator\AppData\Roaming\npm\node_modules\hexo-cli\node_modules\_bluebird@3.5.5@bluebird\js\release\util.js:16:23)
    at Promise._settlePromiseFromHandler 
(C:\Users\Administrator\AppData\Roaming\npm\node_modules\hexo-cli\node_modules\_bluebird@3.5.5@bluebird\js\release\promise.js:517:31)
    at Promise._settlePromise 
(C:\Users\Administrator\AppData\Roaming\npm\node_modules\hexo-cli\node_modules\_bluebird@3.5.5@bluebird\js\release\promise.js:574:18)
    at Promise._settlePromise0 
(C:\Users\Administrator\AppData\Roaming\npm\node_modules\hexo-cli\node_modules\_bluebird@3.5.5@bluebird\js\release\promise.js:619:10)
    at Promise._settlePromises 
(C:\Users\Administrator\AppData\Roaming\npm\node_modules\hexo-cli\node_modules\_bluebird@3.5.5@bluebird\js\release\promise.js:699:18)
    at Promise._fulfill 
(C:\Users\Administrator\AppData\Roaming\npm\node_modules\hexo-cli\node_modules\_bluebird@3.5.5@bluebird\js\release\promise.js:643:18)
    at Promise._resolveCallback 
(C:\Users\Administrator\AppData\Roaming\npm\node_modules\hexo-cli\node_modules\_bluebird@3.5.5@bluebird\js\release\promise.js:437:57)
```
解决方案：Hexo 初始化只能找一个空目录初始化

