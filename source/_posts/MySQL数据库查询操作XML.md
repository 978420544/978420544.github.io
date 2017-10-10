---
title: MySQL数据库查询操作XML
date: 2017-10-10 16:03:46
tags:
  - Xml
categories:
  - MYSQL
---

MySQL里面有内置的操作xml的函数,分别是ExtractValue()和UpdateXML()函数。

### 函数语法

#### EXTRACTVALUE (fiedname, XPathstring); 

第一个参数：fiedname是String格式，为表中的字段名第二个参数：XPathstring ([Xpath格式的字符串](http://www.w3school.com.cn/xpath/xpath_nodes.asp)) ，作用：从目标XML中返回包含所查询值的字符串

#### UPDATEXML (fiedname, XPathstring,new_value)

第一个参数：fiedname是String格式，为表中的字段名第二个参数：XPathstring (Xpath格式的字符串)
第三个参数：new_value，String格式，替换查找到的符合条件的数据 作用：改变文档中符合条件的节点的值。

#### 示例如下

```
1. extractvalue(testxml,'/Student/Class/Name[self:text()="zhangsan"]'

2. extractvalue(testxml,'/Student/Class/Name')='zhangsan'

3. extractvalue(testxml,'/*/*/Name')='zhangsan'
```



方法作用如下：
1和2 找出Student节点下Class节点下的Name节点内容等于"zhangsan"的数据
3 找出所有的第三级节点Name等于"zhangsan"的数据

```
Updatexml(testxml,'/Student/Class/Name[self:text()="zhangsan"]','<Name>updatename</Name>')
```

方法作用如下：替换对应符合条件数据节点的内容，注意替换的字符串要将对应的节点拼接进字符串中

