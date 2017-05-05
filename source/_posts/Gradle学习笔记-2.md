---
title: Gradle学习笔记@2
date: 2017-04-27 18:02:16
tags:
  - Gradle
categories:
  - Gradle
---
Gradle中有两个基本的概念：project和task。每个Gradle的构建由一个project构成，它代表着需要被构建的组件或者构建的整个项目。每个project由一个或者多个task组成。task代表着Gradle构建过程中可执行的最小单元。例如当构建一个组件时，可能需要先编译、打包、然后再生成文档或者发布等，这其中的每个步骤都可以定义成一个task。

### 1.Task创建及应用

#### 1.1 HelloWorld创建及源码详解
task的doLast、doFirst、及<<使用;doLast意思是定义一个行为(映射Gradle中的Action类)，放在当前task的最后，类似的，还有doFirst,表示将定义的行为放在当前task最前面,<<仅仅是doLast的一个别名。

##### 新建build.gradle文件，在文件中添加下方代码：

```
task helloWorld << {
     println "Hello World!"
}
```
<center>![hello](/images/gradle-hello.png)</center>

```
task helloWorld1 {
     doLast{
	   println "doLast!"
     }
     doFirst{
	    println "doFirst!"
     }
}
```
<center>![hello1](/images/gradle-hello1.png)</center>

##### doLast,doFirst,<<——Java源码详解
```
public abstract class AbstractTask implements TaskInternal, DynamicObjectAware {
   private List<Action<? super Task>> actions = new ArrayList<Action<?   super Task>>();
 
   public Task doFirst(Action<? super Task> action) {
         if (action == null) {
            throw new InvalidUserDataException("Action must not be null!");
        }
        actions.add(0, wrap(action));
         return this;
     }
 
    public Task doLast(Action<? super Task> action) {
         if (action == null) {
             throw new InvalidUserDataException("Action must not be null!");
         }
         actions.add(wrap(action));
         return this;
     }
```

Task类里面实际执行部分都会转化成Action，支持动态DSL语言，动态添加到对应的集合中，最后执行该任务的所有Action。

#### 1.2 Task实现简单Java实例

##### 英文字符串转成大写英文字符串

```
task upper{
     doLast{
        String inits="mjy hello World";
        println "origin:"+inits
        println "upperCase:"+inits.toUpperCase()
     }
}
```

<center>![upper](/images/gradle-upper.png)</center>

##### 数字循环输出

```
task count{
     doLast{
        4.times { print "$it "}
     }
}
```

<center>![count](/images/gradle-count.png)</center>


#### 1.3 Task dependencies

```
task helloWorld << {
     println "Hello World!"
}
task child(dependsOn: helloWorld){
    doLast{
	println "I'm HelloWorld of child!"
    }
}
```

<center>![child](/images/gradle-child.png)</center>


#####　dependsOn用来声明要依赖的对象，但是依赖的对象并不一定存在

```
task nochild(dependsOn: 'nomjy'){
    doLast{
	  println "I'm nomjy of nochild!"
    }
}
task nomjy{
     doLast{
	  println "I'm nomjy!"
    }
}
```

<center>![nochild](/images/gradle-nochild.png)</center>


#### 1.4 动态创建任务
##### 动态创建任务的两种方式

```
4.times { counter ->
    task "task$counter" {
        doLast {
            println "task $name"
        }
    }
}

(5..6).each {
    task "task$it" << {
        println "task $name"
    }
}
```

<center>![dynamic](/images/gradle-dynamic.png)</center>


##### 动态创建任务间的依赖关系

```
4.times { counter ->
    task "task$counter" {
        doLast {
            println "task $name"
        }
    }
}
task0.dependsOn task2, task3
(5..6).each {
    task "task$it" << {
        println "task $name"
    }
}
```
<center>![multi](/images/gradle-multi.png)</center>


#### 1.5 定义默认任务

```
defaultTasks 'clean', 'run'

task clean {
    doLast {
        println 'Default Cleaning!'
    }
}

task run {
    doLast {
        println 'Default Running!'
    }
}

task other {
    doLast {
        println "I'm not a default task!"
    }
}
```


#### Gradle构建基础（[Build Script Basics](https://docs.gradle.org/3.5/userguide/tutorial_using_tasks.html)）

