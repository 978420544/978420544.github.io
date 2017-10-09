---
title: Java定时任务集群部署方式浅谈
date: 2017-10-09 14:22:22
tags:
  - Java
  - Spring
  - QUARTZ
categories:
  - QUARTZ

---
本篇基于QUARTZ的定时任务，主要介绍一下定时任务的集群部署方式，方法一：QUARTZ支持的集群部署；方法二：通过HTTP调用的集群部署。

### 任务调度 Job

任务调度 Job 如同数据库作业或 Windows计划任务，是分布式系统中异步和批处理的关键。我们的 Job分为 WinJob 和 HttpJob：WinJob是操作系统级别的定时任务，使用开源的框架Quartz 实现；而 HttpJob 则是采用 URL方式可定时调用微服务。HttpJob 借助集群巧妙地解决了 WinJob的单点和发布问题，并集中管理所有的调度规则，调度规则有简单规则和 Cron 表达式。HttpJob 它简单易用，但间隔时间不能低于 1分钟，毕竟通过 URL 方式来调度并不高效。

--转自 [《可参考的才是有价值的：中小型研发团队架构落地实践18篇，含案例、代码》](http://mp.weixin.qq.com/s/AbUGOWN27FEUPWgDQkF_Dw)


### QUARTZ模式

一个Quartz集群中的每个节点是一个独立的Quartz应用，它又管理着其他的节点。这就意味着你必须对每个节点分别启动或停止。Quartz集群中，独立的Quartz节点并不与另一其的节点或是管理节点通信，而是通过相同的数据库表来感知到另一Quartz应用的。


　
Quartz Scheduler自身是察觉不到被集群的，只有配置给Scheduler的JDBC JobStore才知道。当QuartzScheduler启动时，它调用JobStore的schedulerStarted()方法，它告诉JobStoreScheduler已经启动了。schedulerStarted() 方法是在JobStoreSupport类中实现的。JobStoreSupport类会根据quartz.properties文件中的设置来确定Scheduler实例是否参与到集群中。假如配置了集群，一个新的ClusterManager类的实例就被创建、初始化并启动。ClusterManager是在JobStoreSupport类中的一个内嵌类，继承了java.lang.Thread，它会定期运行，并对Scheduler实例执行检入的功能。Scheduler也要查看是否有任何一个别的集群节点失败了。检入操作执行周期在quartz.properties中配置。

--转自 [《Quartz集群原理及配置应用》](http://www.cnblogs.com/zhenyuyaodidiao/p/4755649.html)

### HTTP模式

HTTP模式，简而言之就是URL调用模式，通过发布的微服务调用来完成对应的任务，相应的定时可采用对应合适的调度工具，定时触发这些URL的调用。