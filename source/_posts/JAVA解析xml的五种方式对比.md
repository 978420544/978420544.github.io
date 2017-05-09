---
title: JAVA解析xml的五种方式对比
date: 2017-05-09 15:34:05
tags:
  - Java
  - Xml
categories:
  - Java
---
本篇文章主要对比Java即系xml的五种方式，这五种方式各有利弊，大家可以看情况采用哪一种。

### 1. DOM解析
DOM是html和xml的应用程序接口(API)，以层次结构（类似于树型）来组织节点和信息片段，映射XML文档的结构，允许获取和操作文档的任意部分，是W3C的官方标准
#### 优点
①允许应用程序对数据和结构做出更改。

②访问是双向的，可以在任何时候在树中上下导航，获取和操作任意部分的数据。
#### 缺点
①通常需要加载整个XML文档来构造层次结构，消耗资源大。
### 2. SAX(Simple API for XML)解析
流模型中的"推"模型分析方式。通过事件驱动，每发现一个节点就引发一个事件，事件推给事件处理器，通过回调方法完成解析工作，解析XML文档的逻辑需要应用程序完成

#### 优点
①不需要等待所有数据都被处理，分析就能立即开始。

②只在读取数据时检查数据，不需要保存在内存中。

③可以在某个条件得到满足时停止解析，不必解析整个文档。

④效率和性能较高，能解析大于系统内存的文档。
#### 缺点
①需要应用程序自己负责TAG的处理逻辑（例如维护父/子关系等），文档越复杂程序就越复杂。

②单向导航，无法定位文档层次，很难同时访问同一文档的不同部分数据，不支持XPath。

#### 原理
简单的说就是对文档进行顺序扫描，当扫描到文档(document)开始与结束、元素(element)开始与结束时通知事件处理函数(回调函数)，进行相应处理，直到文档结束

### 3. JDOM(Java-based Document Object Model)
Java特定的文档对象模型，自身不包含解析器，使用SAX

#### 优点
①使用具体类而不是接口，简化了DOM的API。

②大量使用了Java集合类，方便了Java开发人员。
#### 缺点
①没有较好的灵活性。

②性能较差。

### 4. DOM4J(Document Object Model for Java)
简单易用，采用Java集合框架，并完全支持DOM、SAX和JAXP

#### 优点
①大量使用了Java集合类，方便Java开发人员，同时提供一些提高性能的替代方法。

②支持XPath。

③有很好的性能。
#### 缺点
①大量使用了接口，API较为复杂。


### 5. StAX(Streaming API for XML)
流模型中的拉模型分析方式，提供基于指针和基于迭代器两种方式的支持,JDK1.6特性

StAX API的实现是使用了Java Web服务开发（JWSDP）1.6，并结合了Sun Java流式XML分析器(SJSXP)-它位于javax.xml.stream包中。XMLStreamReader接口用于分析一个XML文档，而XMLStreamWriter接口用于生成一个XML文档。XMLEventReader负责使用一个对象事件迭代子分析XML事件-这与XMLStreamReader所使用的光标机制形成对照。

#### 和推式解析相比的优点
①在拉式解析中，事件是由解析应用产生的，因此拉式解析中向客户端提供的是解析规则，而不是解析器。

②同推式解析相比，拉式解析的代码更简单，而且不用那么多库。

③拉式解析客户端能够一次读取多个XML文件。

④拉式解析允许你过滤XML文件和跳过解析事件。

### DOM4J的Java-Object2Xml互相转化实例
#### Object2Xml
```
/**  
     * DMO4J写入XML  
     * @param obj        泛型对象  
     * @param entityPropertys 泛型对象的List集合  
     * @param Encode     XML自定义编码类型(推荐使用GBK)  
     * @param XMLPathAndName    XML文件的路径及文件名  
     */  
    public void writeXmlDocument(T obj, List<T> entityPropertys, String Encode,   
            String XMLPathAndName) {   
        long lasting = System.currentTimeMillis();//效率检测   
  
        try {   
            XMLWriter writer = null;// 声明写XML的对象    
            OutputFormat format = OutputFormat.createPrettyPrint();   
            format.setEncoding(Encode);// 设置XML文件的编码格式   
  
            String filePath = XMLPathAndName;//获得文件地址   
            File file = new File(filePath);//获得文件     
  
            if (file.exists()) {   
                file.delete();   
  
            }   
            // 新建student.xml文件并新增内容   
            Document document = DocumentHelper.createDocument();   
            String rootname = obj.getClass().getSimpleName();//获得类名   
            Element root = document.addElement(rootname + "s");//添加根节点   
            Field[] properties = obj.getClass().getDeclaredFields();//获得实体类的所有属性   
            
            for (T t : entityPropertys) {                                //递归实体   
                Element secondRoot = root.addElement(rootname);            //二级节点   
                
                for (int i = 0; i < properties.length; i++) {                      
                    //反射get方法       
                    Method meth = t.getClass().getMethod(                      
                            "get"  
                                    + properties[i].getName().substring(0, 1)   
                                            .toUpperCase()   
                                    + properties[i].getName().substring(1));   
                    //为二级节点添加属性，属性值为对应属性的值   
                    secondRoot.addElement(properties[i].getName()).setText(   
                            meth.invoke(t).toString());   
  
                }   
            }   
            //生成XML文件   
            writer = new XMLWriter(new FileWriter(file), format);   
            writer.write(document);   
            writer.close();   
            long lasting2 = System.currentTimeMillis();   
            System.out.println("写入XML文件结束,用时"+(lasting2 - lasting)+"ms");   
        } catch (Exception e) {   
            System.out.println("XML文件写入失败");   
        }   
  
    }  
```
#### Xml2Object
```
/**  
 *   
 * @param XMLPathAndName XML文件的路径和地址  
 * @param t     泛型对象  
 * @return  
 */  
       
  
    @SuppressWarnings("unchecked")   
    public List<T> readXML(String XMLPathAndName, T t) {   
        long lasting = System.currentTimeMillis();//效率检测   
        List<T> list = new ArrayList<T>();//创建list集合   
        try {   
            File f = new File(XMLPathAndName);//读取文件   
            SAXReader reader = new SAXReader();   
            Document doc = reader.read(f);//dom4j读取   
            Element root = doc.getRootElement();//获得根节点   
            Element foo;//二级节点   
            Field[] properties = t.getClass().getDeclaredFields();//获得实例的属性   
            //实例的get方法   
            Method getmeth;   
            //实例的set方法   
            Method setmeth;   
               
            for (Iterator i = root.elementIterator(t.getClass().getSimpleName()); i.hasNext();) {//遍历t.getClass().getSimpleName()节点   
                foo = (Element) i.next();//下一个二级节点   
                   
               t=(T)t.getClass().newInstance();//获得对象的新的实例   
  
               for (int j = 0; j < properties.length; j++) {//遍历所有孙子节点   
                       
  
                    //实例的set方法   
                      setmeth = t.getClass().getMethod(   
                            "set"  
                                    + properties[j].getName().substring(0, 1)   
                                            .toUpperCase()   
                                    + properties[j].getName().substring(1),properties[j].getType());   
                  //properties[j].getType()为set方法入口参数的参数类型(Class类型)   
                    setmeth.invoke(t, foo.elementText(properties[j].getName()));//将对应节点的值存入   
                    
           
                }   
       
                   
                list.add(t);   
            }   
        } catch (Exception e) {   
            e.printStackTrace();   
        }   
        long lasting2 = System.currentTimeMillis();   
        System.out.println("读取XML文件结束,用时"+(lasting2 - lasting)+"ms");   
        return list;   
    }  
```
