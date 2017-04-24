---
title: Map浅复制及深复制思考
date: 2017-04-07 11:50:00
tags:
  - Java
categories:
  - Java
---
文章主要介绍关于深复制和浅复制的原理和不同，然后引出Map浅复制和深复制的用法。
#### 浅复制与深复制概念
* 浅复制： 浅层复制仅仅复制所考虑的对象，而不复制它所引用的对象。
* 深复制：深层复制要复制的对象引用的对象都复制一遍。


#### 通用点
实现Cloneable接口，实现clone方法
#### 浅复制
```
@Override
protected Object clone(){
    Object o = null;
    try {
        o = super.clone();
    } catch (CloneNotSupportedException e) {
        e.printStackTrace();
    }
    return o;
}
```
#### 深复制
##### 实现接口Cloneable,Serializable
```
public Object deepClone()throws Exception{
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    ObjectOutputStream oos = new ObjectOutputStream(baos);
    oos.writeObject(this);
    //从流里读出来
    ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());
    ObjectInputStream oi=new ObjectInputStream(bais);
    return(oi.readObject());
}
```
#### 浅复制与深复制区别
浅复制不能复制对象包含的引用对象，深复制则是所有的对象都会进行复制
#### Map的引用
Map的引用改变其中一个将改变另一个Map的内容
```
Map map=new HashMap<String,Object>();
Map map2=map;
map2.put("name","mjy");
```
#### Map的浅复制
```
Map map=new HashMap<String,Object>();
Map map2=new HashMap<String,Object>();
map2.putAll(map);
map2.put("name","mjy");
```
#### Map的深复制
```
public static <T extends Serializable> T clone(T obj){
    T clonedObj = null;
    try {
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    ObjectOutputStream oos = new ObjectOutputStream(baos);
    oos.writeObject(obj);
    oos.close();
    
    ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());
    ObjectInputStream ois = new ObjectInputStream(bais);
    clonedObj = (T) ois.readObject();
    ois.close();
    
    }catch (Exception e){
    e.printStackTrace();
}
```

