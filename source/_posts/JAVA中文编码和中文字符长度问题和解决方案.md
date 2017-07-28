---
layout: w
title: JAVA中文编码和中文字符长度问题和解决方案
date: 2017-07-28 10:38:26
tags:
  - Java
categories:
  - Java
---

[【转】JAVA中文编码和中文字符长度问题和解决方案](http://blog.csdn.net/u012506661/article/details/52752541)

本文说明了Java对中文问题产生的原因，并给出了对中文问题的解决方案。同时引发出了对中英文混和的字符串的长度问题，并且给出解决方案的实现。

### 1.Java中文问题的产生

Java为了对全球的常用文字编码系统进行处理，采用了Unicode字符编码集。Unicode字符编码集是一种重要的交互和显示的通用字符编码标准，常见的有UTF-8、UTF-16、UCS-2、UCS-4等。国际标准组织为中文、日文和韩文字符（即CJK大字符集）对应的数据区间主要是4E00-9FFF，每一个字符对应惟一的一个编码。例如，“中文”这两个字对应的Unicode码分别是：0x4E2D、0x6587。下面这段代码System.out.println((char)0x4E2D + "" + (char)0x6587 ) ;就可以打印出“中文”来。我们通常使用的字符编码是一种双字节字符集（DBCS）。它与Unicode的编码机制有很大差别。Java语言的中文处理问题一般就是，如何将DBCS编码的字节串相互转换为正确的Unicode编码的字符串。所有中文问题的出现都是因为字节串没有被正确转换所至。中文问题的出现一般都是在几种不同语言的操作系统中交互信息的时候出现的。

### 2.Java中文问题解决方案

首先，请确保你的JDK的版本是稳定的新版本，这是正确处理Java中文问题的前提条件。

#### 2.1其他内码和Unicode码之间的转换

解决问题的根源在于正确的处理各种内码和Unicode码进行相互转换。Java的String类提供了转换方法，具体用法是new String( byte[] , encoding ) ，即为用指定的字符编码方式转换指定的字节数组生成一个新的String。
比如：String abc = new String ( "hi...中文".getBytes( "GB2312" ) , "GB2312" ) ;
其中，"hi...中文".getBytes( "GB2312" )是按照GB2312的字符编码方式把该 String 转换成字节数组。然后再按照GB2312的方式生成一个abc的String对象。

#### 2.2让JDK用你指定的编码方式编译程序

在用javac编译程序时，编译器会用系统的默认编码来编译Java程序。用如下命令编译javac -encoding GB2312 Xxx.java，则是指定用GB2312的编码来进行编译。

#### 2.3JDBC中的中文问题

JDBC（Java DataBase Connectivity）是Java程序访问数据库的一个统一的接口。JDBC在网络传输过程中，大多数会采用本地编码格式来传输中文字符，例如中文字符“0x4175”会被转成“0x41”和“0x75”进行传输。因此需要对 JDBC返回的字符以及要发给JDBC的字符进行转换。当用JDBC向数据库中插入数据和查询数据时，则需要作编码转换。所以当应用程序访问数据时，在入口和出口处都要作编码转换。对于中文数据，数据库字符编码的设置应当保证数据的完整性，比如GB2312、GBK、UTF-8 等都是可选的数据库编码。
比如：转换成UTF-8进行传输
sqlstr1 = new String(sqlstr1.getBytes("GB2312")," "UTF-8");
转换成GB2312码进行显示
sqlstr2 = new String(sqlstr2.getBytes("UTF-8"),"GB2312");

### 3.Java中文编码失败情况说明

如果出现编码失败，在显示时会出现两种结果：“?”或者“□”。“?”表示转码错误；“□”表示转码失败。如果出现“?”，只有追本溯源查找问题所在才能解决问题；如果出现“□”，则表示可以在此基础上进一步进行转码操作直到成功。

### 4.Java中文编码带来的字符串长度问题

Java的中文问题处理系统除了在显示方面会出现问题外，还会对包含中文字符的字符串的长度的判断带来一定的问题。在C语言中，一个中文字符是2个字节，而在Java程序中，中文字符的长度是根据编码不同而不同的。下面的程序就可以看出问题所在。
测试程序如下，测试字符串为“中文abc”，测试平台为中文Win XP sp2。
public class ChineseCharacterTest
{
    public static void main( String [] args ) throws Exception
    {
        //按iso8859-1编码
        String iso = new String( "中文abc".getBytes( "GB2312" ) , "ISO8859-1" );
        //按GB2312编码
        String gb = new String( iso.getBytes( "ISO8859-1" ) , "gb2312" ) ;
        //按utf-8编码
        String utf_8 = new String( iso.getBytes( "ISO8859-1" ) , "UTF-8" ) ;
//下面分别打印出编码后的字符串和长度
        System.out.println( "iso is :" + iso + ", the length is:" + iso.length() ) ;
        System.out.println( "gb is :" + gb + ", the length is :" + gb.length() ) ;
        System.out.println( "utf-8 is:" + utf_8 + ", the length is :" + utf_8.length() ) ;
    }
}
用GB2312编码进行编译程序，其运行结果是：
iso is :????????abc, the length is:7
gb is :中文abc, the length is :5
utf-8 is:????????abc, the length is :7
可以看出，在ISO8859-1和UTF-8中一个中文字符按照2个长度单位处理，在GB编码中一个中文字符按照1个长度单位处理。这样在进行字符截取时就要相当注意这个问题。如果在ISO8859-1或UTF-8中一不小心将中文截去半个，将会出现致命的错误。

### 5.中文字符长度问题的解决方案

#### 5.1为了更好的解决中文字符的长度，我们设计并实现了下面的方法。基本思想是根据中文编码的编码区间，判断字符是否为中文字符，然后再作进一步的处理。

程序如下：

```
    public static int getChineseLength( String name , String endcoding )
            throws Exception{
        int len = 0 ; //定义返回的字符串长度
        int j = 0 ;
        //按照指定编码得到byte[]
        byte [] b_name = name.getBytes( endcoding ) ;
        while ( true ){
            short tmpst = (short) ( b_name[ j ] & 0xF0 ) ;
            if ( tmpst >= 0xB0 ){
                if ( tmpst < 0xC0 ){
                    j += 2 ;
                    len += 2 ;
                }
                else if ( ( tmpst == 0xC0 ) || ( tmpst == 0xD0 ) ){
                    j += 2 ;
                    len += 2 ;
                }
                else if ( tmpst == 0xE0 ){
                    j += 3 ;
                    len += 2 ;
                }
                else if ( tmpst == 0xF0 ){
                    short tmpst0 = (short) ( ( (short) b_name[ j ] ) & 0x0F ) ;
                    if ( tmpst0 == 0 ){
                        j += 4 ;
                        len += 2 ;
                    }
                    else if ( ( tmpst0 > 0 ) && ( tmpst0 < 12 ) ){
                        j += 5 ;
                        len += 2 ;
                    }
                    else if ( tmpst0 > 11 ){
                        j += 6 ;
                        len += 2 ;
                    }
                }
            }
            else{
                j += 1 ;
                len += 1 ;
            }
            if ( j > b_name.length - 1 ){
                break ;
            }
        }
        return len ;
    }
```

#### 5.2 使用GBK编码解决

中文字符在Java中默认使用Unicode编码为一个字节，使用GBK编码则为两个字节，因此转出的Byte数组的长度和真是的中文格式的字符长度一致（包含中文特殊字符）


```
messageBody.getBytes("GBK").length //中文字符长度都是两个字节
```
