---
title: hexo源文件的远程托管解决方案
date: 2017-04-13 16:08:11
tags:
  - Hexo
categories:
  - Hexo
---
最近，使用hexo的simpleblock主题时遇到一个问题，然后就去研究了一下。关于hexo博客Markdown文件的上传同时也可以上传相关的配置文件，用做源文件链接或者在其他的电脑上编辑博客。

解决方案：在git上面新建一个分支，在这个分支把所有的源文件和配置的文件上传，但是不能上传一些安装的目录和文件，然后在其他地方Clone下来，安装hexo使用，但是不能hexo init，init会把所有的文件初始化。

gitignore忽略文件：
.DS_Store
Thumbs.db
db.json
*.log
node_modules/
