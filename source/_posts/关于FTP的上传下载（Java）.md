---
layout: w
title: 关于FTP的上传下载（Java）
date: 2017-05-27 11:47:41
tags:
  - Java
  - FTP
categories:
  - Java
---
最近，在做一个账单文件的业务，遇到了一些问题，几经周折，终于把功能业务完善，希望对大家有所帮助！

#### 问题1
调用某接口，接收一个文件，文件的传输形式为返回报文中的一个字段，字段值为文件内容，需要Base64解码，读取文件需要将这个文件内容字符串转化为zip读取？
##### String转化Zip文件
```
String STR="";
InputStream DateByte = new ByteArrayInputStream(SecurityUtil.Base64Decode(STR));//把获取的zip文件的byte放入输入流
File targetFile = new File("F:\\XX.zip"); 
targetFile.createNewFile(); //创建文件
OutputStream outStream = new FileOutputStream(targetFile); 
byte[] by = new byte[1024]; 
while (DateByte.available() > 0) 
{ 
	DateByte.read(by); //读取接收的文件流
	outStream.write(by); //写入文件
} 
DateByte.close(); 
outStream.flush(); 
outStream.close();
```
##### 解码为专用解码，如果转成的文件不对要看看解码的方式对不对

#### 问题2
需要把文件上传至FTP，但是zip文件为二进制文件，需要做二进制传输方式的设置？
##### FTP上传和下载（二进制形式）
```
    
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import org.apache.commons.net.ftp.FTPClient;
import org.apache.commons.net.ftp.FTPFile;
import org.apache.commons.net.ftp.FTPReply;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ftpUtil {
	private static final Logger logger = LoggerFactory.getLogger(ftpUtil.class);
	/** 
	02. * Description: 从FTP服务器下载文件 
	04. * @param url FTP服务器hostname 
	05. * @param port FTP服务器端口 
	06. * @param username FTP登录账号 
	07. * @param password FTP登录密码 
	08. * @param remotePath FTP服务器上的相对路径 
	09. * @param fileName 要下载的文件名 
	10. * @param localPath 下载后保存到本地的路径 
	11. * @return 
	12. */  
	public static boolean downFile(String url, int port, String username,
			String password, String remotePath, String fileName,
			String localPath) {
		boolean success = false;
		FTPClient ftp = new FTPClient();
		try {
			int reply;
			ftp.connect(url, port);
			// 如果采用默认端口，可以使用ftp.connect(url)的方式直接连接FTP服务器
			ftp.login(username, password);// 登录
			ftp.setFileType(FTPClient.BINARY_FILE_TYPE);//文件类型		
			reply = ftp.getReplyCode();
			if (!FTPReply.isPositiveCompletion(reply)) {
				ftp.disconnect();
				return success;
			}
			ftp.changeWorkingDirectory(remotePath);// 转移到FTP服务器目录
			ftp.enterLocalPassiveMode();
			 
			FTPFile[] fs = ftp.listFiles();
			for (FTPFile ff : fs) {
				if (ff.getName().equals(fileName)) {
					File localFile = new File(localPath + ff.getName());
					OutputStream is = new FileOutputStream(localFile);
					ftp.retrieveFile(ff.getName(), is);
					is.close();
					break;
				}
			}

			ftp.logout();
			success = true;
		} catch (IOException e) {
			logger.error(e.getMessage());
			e.printStackTrace();
		} finally {
			if (ftp.isConnected()) {
				try {
					ftp.disconnect();
				} catch (IOException ioe) {
				}
			}
		}
		return success;
	}

	/**
	 * Description: 向FTP服务器上传文件
	 * 
	 * @Version1.0 Jul 27, 2008 4:31:09 PM by  创建
	 * @param url
	 *            FTP服务器hostname
	 * @param port
	 *            FTP服务器端口
	 * @param username
	 *            FTP登录账号
	 * @param password
	 *            FTP登录密码
	 * @param path
	 *            FTP服务器保存目录
	 * @param filename
	 *            上传到FTP服务器上的文件名
	 * @param input
	 *            输入流
	 * @return 成功返回true，否则返回false
	 */
	public static boolean uploadFile(String url, int port, String username,
			String password, String path, String filename, InputStream input) {
		boolean success = false;
		FTPClient ftp = new FTPClient();
		try {
			int reply;
			ftp.connect(url, port);// 连接FTP服务器
			// 如果采用默认端口，可以使用ftp.connect(url)的方式直接连接FTP服务器
			ftp.login(username, password);// 登录
			reply = ftp.getReplyCode();
			if (!FTPReply.isPositiveCompletion(reply)) {
				ftp.disconnect();
				return success;
			}
			ftp.setFileType(FTPClient.BINARY_FILE_TYPE);
			ftp.changeWorkingDirectory(path);
			ftp.enterLocalPassiveMode();
			ftp.storeFile(filename, input);

			input.close();
			ftp.logout();
			success = true;
		} catch (IOException e) {
			logger.error(e.getMessage());
			e.printStackTrace();
		} finally {
			if (ftp.isConnected()) {
				try {
					ftp.disconnect();
				} catch (IOException ioe) {
				}
			}
		}
		return success;
	}
}

```

##### 注意：二进制不仅代码中要设置，对应的FTP服务器也需要设置对应的传输方式
##### 二进制设置
```
	ftp.setFileType(FTPClient.BINARY_FILE_TYPE);
```
