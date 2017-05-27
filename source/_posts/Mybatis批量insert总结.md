---
title: Mybatis批量insert总结
date: 2017-05-27 13:51:47
tags:
  - Java
  - Mybatis
categories:
  - Mybatis
---
Mybatis的强大和方便，不用多说，原生的SQL编码可以让程序员几乎不用学习新的语法和模式，同时简化了大量的代码；同样批量处理的insert也是要靠原生的sql打出一片天地。
#### 方法一
```
<insert id="addBatchUser" parameterType="java.util.List" >
    <foreach collection="list" item="item" index="index" separator=";">
        insert into user(name,age) values(#{item.name},#{item.age})
    </foreach>
</insert>
```
#### 方法二
```
<insert id="addBatchUser" parameterType="java.util.List" >
insert into user(name,age) values
    <foreach collection="list" item="item" index="index" separator=",">
        (#{item.name},#{item.age})
    </foreach>
</insert>
```
###### 注意：Mybatis并没有做集合容量的验证，如果集合参数为空或者size为0则生成的sql可能只有"insert into user(name,age) values"这样一段或者没有，所以说，写批量sql的时候注意在调用批量方法的地方加入对容量的验证
###### 对Mybatis批量限制的一些想法，批量SQL使用事物提交，同时提交3万左右的数据量，并不会超出限制，因此感觉事物的提交，几万条数据或者更多都没有问题，只是处理时间会越来越长，同时提交3万左右的数据大概在3-4分钟左右，越多会越来越慢，越少则越来越快，如果数据量大的话，尽量考虑用分页的方式提交，分页的量，需要单独测试最合适的量，如果说3万数据量，1000条提交一次，处理的时间会远远小于一次提交的处理时间
##### foreach简介
对于foreach标签的解释参考了网上的资料，具体如下：
foreach的主要用在构建in条件中，它可以在SQL语句中进行迭代一个集合。
foreach元素的属性主要有 item，index，collection，open，separator，close。
item表示集合中每一个元素进行迭代时的别名，index指定一个名字，用于表示在迭代过程中，每次迭代到的位置，open表示该语句以什么开始，separator表示在每次进行迭代之间以什么符号作为分隔 符，close表示以什么结束，在使用foreach的时候最关键的也是最容易出错的就是collection属性，该属性是必须指定的，但是在不同情况 下，该属性的值是不一样的，主要有一下3种情况：
* 1.如果传入的是单参数且参数类型是一个List的时候，collection属性值为list
* 2.如果传入的是单参数且参数类型是一个array数组的时候，collection的属性值为array
* 3.如果传入的参数是多个的时候，我们就需要把它们封装成一个Map了，当然单参数也可以封装成map