---
title: hexo simpleblock解决首页无法显示摘要的问题
date: 2017-04-06 11:33:21
tags:
  - Hexo
  - Simpleblock
categories:
  - Hexo
---

博主在使用simpleblock的时候，发现首页和其他的一些地方显示的文章分页中，文章都是全部显示的，这样很影响首页的展示效果，并且不便于读者浏览博客的所有文章，因此我需要写一个摘要来解决这些问题。

摘要的原理则是利用标签内部的文字做为摘要，把生成后的这些截取下来作为整个文章的摘要显示。
#### 主题方案和想法
博主用的是simpleblock的主题方案，尽管还不完善，但是却是我喜欢的，不完善的可以自己去完善，这样才能达到自己想要的目的。
#### helper.js
```
hexo.extend.helper.register('page_excerpt', function(post) {
  var p = post ? post : this.page;
  var excerpt = p.excerpt;
  if (!excerpt) {
    var pos = p.content.indexOf('</p>');
    if (pos > 0){
      excerpt = p.content.substring(0, pos + 4);
    }
  }
  return excerpt;
});
```
#### index.jade
```
    if is_home()
      .markdown-body!= page_excerpt(post)
    else if is_archive()
      .markdown-body!= page_excerpt(post)
    else if is_year()
      .markdown-body!= page_excerpt(post)
    else if is_month()
      .markdown-body!= page_excerpt(post)
    else if is_category()
      .markdown-body!= page_excerpt(post)
    else if is_tag()
      .markdown-body!= page_excerpt(post)
    else 
      .markdown-body!= post.content
```
#### 赘述
注册hexo摘要获取方法，首页显示的时候取第一个p标签的内容做为摘要
#### 自定义hexo主题
如果对自定义hexo主题有兴趣的话，参考博客--[Hexo高级教程之主题开发](http://blog.csdn.net/melordljm/article/details/51985129)!
