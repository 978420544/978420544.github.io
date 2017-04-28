---
title: 多线程Worker设计模式
date: 2017-03-29 17:37:14
tags:
  - Java
  - 多线程
categories:
  - Java
---
关于Worker设计模式文章的撰写，博主是仔细实验了阿里中间件博客的一片文章—— [Java Worker 设计模式](http://jm.taobao.org/2012/09/20/java-worker-design/)，这篇文章主要讲了Worker设计模式的三种更为便捷的设计方法：简单的Worker设计模式，多级优先级队列流水线模式，Map2Reduce流水线模式。不过博主将在本篇文章中分享一下自己的理解，和自己的一些应用。

***
### 简单的Worker模式--Master2Worker模式
    
Master2Worker模式是比较常见的并行多线程模式之一。系统主要由两类进程协同工作即Master进程和Worker进程，Master进程负责接收外部的任务和分配任务，管理Woker队列和任务队列，Worker负责处理子任务，包含具体的任务逻辑，Worker完成后将结果返回给Master，有Master分支汇总返回给具体的调用端，处理流程如下所示：
<center>![Master2Worker](/images/process.png)</center>

#### 基于Idea的类图如下
<center>![Master2Worker](/images/Master2Worker.png)</center>

#### Master
```java
package com.demo.master2worker;

import java.util.HashMap;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

public class Master {
	// 任务队列
	protected Queue<Object> workQueue = new ConcurrentLinkedQueue<Object>();
	// Worker进程队列
	protected Map<String, Thread> threadMap = new HashMap<String, Thread>();
	// 子任务处理结果集
	protected Map<String, Object> resultMap = new ConcurrentHashMap<String, Object>();

	public Master(Worker worker, int countWorker) {
		worker.setWorkQueue(workQueue);
		worker.setResultMap(resultMap);
		for (int i = 0; i < countWorker; i++) {
			threadMap.put(Integer.toString(i), new Thread(worker, Integer.toString(i)));
		}
	}

	// 是否所有的子任务都介绍了
	public boolean isComplete() {
		for (Map.Entry<String, Thread> entry : threadMap.entrySet()) {
			if (entry.getValue().getState() != Thread.State.TERMINATED)
				// 存在为完成的线程
				return false;
		}
		return true;
	}

	// 提交一个子任务
	public void submit(Object job) {
		workQueue.add(job);
	}

	// 返回子任务结果集
	public Map<String, Object> getResultMap() {
		return resultMap;
	}

	// 执行所有Worker进程，进行处理
	public void execute() {
		for (Map.Entry<String, Thread> entry : threadMap.entrySet()) {
			entry.getValue().start();
		}
	}
}
```

#### Worker
```java
import java.util.Map;
import java.util.Queue;

public class Worker implements Runnable {
	// 任务队列
	protected Queue<Object> workQueue;
	// 子任务处理结果集
	protected Map<String, Object> resultMap;

	public void setWorkQueue(Queue<Object> workQueue) {
		this.workQueue = workQueue;
	}

	public void setResultMap(Map<String, Object> resultMap) {
		this.resultMap = resultMap;
	}

	// 子任务处理的逻辑，在这里不作具体实现，由子类实现
	public Object handle(Object input) {
		return input;
	}

	@Override
	public void run() {
		while (true) {
			// 获取子任务
			Object input = workQueue.poll();
			if (input == null)
				break;
			// 处理子任务
			Object re = handle(input);
			// 将处理结果写入结果集
			resultMap.put(Integer.toString(input.hashCode()), re);
		}
	}
}
```

#### PlusWorker
```java
public class PlusWorker extends Worker { // 求立方和
	@Override
	public Object handle(Object input) {
		int i = (Integer) input;
		return i * i * i;
	}
}
```

#### Application
```java
import java.util.Map;
import java.util.Set;

public class Application {
	public static void main(String[] args) {
		// 固定使用4个Workde
		Master master = new Master(new PlusWorker(), 4);
		for (int i = 1; i <= 100; i++)
			// 提交100个子任务
			master.submit(i);
		master.execute(); // 开始计算

		Map<String, Object> resultMap = master.getResultMap();

		int re = 0; // 最终计算结果保存在此
		// 不需要等待所有Worker都执行完即可
		while (true) {
			Set<String> keys = resultMap.keySet(); // 开始计算最终结果
			String key = null;
			for (String k : keys) {
				key = k;
				break;
			}
			Integer i = null;
			if (key != null)
				i = (Integer) resultMap.get(key);
			if (i != null)
				re += i; // 最终结果
			if (key != null)
				resultMap.remove(key); // 移除已被计算过的项目
			if (master.isComplete() && resultMap.size() == 0)
				break;
		}
		System.out.println(re);
	}
}
```

#### 流程描述
Application，初始化Master进程，通过构造函数绑定Worker的具体实现，作为客户端提交100个任务到Master进程，然后开始执行Master进程。
Master进程将任务都加入workerQuene，然后将workerQuene交给Worker实例，然后将Worker实例加入到设置的所有线程中，execute之后开始Start线程，所有的实例都是用同一个队列poll新的任务进行计算，然后将任务添加到resultMap中，并且一个线程并不需要等待其他任务的完成即可进行下一个任务。
Application,通过一个循环读取计算结果，读取完之后，删除读取过的结果，直至所有的任务完成，并且读取完所有的计算结果，并进程计算。

***
### 多级优先级队列流水线模式
#### BlockingQueue 阻塞队列
BlockingQueue是一个阻塞的队列，当队列满时，会阻塞程序运行，直至有空余的位置等待添加。
#### PriorityQueue 优先级队列
Java util包中的PriorityQueue类用来表示优先队列。优先队列是一个以集合为基础的抽象数据类型，队列中的每个元素都有一个优先级值。优先级值用来表示该元素的出列的优先级。
#### 流水线模式
就像生产车间上的流水线工人一样，将任务切分成几个小块，每个worker负责自己的一部分，以提高整体的生产、产出效率。
假设完成任务 t 需要的时间为：W(t)=n，那么将任务分解成m份，流水线式的执行，每小份需要的时间便为 W(t/m)=n/m，那么执行1000条任务的时间，单个为1000n，流水线长度为L，则用这种方式所用的时间为(1000-1)(m-L+1)n/m+n
其中L<m，由此可见，流水线的worker越多、任务越细分，工作的效率将越高。这种主方式的问题在于，如果一个worker出现问题，那么整个流水线就将停止工作。而且任务的优先级不能动态调用，必须事先告知。
#### 多级反馈队列
这是一个有Q1、Q2…Qn个多重流水线方式，从高到低分别代码不同的优先级，高优先级的worker要多于低优先级的，一般是2的倍数，即Q4有16个worker、Q3有8个，后面类推。任务根据预先估计好的优先级进入，如果任务在某步的执行过长，直接踢到下一级，让出最快的资源。
显然这种方式的好处就在于可以动态地调整任务的优级，及时做出反应。当然，为了实现更好的高度，我们可以在低级里增加一个阀值，使得放偶然放入低级的task可以有复活的机会。
#### 模式简介
此模式由ConfigurableWorker做任务队列和Worker的管理，抽象的任务WorkerTask，任务处理逻辑TaskProcesor，监听器WorkerListener组成，优先级队列请实现对应的Comparable接口。

ConfigurableWorker管理任务队列和Worker的生命周期，然后生成对应的处理逻辑，监听器监听任务的完成情况，反馈给ConfigurableWorker。下面仅贴出抽象的代码，具体的实现逻辑祥见 [JavaWorker](https://github.com/sefler1987/javaworker)。

#### 基于Idea的类图如下

<center>![Master2Worker](/images/priorityQueue.png)</center>

##### 针对类图的详述
ConfigurableWorker：要实现自我生命周期管理，需要实现Runable，这样其才能以单独的线程运行，使用daemon线程的方式运行。
worker里面还包括几个其它成员：taskQueue，一个阻塞性质的queue，一般BlockingArrayList就可以了，这样任务是FIFO（先进先出）的，如果要考虑任务的优先级，则可以考虑使用PriorityBlockingQueue；
listeners，根据事件进行划分的事件监听者，以便于当一个任务完成的时候进行处理，需要注意的是，为了较高效地进行listener遍历，这里我推荐使用CopyOnWriteArrayList，免得每次都复制。
WorkerTask：实际上这是一个抽象的工内容，其包括基本的id与，task的ID是Worker生成的，相当于递wtte后的一个执回，当数据执行完了的时候需要使用这个id来取结果。而后面真正实现的实体task则包含任务处理时需要的数据。
Processor：实现处理加工传入的task数据，加工完成后触发fireEvent（WorkerEvent.TASK_COMPLETE）事件，之后通过Future的get即可得到最终的数据。
通过ConfigurableWorker的管理，可随时更换具体的Processor和Task，可实现对应的流水线式的处理和Map2Reduce流水处理，可以添加不同的Listener进行不同的监听，可以使用concurrent包下面的map、list防止对应的并发问题。

#### WorkTask
```java
import java.util.concurrent.Future;

public abstract class WorkerTask<T> implements Future<T> {
    protected String taskID;

    protected boolean done = false;

    protected int priority;

    public WorkerTask(int priority) {
        taskID = SimpleTaskIDGenerator.genTaskID();
    }

    public String getTaskID() {
        return taskID;
    }

    public void setTaskID(String taskID) {
        this.taskID = taskID;
    }

    public int getPriority() {
        return priority;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }

    @Override
    public boolean isDone() {
        return done;
    }

    public void setDone(boolean done) {
        this.done = done;
    }
}

```

#### WorkEvent
```java
public enum WorkerEvent {
    TASK_COMPLETE,
    TASK_FAILED;
}

```

#### WorkListener
```java
import java.util.List;

import com.majingyang.qctry.flowworker.WorkerEvent;

public interface WorkerListener {
    List<WorkerEvent> intrests();

    void onEvent(WorkerEvent event, Object... args);
}
```

#### TaskProcessor
```java
public interface TaskProcessor {
    void process(WorkerTask<?> task);
}
```

#### ConfigurableWorker
```java
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CopyOnWriteArrayList;

import com.majingyang.qctry.flowworker.WorkerEvent;

public class ConfigurableWorker implements Runnable, LifeCycle {
    private BlockingQueue<WorkerTask<?>> taskQueue = new 

ArrayBlockingQueue<WorkerTask<?>>(5);

    private Thread thread;

    private HashMap<WorkerEvent, CopyOnWriteArrayList<WorkerListener>> listenerMap;

    private TaskProcessor taskProcessor;

    private volatile boolean initiated = false;

    private String workerID;

    public ConfigurableWorker(String workerID) {
        this.workerID = workerID;
    }

    @Override
    public void start() {
        if (!initiated) {
            init();
        }

        thread.start();
    }

    @Override
    public void init() {
        if (initiated)
            return;

        if (taskProcessor == null)
            throw new IllegalStateException("Task Processor must be set first");

        thread = new Thread(this);
        thread.setDaemon(true);

        listenerMap = new HashMap<WorkerEvent, CopyOnWriteArrayList<WorkerListener>>();

        initiated = true;
    }

    @Override
    public void stop() {
        thread.interrupt();
    }

    public void fireEvent(WorkerEvent event, Object... args) {
        CopyOnWriteArrayList<WorkerListener> listeners = listenerMap.get(event);

        if (listeners == null)
            return;

        for (WorkerListener listener : listeners) {
            listener.onEvent(event, args);
        }
    }

    public synchronized void addListener(WorkerListener listener) {
        if (!initiated) {
            init();
        }

        List<WorkerEvent> intrestEvents = listener.intrests();
        for (WorkerEvent event : intrestEvents) {
            CopyOnWriteArrayList<WorkerListener> listeners = listenerMap.get(event);
            if (listeners == null) {
                listeners = new CopyOnWriteArrayList<WorkerListener>();
            }

            listeners.add(listener);
            listenerMap.put(event, listeners);
        }
    }

    public String addTask(WorkerTask<?> task) {
        if (!initiated) {
            init();
        }

        try {
            taskQueue.put(task);
        } catch (InterruptedException e) {
            thread.interrupt();
        }

        return task.getTaskID();
    }

    @Override
    public void run() {
        try {
            for (;;) {
                WorkerTask<?> task = taskQueue.take();

                taskProcessor.process(task);

                if (task.isDone()) {
                    fireEvent(WorkerEvent.TASK_COMPLETE, task);
                    continue;
                }

                fireEvent(WorkerEvent.TASK_FAILED, task);
            }
        } catch (InterruptedException e) {
            System.out.println("Worker mission canceled, remaining task size: " + 

taskQueue.size());
            return;
        }
    }

    public TaskProcessor getTaskProcessor() {
        return taskProcessor;
    }

    public void setTaskProcessor(TaskProcessor taskProcessor) {
        this.taskProcessor = taskProcessor;
    }

    public String getWorkerID() {
        return workerID;
    }
}
```

#### LinearURLMiningMain
```java
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentSkipListSet;
import java.util.concurrent.TimeUnit;

import com.alibaba.taobao.worker.ConfigurableWorker;
import com.alibaba.taobao.worker.SimpleURLComparator;
import com.alibaba.taobao.worker.WorkerListener;
import com.alibaba.taobao.worker.WorkerTask;
import com.alibaba.taobao.worker.linear.PageURLMiningProcessor;
import com.alibaba.taobao.worker.linear.PageURLMiningTask;
import com.majingyang.qctry.flowworker.WorkerEvent;

public class LinearURLMiningMain implements WorkerListener {
    private static final String EMPTY_STRING = "";

    private static final int URL_SIZE_TO_MINE = 10000;

    private static ConcurrentHashMap<String, WorkerTask<?>> taskID2TaskMap = new ConcurrentHashMap<String, WorkerTask<?>>();

    private static ConcurrentSkipListSet<String> foundURLs = new ConcurrentSkipListSet<String>(new SimpleURLComparator());

    public static void main(String[] args) throws InterruptedException {
        long startTime = System.currentTimeMillis();

        ConfigurableWorker worker = new ConfigurableWorker("W001");
        worker.setTaskProcessor(new PageURLMiningProcessor());

        addTask2Worker(worker, new PageURLMiningTask("http://www.taobao.com"));
        addTask2Worker(worker, new PageURLMiningTask("http://www.xinhuanet.com"));
        addTask2Worker(worker, new PageURLMiningTask("http://www.zol.com.cn"));
        addTask2Worker(worker, new PageURLMiningTask("http://www.163.com"));

        LinearURLMiningMain mainListener = new LinearURLMiningMain();
        worker.addListener(mainListener);

        worker.start();

        String targetURL = EMPTY_STRING;
        while (foundURLs.size() < URL_SIZE_TO_MINE) {
            targetURL = foundURLs.pollFirst();

            if (targetURL == null) {
                TimeUnit.MILLISECONDS.sleep(50);
                continue;
            }

            PageURLMiningTask task = new PageURLMiningTask(targetURL);
            taskID2TaskMap.putIfAbsent(worker.addTask(task), task);

            TimeUnit.MILLISECONDS.sleep(100);
        }

        worker.stop();

        for (String string : foundURLs) {
            System.out.println(string);
        }

        System.out.println("Time Cost: " + (System.currentTimeMillis() - startTime) + "ms");
    }

    private static void addTask2Worker(ConfigurableWorker mapWorker_1, PageURLMiningTask task) {
        String taskID = mapWorker_1.addTask(task);
        taskID2TaskMap.put(taskID, task);
    }

    @Override
    public List<WorkerEvent> intrests() {
        return Arrays.asList(WorkerEvent.TASK_COMPLETE, WorkerEvent.TASK_FAILED);
    }

    @Override
    public void onEvent(WorkerEvent event, Object... args) {
        if (WorkerEvent.TASK_FAILED == event) {
            System.err.println("Error while extracting URLs");
            return;
        }

        if (WorkerEvent.TASK_COMPLETE != event)
            return;

        PageURLMiningTask task = (PageURLMiningTask) args[0];
        if (!taskID2TaskMap.containsKey(task.getTaskID()))
            return;

        foundURLs.addAll(task.getMinedURLs());

        System.out.println("Found URL size: " + foundURLs.size());

        taskID2TaskMap.remove(task.getTaskID());
    }
}
```

***
### Map2ReduceWorker设计模式
Map2ReduceWorker设计模式基于Google的MapReduce实现提高分布式效率的算法实现，有很好的并行执行效率。
针对这样的Worker设计模式，我们基于以上的Worker模式，使用基于Map和Reduce的Processor进行处理，这样可以避免串行的流水线模式一个任务失败，将导致所有的任务失败的漏洞。基于这样的模式我们建立多个基于ConfigurableWorker的Map进程，建立多个基于ConfigurableWorker的Reduce进程，设置管理并行任务的Connector监听器，当任何一个Map完成的时候就会添加到Reduce的任务队列中等待执行，Reduce将poll到任务进行后续逻辑处理。
#### 处理示意图
<center>![](/images/Map2Reduce.png)</center>

#### Map2ReduceConnector(监听Map完成，加入Reduce队列)
```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.alibaba.taobao.worker.ConfigurableWorker;
import com.alibaba.taobao.worker.WorkerListener;
import com.majingyang.qctry.flowworker.WorkerEvent;

public class Map2ReduceConnector implements WorkerListener {
    private List<ConfigurableWorker> reduces = new ArrayList<ConfigurableWorker>();

    private int lastIndex = 0;

    public Map2ReduceConnector(List<ConfigurableWorker> reduces) {
        this.reduces.addAll(reduces);
    }

    @Override
    public List<WorkerEvent> intrests() {
        return Arrays.asList(WorkerEvent.TASK_COMPLETE);
    }

    @Override
    public synchronized void onEvent(WorkerEvent event, Object... args) {
        MapReducePageURLMiningTask task = (MapReducePageURLMiningTask) args[0];

        lastIndex = ++lastIndex % reduces.size();
        reduces.get(lastIndex).addTask(task);
    }
}
```
#### MapReducePageURLMiningTask(Map2ReduceTask)
```java
import java.util.HashSet;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import com.alibaba.taobao.worker.WorkerTask;

public class MapReducePageURLMiningTask extends WorkerTask<HashSet<String>> {
    private static final int NO_PRIORITY = 0;

    private HashSet<String> minedURLs = new HashSet<String>();

    private String pageContent;

    private String targetURL;

    public MapReducePageURLMiningTask(String targetURL) {
        super(NO_PRIORITY);

        this.targetURL = targetURL;
    }

    @Override
    public boolean cancel(boolean mayInterruptIfRunning) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public boolean isCancelled() {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public synchronized HashSet<String> get() throws InterruptedException, ExecutionException {
        if (!isDone()) {
            wait();
        }

        return minedURLs;
    }

    @Override
    public synchronized HashSet<String> get(long timeout, TimeUnit unit) throws InterruptedException,
            ExecutionException, TimeoutException {
        if (!isDone()) {
            wait(unit.toMillis(timeout));
        }

        return minedURLs;
    }

    public HashSet<String> getMinedURLs() {
        return minedURLs;
    }

    public void addMinedURL(String url) {
        minedURLs.add(url);
    }

    public String getTargetURL() {
        return targetURL;
    }

    public void setTargetURL(String targetURL) {
        this.targetURL = targetURL;
    }

    public String getPageContent() {
        return pageContent;
    }

    public void setPageContent(String pageContent) {
        this.pageContent = pageContent;
    }
}
```
#### MapReduceURLMiningMain(主任务监听器和程序入口)
```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.TreeSet;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import com.alibaba.taobao.worker.ConfigurableWorker;
import com.alibaba.taobao.worker.SimpleURLComparator;
import com.alibaba.taobao.worker.WorkerListener;
import com.alibaba.taobao.worker.WorkerTask;
import com.majingyang.qctry.flowworker.WorkerEvent;

public class MapReduceURLMiningMain implements WorkerListener {
    private static final int URL_SIZE_TO_MINE = 5000;

    private static ConcurrentHashMap<String, WorkerTask<?>> taskID2TaskMap = new ConcurrentHashMap<String, WorkerTask<?>>();

    private static TreeSet<String> foundURLs = new TreeSet<String>(new SimpleURLComparator());

    public static void main(String[] args) throws InterruptedException {
        long startTime = System.currentTimeMillis();

        // four mapers
        List<ConfigurableWorker> mappers = new ArrayList<ConfigurableWorker>(4);

        ConfigurableWorker mapWorker_1 = new ConfigurableWorker("W_M1");
        ConfigurableWorker mapWorker_2 = new ConfigurableWorker("W_M2");
        ConfigurableWorker mapWorker_3 = new ConfigurableWorker("W_M3");
        ConfigurableWorker mapWorker_4 = new ConfigurableWorker("W_M4");
        mapWorker_1.setTaskProcessor(new PageContentFetchProcessor());
        mapWorker_2.setTaskProcessor(new PageContentFetchProcessor());
        mapWorker_3.setTaskProcessor(new PageContentFetchProcessor());
        mapWorker_4.setTaskProcessor(new PageContentFetchProcessor());

        mappers.add(mapWorker_1);
        mappers.add(mapWorker_2);
        mappers.add(mapWorker_3);
        mappers.add(mapWorker_4);

        // one reducers
        ConfigurableWorker reduceWorker_1 = new ConfigurableWorker("W_R1");
        reduceWorker_1.setTaskProcessor(new URLMatchingProcessor());

        // bind reducer to final result class
        MapReduceURLMiningMain main = new MapReduceURLMiningMain();
        reduceWorker_1.addListener(main);

        // initiate tasks
        addTask2Worker(mapWorker_1, new MapReducePageURLMiningTask("http://www.taobao.com"));
        addTask2Worker(mapWorker_1, new MapReducePageURLMiningTask("http://www.xinhuanet.com"));
        addTask2Worker(mapWorker_1, new MapReducePageURLMiningTask("http://www.zol.com.cn"));
        addTask2Worker(mapWorker_1, new MapReducePageURLMiningTask("http://www.163.com"));

        // bind mapper to reduer
        Map2ReduceConnector connector = new Map2ReduceConnector(Arrays.asList(reduceWorker_1));
        mapWorker_1.addListener(connector);
        mapWorker_2.addListener(connector);
        mapWorker_3.addListener(connector);
        mapWorker_4.addListener(connector);

        // start all
        mapWorker_1.start();
        mapWorker_2.start();
        mapWorker_3.start();
        mapWorker_4.start();
        reduceWorker_1.start();

        String targetURL = "";
        int lastIndex = 0;
        while (foundURLs.size() < URL_SIZE_TO_MINE) {
            synchronized (foundURLs) {
                targetURL = foundURLs.pollFirst();

                if (targetURL == null) {
                    foundURLs.wait();
                    continue;
                }
            }

            lastIndex = ++lastIndex % mappers.size();
            MapReducePageURLMiningTask task = new MapReducePageURLMiningTask(targetURL);
            taskID2TaskMap.putIfAbsent(mappers.get(lastIndex).addTask(task), task);

            synchronized (foundURLs) {
                foundURLs.add(targetURL);
            }

            TimeUnit.MILLISECONDS.sleep(100);
        }

        // stop all
        mapWorker_1.stop();
        mapWorker_2.stop();
        mapWorker_3.stop();
        mapWorker_4.stop();
        reduceWorker_1.stop();

        synchronized (foundURLs) {
            for (String string : foundURLs) {
                System.out.println(string);
            }
        }

        System.out.println("Time Cost: " + (System.currentTimeMillis() - startTime) + "ms");
    }

    private static void addTask2Worker(ConfigurableWorker mapWorker_1, MapReducePageURLMiningTask task) {
        String taskID = mapWorker_1.addTask(task);
        taskID2TaskMap.put(taskID, task);
    }

    @Override
    public List<WorkerEvent> intrests() {
        return Arrays.asList(WorkerEvent.TASK_COMPLETE, WorkerEvent.TASK_FAILED);
    }

    @Override
    public void onEvent(WorkerEvent event, Object... args) {
        if (WorkerEvent.TASK_FAILED == event) {
            System.err.println("Error while extracting URLs");
            return;
        }

        if (WorkerEvent.TASK_COMPLETE != event)
            return;

        MapReducePageURLMiningTask task = (MapReducePageURLMiningTask) args[0];
        if (!taskID2TaskMap.containsKey(task.getTaskID()))
            return;

        synchronized (foundURLs) {
            foundURLs.addAll(task.getMinedURLs());
        }

        System.out.println("Found URL size: " + foundURLs.size());

        taskID2TaskMap.remove(task.getTaskID());

        synchronized (foundURLs) {
            // notify the static main method above
            foundURLs.notifyAll();
        }
    }
}
```
#### PageContentFetchProcessor(MapProcessor)
```java
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;
import java.util.concurrent.TimeUnit;

import com.alibaba.taobao.worker.TaskProcessor;
import com.alibaba.taobao.worker.WorkerTask;

public class PageContentFetchProcessor implements TaskProcessor {
    private static final int MAX_PAGE_SIZE = 1024 * 1024 * 10;

    private static final int BUFFER_SIZE = 128 * 1024;

    @Override
    public void process(WorkerTask<?> task) {
        if (!(task instanceof MapReducePageURLMiningTask))
            throw new IllegalArgumentException("Excepted PageURLMiningTask but was: " + task.getClass().getSimpleName());

        MapReducePageURLMiningTask mapReduceURLMiningTask = (MapReducePageURLMiningTask) task;

        try {
            URL url = new URL(mapReduceURLMiningTask.getTargetURL());

            URLConnection urlConnection = url.openConnection();
            urlConnection.setConnectTimeout((int) TimeUnit.SECONDS.toMillis(2));
            urlConnection.setReadTimeout((int) TimeUnit.SECONDS.toMillis(2));

            InputStream inputStream = urlConnection.getInputStream();
            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream), BUFFER_SIZE);

            StringBuilder pageContent = new StringBuilder();

            String line = null;
            while ((line = reader.readLine()) != null) {
                pageContent.append(line);

                if (line.length() > MAX_PAGE_SIZE || pageContent.length() > MAX_PAGE_SIZE) {
                    break;
                }
            }

            mapReduceURLMiningTask.setPageContent(pageContent.toString());
            mapReduceURLMiningTask.setDone(true);
        } catch (Exception e) {
            System.err.println("Error while fetching specified URL: " + mapReduceURLMiningTask.getTargetURL()
                    + "\nException" + e.toString());
        } finally {
            synchronized (mapReduceURLMiningTask) {
                mapReduceURLMiningTask.notifyAll();
            }
        }
    }
}
```
### URLMatchingProcessor(ReduceProcessor)
```java
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.alibaba.taobao.worker.TaskProcessor;
import com.alibaba.taobao.worker.WorkerTask;

public class URLMatchingProcessor implements TaskProcessor {
    private static final String URL_PATTERN = "http(s)?://[\\w\\.\\/]*(\\.htm|\\.do|\\.html|\\.xhtm|\\.xhtml)";

    @Override
    public void process(WorkerTask<?> task) {
        if (!(task instanceof MapReducePageURLMiningTask))
            throw new IllegalArgumentException("Excepted PageURLMiningTask but was: " + task.getClass().getSimpleName());

        MapReducePageURLMiningTask mapReduceURLMiningTask = (MapReducePageURLMiningTask) task;

        try {
            Matcher matcher = Pattern.compile(URL_PATTERN).matcher(mapReduceURLMiningTask.getPageContent());
            while (matcher.find()) {
                mapReduceURLMiningTask.addMinedURL(matcher.group());
            }

            mapReduceURLMiningTask.setDone(true);
        } catch (Exception e) {
            System.err.println("Error while fetching specified URL: " + mapReduceURLMiningTask.getTargetURL()
                    + "\nException" + e.toString());
        } finally {
            synchronized (mapReduceURLMiningTask) {
                mapReduceURLMiningTask.notifyAll();
            }
        }
    }
}
```

***
总结，代码中不同的模式，都是基于最基本的Java基础实现，比如队列、Map、List、Set等等，并且总是不经意间用出一些设计模式的简单实现，但是要学会思考、总结，时间的沉淀和深入的思考总有一天会让我们成为大牛。
