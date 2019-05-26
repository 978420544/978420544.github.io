---
title: Java 动态代理 InvocationHandler
date: 2019-05-26 19:21:40
tags:
  - Java
  - Proxy
  - 反射
categories:
  - Java
---
Java动态代理机制中的核心类InvocationHandler和Proxy，是实现动态代理的核心。

#### 1. InvocationHandler
##### 实现代理机制中处理代理调用处理程序，每一个通过代理生成的对象都会被加入这个接口实现的调用处理程序；实际上就是经过指定的InvocationHandler实现类生成的实例都会调用实现的invoke方法执行代理其他步骤的公共处理逻辑
```
  /**
    * proxy:代理类代理的真实代理对象com.sun.proxy.$Proxy0
    * method:我们所要调用某个对象真实的方法的Method对象
    * args:指代代理对象方法传递的参数
    */
    public Object invoke(Object proxy, Method method, Object[] args)
        throws Throwable;
```

### 2. Proxy
##### 是用来提供创建代理过的对象的实例的类，其中最常用的是newProxyInstance
```
public static Object newProxyInstance(ClassLoader loader, 
                                            Class<?>[] interfaces, 
                                            InvocationHandler h)
```

* loader：一个classloader对象，定义了由哪个classloader对象对生成的代理类进行加载
* interfaces：一个interface对象数组，表示我们将要给我们的代理对象提供一组什么样的接口，如果我们提供了这样一个接口对象数组，那么也就是声明了代理类实现了这些接口，代理类就可以调用接口中声明的所有方法。
* h：一个InvocationHandler对象，表示的是当动态代理对象调用方法的时候会关联到哪一个InvocationHandler对象上，并最终由其调用。
* getInvocationHandler：返回指定代理实例的调用处理程序
* getProxyClass：给定类加载器和接口数组的代理类的java.lang.Class对象。
* isProxyClass：当且仅当使用getProxyClass方法或newProxyInstance方法将指定的类动态生成为代理类时，才返回true。
* newProxyInstance：返回指定接口的代理类的实例，该接口将方法调用分派给指定的调用处理程序
