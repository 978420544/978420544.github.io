---
title: Github2Hexo搭建
date: 2017-05-12 12:57:48
tags:
  - Hexo
categories:
  - Hexo
---
在github社区越来越火的时代，越来越多的人在github上去做研究开发，它的博客也慢慢的兴起，并且为了在以后的求职中有更大的优势，我们需要在互联网上展现自己的优势和经验，那么一份个人的博客绝对是一个很好的选择，在这篇文章，我会给大家介绍github账户主页的创建和基于hexo的静态博客页面的生成，我们可以在markdown的语法的基础上上传我们的博客，更快更高效率的去展现自己文章的内容！

## github
### 1. github SSL配置
#### 1.1 登录github社区，进入账户设置页面

注册并登录github设置，点击个人账户图像进入如图的下拉菜单，点击<span style='color:red;'>Setting</span>,进入个人账户设置的页面。

##### 1.1.1 账户菜单

<center>![hello](/images/git/git-setting.png)</center>

##### 1.1.2 账户设置

<center>![hello](/images/git/git-setting2.png)</center>

#### 1.2  配置SSl keys

##### 1.2.1 本地安装[GitBash](https://git-scm.com/downloads)
仅需要点击exe文件安装，下一步即可，可选项可按照自己情况来选择
##### 1.2.2 设置Git的username和email
```
$ git config --global user.name "xuhaiyan"
$ git config --global user.email "haiyan.xu.vip@gmail.com"
```
##### 1.2.3 生成SSH秘钥
###### 查看是否已经有了ssh密钥
```
cd ~/.ssh
```
###### 生成秘钥

```
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

如果你不需要给秘钥另外设置存储位置的话，请以此按下Enter键：
```
Enter a file in which to save the key (/c/Users/you/.ssh/id_rsa):[Press enter]
Enter passphrase (empty for no passphrase): [Type a passphrase]
Enter same passphrase again: [Type passphrase again]
```
##### 1.2.4 github账户配置SSH秘钥
###### 粘贴生成的SSH秘钥到github上面
* 账户菜单-账户设置-SSH and GPG keys
* 新建SSH keys
* 把粘贴的秘钥放进去
* 

<center>![hello](/images/git/git-ssh.png)</center>

<center>![hello](/images/git/git-ssh-new.png)</center>

<center>![hello](/images/git/git-ssh-save.png)</center>




### 2. github 博客项目

#### 2.1 创建博客项目

博客项目创建应该按照这样的规范：username.github.io的项目命名规范，生成的主页可以使用域名:username.github.io访问；

#### 2.2 个人主页分支设置
设置github访问的分支，用来存放生成的静态页面；
进入项目--setting，设置GitHub Pages分支，默认可以选择master分支，点击Save保存；

##### 2.2.1 setting

<center>![hello](/images/git/git-project-setting.jpg)</center>

##### 2.2.2 Repository

<center>![hello](/images/git/git-project-repository.jpg)</center>

##### 2.2.3 GitHub Pages

<center>![hello](/images/git/git-project-pages.jpg)</center>


## hexo
依赖git和nodeJs，安装好git，可以在git上面执行对应的安装指令
### 1. 安装 Node.js
hexo生成架构师基于Node.js的，需要安装Node.js;如果不对其进行其他的学习的话，只需要根据小白法则，进行下一步一次安装即可；如果需要学习就需要找对应的教程进行学习，这里不对安装过程赘述。
### 2. 安装hexo
#### 2.1 验证git和nodeJs的安装
``` 
git --version
node -v
```
#### 2.2 通过淘宝镜像安装hexo
```
npm install -g cnpm --registry=https://registry.npm.taobao.org
cnpm install -g hexo-cli
cnpm install hexo --save
```
注意：不需要理会出现的警告即可
#### 2.3 查看hexo版本
```
hexo -v
```
### 3. hexo博客搭建
#### 3.1 hexo初始化
```
hexo init
```
#### 3.2 生成器的安装和博客简单介绍
##### 3.2.1 生成器的安装
```
cnpm install
```
##### 3.2.2 本地简单测试运行
运行命令
```
hexo s -g
```
测试地址
```
localhost:4000
```
##### 3.2.3 根目录下配置实例
```
#博客名称
title: 我的博客
#副标题
subtitle: 一天进步一点
#简介
description: 记录生活点滴
#博客作者
author: John Doe
#博客语言
language: zh-CN
#时区
timezone:

#博客地址,与申请的GitHub一致
url: http://elfwalk.github.io
root: /
#博客链接格式
permalink: :year/:month/:day/:title/
permalink_defaults:

source_dir: source
public_dir: public
tag_dir: tags
archive_dir: archives
category_dir: categories
code_dir: downloads/code
i18n_dir: :lang
skip_render:

new_post_name: :title.md # File name of new posts
default_layout: post
titlecase: false # Transform title into titlecase
external_link: true # Open external links in new tab
filename_case: 0
render_drafts: false
post_asset_folder: false
relative_link: false
future: true
highlight:
  enable: true
  line_number: true
  auto_detect: true
  tab_replace:

default_category: uncategorized
category_map:
tag_map:

#日期格式
date_format: YYYY-MM-DD
time_format: HH:mm:ss

#分页，每页文章数量
per_page: 10
pagination_dir: page

#博客主题
theme: landscape

#发布设置
deploy: 
  type: git
  #elfwalk改为你的github用户名
  repository: https://github.com/elfwalk/elfwalk.github.io.git
  branch: master
```
##### 3.2.4 md文件实例
```
title: hello
date: 2015-07-01 22:37:23
categories:
  - 日志
  - 二级目录
tags:
  - hello
---

摘要:
<!--more-->
正文:
```
##### 3.2.5 博客发布
```
hexo d -g
```

#### 3.3 hexo命令简介
##### 3.3.1 命令简写
```
hexo g
hexo generate
hexo n "我的博客" == hexo new "我的博客" #新建文章
hexo p == hexo publish
hexo g == hexo generate#生成
hexo s == hexo server #启动服务预览
hexo d == hexo deploy#部署
```
##### 3.3.2 服务器
```
hexo server #Hexo 会监视文件变动并自动更新，您无须重启服务器。
hexo server -s #静态模式
hexo server -p 5000 #更改端口
hexo server -i 192.168.1.1 #自定义 IP

hexo clean #清除缓存 网页正常情况下可以忽略此条命令
hexo g #生成静态网页
hexo d #开始部署
```
##### 3.3.3 监视文件变动
```
hexo generate #使用 Hexo 生成静态文件快速而且简单
hexo generate --watch #监视文件变动
```
##### 3.3.4 部署命令
```
hexo generate --deploy
hexo deploy --generate
```
等效于
```
hexo deploy -g
hexo server -g
```
##### 3.3.5 页面的创建
```
hexo publish [layout] <title> #草稿

hexo new "postName" #新建文章
hexo new page "pageName" #新建页面
hexo generate #生成静态页面至public目录
hexo server #开启预览访问端口（默认端口4000，'ctrl + c'关闭server）
hexo deploy #将.deploy目录部署到GitHub

hexo new [layout] <title>
hexo new photo "My Gallery"
hexo new "Hello World" --lang tw
```
#### 3.4 FAQ
##### 3.4.1 ERROR Deployer not found: git
解决方法
```
npm install hexo-deployer-git --save
```
##### 3.4.2 部署类型设置git
hexo 3.0 部署类型不再是github，_config.yml 中修改
```
# Deployment
## Docs: http://hexo.io/docs/deployment.html
deploy:
  type: git
  repository: git@***.github.com:***/***.github.io.git
  branch: master
```
##### 3.4.3 xcodebuild
xcode-select: error: tool 'xcodebuild' requires Xcode, but active developer directory '/Library/Developer/CommandLineTools' is a command line tools instance
```
npm install bcrypt
```
##### 3.4.4 RSS不显示
安装RSS插件
```
npm install hexo-generator-feed --save
```
##### 3.4.5 关于摘要
有的主题可能自带摘要，但是有的需要自己安装摘要或者修改源码
##### 3.4.6 关于网页计数器的使用
建议使用不蒜子计数器，简单使用
##### 3.4.7 关于开启评论
可以通过配置或者该源码，使用第三方插件进行开启
##### 3.4.8 关于google和百度的收录
google和百度站点地图的安装
```
npm install hexo-generator-sitemap --save
npm install hexo-generator-baidu-sitemap --save
```
根目录配置文件配置
```
# 自动生成sitemap
sitemap:
path: sitemap.xml
baidusitemap:
path: baidusitemap.xml
```
生成结果：sitemap.xml跟baidusitemap.xml
对应平台收录可以去谷歌和百度的站长平台去进行录入，提交使用站点地图提交的方式即可（使用sitemap提交）
注意：github禁止百度爬虫访问博客，可以采用其他的代码托管网站，比如说coding，进行提交
需要注意的是，baidusitemap.xml有可能是生成的github的链接，需要到node_modules文件夹下面的百度插件修改对应的链接的获取，重新生成即可
##### 3.4.9 关于md文件的提交
可以在username.github.io的项目里面新建一个分支用于存放md文件
##### 3.4.10 关于_config.yml的修改
需要注意的是根目录和主题目录下的_config.yml文件，视情况而定
