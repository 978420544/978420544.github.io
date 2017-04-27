---
layout: w
title: Gradle学习笔记@1
date: 2017-04-27 15:21:33
tags:
  - Gradle
categories:
  - Gradle
---
Gradle是一个基于JVM的构建工具，是一款通用灵活的构建工具，支持maven， Ivy仓库，支持传递性依赖管理，而不需要远程仓库或者是pom.xml和ivy.xml配置文件，基于Groovy，build脚本使用Groovy编写。

和Maven一样，Gradle只是提供了构建项目的一个框架，真正起作用的是Plugin。Gradle在默认情况下为我们提供了许多常用的Plugin，其中包括有构建Java项目的Plugin，还有War，Ear等。与Maven不同的是，Gradle不提供内建的项目生命周期管理，只是java Plugin向Project中添加了许多Task，这些Task依次执行，为我们营造了一种如同Maven般项目构建周期。

### 1.下载安装
#### [Gradle下载地址](https://gradle.org/releases)

<center>![Complete图文](/images/gradle-download.png)</center>

#### 解压gradle-3.5-all.zip

<center>![zip](/images/gradle-zip.png)</center>

<center>![dir](/images/gradle-dir.png)</center>

#### 配置环境变量
##### 添加GRADLE_HOME环境变量

<center>![home](/images/gradle-home.png)</center>

##### 环境变量Path追加%GRADLE_HOME%\bin;

<center>![path](/images/gradle-path.png)</center>

### 2.简单测试
#### vesion查看

<center>![version](/images/gradle-version.png)</center>

#### Hello World!

##### 新建build.gradle文件，在文件中添加下方代码：

task helloWorld << {
     println "Hello World!"
}

<center>![hello](/images/gradle-hello.png)</center>
