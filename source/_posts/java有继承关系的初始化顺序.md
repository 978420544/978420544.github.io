---
title: java有继承关系的初始化顺序
date: 2017-04-06 18:41:36
tags:
  - Java
categories:
  - Java
---
由于Java 中的一切东西都是对象，所以许多活动 变得更加简单，这个问题便是其中的一例。正如下一章会讲到的那样，每个对象的代码都存在于独立的文件中。除非真的需要代码，否则那个文件是不会载入的。通常，我们可认为除非那个类的一个对象构造完毕，否则代码不会真的载入。由于static 方法存在一些细微的歧义，所以也能认为“类代码在首次使用的时候载入”。首次使用的地方也是static初始化发生的地方。装载的时候，所有static对象和static代码块都会按照本来的顺序初始化（亦即它们在类定义代码里写入的顺序）。当然，static 数据只会初始化一次。
####                ---《Thinking in Java 4》

简要的说就是，在类有继承关系时，类加载器上溯造型，进行相关类的加载工作。

#### 初始化循序

含有继承的类的初始化顺序：父类的静态变量->父类的静态块->子类静态变量->子类静态初始化块->父类变量->父类初始化块->父类的构造函数->子类的变量->子类初始化块->子类构造函数;(变量和初始化块之间的先后顺序根据类中的先后位置而定)。

#### Parent
```
public class Parent {
	
	private static String name =getName();
	
	private String width=getWidth();
	
	static {
		System.out.println("父类-----"+"静态代码块");
	}
	{
		System.out.println("父类-----"+"非静态代码块");
	}
	public Parent(){
		System.out.println("父类-----"+"构造方法");
	}
	
	private static String getName(){
		System.out.println("父类-----"+"静态成员变量");
		return "mjy";
	}
	
	private String getWidth(){
		System.out.println("父类-----"+"非静态成员变量");
		return "mjy";
	}

}
```

#### Son
```
public class Son extends Parent {
	
	private static String age =getAge();
	
	private String height=getHeight();
	
	static {
		System.out.println("子类-----"+"静态代码块");
	}
	{
		System.out.println("子类-----"+"非静态代码块");
	}
	public Son(){
		System.out.println("子类-----"+"构造方法");
	}
	
	private static String getAge(){
		System.out.println("子类-----"+"静态成员变量");
		return "12";
	}
	
	private String getHeight(){
		System.out.println("子类-----"+"非静态成员变量");
		return "12";
	}
	

}
```

#### Program
```
public class Program {
	public static void main(String[] args) {
		Son son = new Son();
	}
}
```

#### Console
```
父类-----静态成员变量
父类-----静态代码块
子类-----静态成员变量
子类-----静态代码块
父类-----非静态成员变量
父类-----非静态代码块
父类-----构造方法
子类-----非静态成员变量
子类-----非静态代码块
子类-----构造方法
```



