layout: w
title: 关于Spring定时任务的整理
date: 2017-04-13 10:54:48
tags:
  - Java
  - Spring
categories:
  - Spring
---

最近，在做多个第三方支付平台的接入时，发现许多平台的支付交易状态需要异步的去获取，这就需要一个定时任务去做这些交易状态查询接口的调用，然后碰到一系列定时任务的使用问题，因此就对这些定时任务做一些整理和总结。
#### 当前定时任务的三种产品
* Java自带的java.util.Timer类，这个类允许你调度一个java.util.TimerTask任务。使用这种方式可以让你的程序按照某一个频度执行，但不能在指定时间运行。一般用的较少，这篇文章将不做详细介绍。
* [Quartz](http://www.quartz-scheduler.org/)是一个完全由Java编写的开源作业调度框架，为在Java应用程序中进行作业调度提供了简单却强大的机制。Quartz允许开发人员根据时间间隔来调度作业。它实现了作业和触发器的多对多的关系，还能把多个作业与不同的触发器关联。
* Spring3.0以后自带的task，可以将它看成一个轻量级的Quartz，而且使用起来比Quartz简单许多。

#### 从作业类的继承方式来讲，可以分为两类：

* 作业类需要继承自特定的作业类基类，如Quartz中需要继承自org.springframework.scheduling.quartz.QuartzJobBean；java.util.Timer中需要继承自java.util.TimerTask。
* 作业类即普通的java类，不需要继承自任何基类

#### 从任务调度的触发时机来分，这里主要是针对作业使用的触发器，主要有以下两种：

* 每隔指定时间则触发一次，在Quartz中对应的触发器为：org.springframework.scheduling.quartz.SimpleTriggerBean
* 每到指定时间则触发一次，在Quartz中对应的调度器为：org.springframework.scheduling.quartz.CronTriggerBean

##### 注：并非每种任务都可以使用这两种触发器，如java.util.TimerTask任务就只能使用第一种。Quartz和spring task都可以支持这两种触发条件。

***
## Quartz和SpringTask

* Quartz的继承方式和非继承方式，SimpleTriggerBean触发器和CronTriggerBean触发器。
* SpringTask的@Scheduled注解方式（cron,fixedRate,fixedDelay）。

### Quartz

#### 作业类继承自特定的基类:org.springframework.scheduling.quartz.QuartzJobBean

##### 作业类的继承（一）

```
import org.quartz.JobExecutionContext;  
import org.quartz.JobExecutionException;  
import org.springframework.scheduling.quartz.QuartzJobBean;  
public class Job1 extends QuartzJobBean {  
  
private int timeout;  
private static int i = 0;  
//调度工厂实例化后，经过timeout时间开始执行调度  
public void setTimeout(int timeout) {  
this.timeout = timeout;  
}  
  
/** 
* 要调度的具体任务 
*/  
@Override  
protected void executeInternal(JobExecutionContext context)  
throws JobExecutionException {  
  System.out.println("定时任务执行中…");  
}  
} 
```

##### 配置作业类JobDetailBean（二）

```
<bean name="job1" class="org.springframework.scheduling.quartz.JobDetailBean">  
<property name="jobClass" value="com.gy.Job1" />  
<property name="jobDataAsMap">  
<map>  
<entry key="timeout" value="0" />  
</map>  
</property>  
</bean> 
```

##### 配置触发器（三）

* SimpleTriggerBean

```
<bean id="simpleTrigger" class="org.springframework.scheduling.quartz.SimpleTriggerBean">  
<property name="jobDetail" ref="job1" />  
<property name="startDelay" value="0" /><!-- 调度工厂实例化后，经过0秒开始执行调度 -->  
<property name="repeatInterval" value="2000" /><!-- 每2秒调度一次 -->  
</bean>  
```

* CronTriggerBean

```
<bean id="cronTrigger" class="org.springframework.scheduling.quartz.CronTriggerBean">  
<property name="jobDetail" ref="job1" />  
<!—每天12:00运行一次 -->  
<property name="cronExpression" value="0 0 12 * * ?" />  
</bean>  
```

##### 配置调度工厂（四）

```
<bean class="org.springframework.scheduling.quartz.SchedulerFactoryBean">  
<property name="triggers">  
<list>  
<ref bean="cronTrigger" />  
</list>  
</property>  
</bean> 
```

#### 无需继承的作业类

##### 作业类（一）

```
public class TradeStatusQueryTask{
    public void tradeQuery(){
        System.out.println("交易状态查询进程");
    }
}
```

##### 作业类的配置（二）

```
<bean id="tradeStatusScheduling" class="com.mjy.task.TradeStatusQueryTask" /> 
 <bean id="myJobDetail"
    class="org.springframework.scheduling.quartz.MethodInvokingJobDetailFactoryBean">
  <property name="targetObject">
   <ref bean="tradeStatusQueryTask" />
  </property>
  <property name="targetMethod">
   <value>ExecCheckStatusTask</value>
  </property>
 </bean>
```
* 注册Bean：MethodInvokingJobDetailFactoryBean，有两个关键属性：targetObject指定任务类，targetMethod指定运行的方法。

##### 作业类的配置（三）

```
 <bean id="myJobTrigger"
    class="org.springframework.scheduling.quartz.CronTriggerFactoryBean">
  <property name="jobDetail">
   <ref bean="myJobDetail" />
  </property>
  <property name="cronExpression">
   <value>0 0/2 * * * ?</value>
  </property>
 </bean>
```
* ref参数指定的就是之前配置的作业类的MethodInvokingJobDetailFactoryBean——beanName
* Quartz的作业触发器有两种，分别是
org.springframework.scheduling.quartz.SimpleTriggerBean
org.springframework.scheduling.quartz.CronTriggerBean，两种触发器都可以使用，这里用的是CronTriggerBean。
##### 调度工厂的配置（四）

```
 <bean name="startQuertz"
    class="org.springframework.scheduling.quartz.SchedulerFactoryBean">
  <property name="triggers">
   <list>
    <ref bean="myJobTrigger" />
   </list>
  </property>
 </bean>
```
* ref参数指定的就是之前配置的触发器的beanName

##### 启动Spring的容器（五）

### SpringTask
* xml配置方式
* 注解配置方式
* 命名空间的添加
```
xmlns:task="http://www.springframework.org/schema/task"   
xsi:schemaLocation="http://www.springframework.org/schema/task http://www.springframework.org/schema/task/spring-task-3.0.xsd"
```

#### xml配置方式
```
<task:scheduled-tasks>   
<task:scheduled ref="taskJob" method="job1" cron="0 * * * * ?"/>   
</task:scheduled-tasks>
<context:component-scan base-package=" com.gy.mytask " />  
```
* ref参数指定的即作业类，method指定的即需要运行的方法，cron及cronExpression表达式.

#### 注解配置方式

##### 配置注解扫描
```
<context:component-scan base-package=" com.mjy.task " />
<!—开启这个配置，spring才能识别@Scheduled注解   -->  
    <task:annotation-driven scheduler="qbScheduler" mode="proxy"/>  
    <task:scheduler id="qbScheduler" pool-size="10"/>  
```
##### 注解的方式（Scheduled）

* cron：cron表达式
* fixedDelay：表示从上一个任务完成到下一个任务开始的间隔, 单位是毫秒
* fixed-rate：表示从上一个任务开始到下一个任务开始的间隔, 单位是毫秒（如果某次任务开始时上次任务还没有结束，那么在上次任务执行完成时，当前任务会立即执行）


```
@Target({java.lang.annotation.ElementType.METHOD, java.lang.annotation.ElementType.ANNOTATION_TYPE}) 
@Retention(RetentionPolicy.RUNTIME) 
@Documented 
public @interface Scheduled 
{ 
  public abstract String cron(); 
   
  public abstract long fixedDelay(); 
   
  public abstract long fixedRate(); 
}
```

***

### Cron表达式
#### Cron表达式的格式：秒 分 时 日 月 周 年(可选)

字段名 | 允许的值 | 允许的特殊字符
-------- | --- | ---
秒 | 0-59 | , - * /
分 | 0-59 | , - * /
小时 | 0-23 | , - * /  
日 | 1-31 | , - * ? / L W C
月 | 1-12 or JAN-DEC | , - * /  
周几 | 1-7 or SUN-SAT | , - * ? / L C #
年 (可选字段) | empty, 1970-2099 | , - * /

#### Cron表达式符号解释
* “?”字符：表示不确定的值
* “,”字符：指定数个值
* “-”字符：指定一个值的范围
* “/”字符：指定一个值的增加幅度。n/m表示从n开始，每次增加m
* “L”字符：用在日表示一个月中的最后一天，用在周表示该月最后一个星期X
* “W”字符：指定离给定日期最近的工作日(周一到周五)
* “#”字符：表示该月第几个周X。6#3表示该月第3个周五

#### Cron表达式范例
* 每隔5秒执行一次：*/5 * * * * ?
* 每隔1分钟执行一次：0 */1 * * * ?
* 每天23点执行一次：0 0 23 * * ?
* 每天凌晨1点执行一次：0 0 1 * * ?
* 每月1号凌晨1点执行一次：0 0 1 1 * ?
* 每月最后一天23点执行一次：0 0 23 L * ?
* 每周星期天凌晨1点实行一次：0 0 1 ? * L
* 在26分、29分、33分执行一次：0 26,29,33 * * * ?
* 每天的0点、13点、18点、21点都执行一次：0 0 0,13,18,21 * * ?
* "0 0 12 * * ?" 每天中午12点触发
* "0 15 10 ? * *" 每天上午10:15触发
* "0 15 10 * * ?" 每天上午10:15触发
* "0 15 10 * * ? *" 每天上午10:15触发
* "0 15 10 * * ? 2005" 2005年的每天上午10:15触发
* "0 * 14 * * ?" 在每天下午2点到下午2:59期间的每1分钟触发
* "0 0/5 14 * * ?" 在每天下午2点到下午2:55期间的每5分钟触发
* "0 0/5 14,18 * * ?" 在每天下午2点到2:55期间和下午6点到6:55期间的每5分钟触发
* "0 0-5 14 * * ?" 在每天下午2点到下午2:05期间的每1分钟触发
* "0 10,44 14 ? 3 WED" 每年三月的星期三的下午2:10和2:44触发
* "0 15 10 ? * MON-FRI" 周一至周五的上午10:15触发
* "0 15 10 15 * ?" 每月15日上午10:15触发
* "0 15 10 L * ?" 每月最后一日的上午10:15触发
* "0 15 10 ? * 6L" 每月的最后一个星期五上午10:15触发
* "0 15 10 ? * 6L 2002-2005" 2002年至2005年的每月的最后一个星期五上午10:15触发
* "0 15 10 ? * 6#3" 每月的第三个星期五上午10:15触发
* 0 6 * * * 每天早上6点
* 0 */2 * * * 每两个小时
* 0 23-7/2，8 * * * 晚上11点到早上8点之间每两个小时，早上八点
* 0 11 4 * 1-3 每个月的4号和每个礼拜的礼拜一到礼拜三的早上11点
* 0 4 1 1 * 1月1日早上4点
