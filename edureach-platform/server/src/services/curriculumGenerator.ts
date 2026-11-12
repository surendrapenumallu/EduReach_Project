// Curriculum & Assessment Generator for EduReach Faculty AI Copilot
// Provides university-grade, high-rigor educational content across all computer science departments.

export function getCourseDomain(course: string): string {
  const c = course.toLowerCase();
  if (c.includes("ai") || c.includes("artificial") || c.includes("machine learning") || c.includes("cs605") || c.includes("deep learning")) {
    return "AIML";
  }
  if (c.includes("database") || c.includes("dbms") || c.includes("sql") || c.includes("cs402")) {
    return "DBMS";
  }
  if (c.includes("operating") || c.includes("os") || c.includes("cs403")) {
    return "OS";
  }
  if (c.includes("structure") || c.includes("algorithm") || c.includes("dsa") || c.includes("cs401")) {
    return "DSA";
  }
  if (c.includes("network") || c.includes("cs501")) {
    return "NETWORKS";
  }
  return "GENERAL";
}

export function generateAcademicContent(taskType: string, course: string, topic: string): string {
  const domain = getCourseDomain(course);
  const t = topic ? topic.trim() : "";
  const tLower = t.toLowerCase();

  // ==================== 1. ATTENDANCE WARNING / DEBARMENT NOTICE ====================
  const isAttendanceWarning =
    tLower.includes("attendance") &&
    (tLower.includes("warning") ||
      tLower.includes("notice") ||
      tLower.includes("debarment") ||
      tLower.includes("75") ||
      tLower.includes("reminder") ||
      tLower.includes("rule"));

  if (isAttendanceWarning) {
    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    return `### 🏛️ EduReach University College of Engineering
**Department of Computer Science & Engineering**  
**OFFICIAL ACADEMIC NOTIFICATION**

**Reference No:** EDU/CSE/ATT-WARN/2026/042  
**Date:** ${todayStr}  
**Subject:** Formal Notice: Low Attendance (<75%) & Statutory University Examination Debarment Warning  
**Course:** ${course}

---

**Dear Student & Parent / Guardian,**

This is an urgent official communication regarding academic attendance in **${course}**.

Under **Clause 14(B) of the University Academic Regulations**, all undergraduate engineering students are strictly mandated to maintain a **minimum cumulative attendance of 75.0%** in lectures, practical laboratories, and tutorial sessions to be eligible to appear for the upcoming End-Semester University Examinations.

#### 📊 Affected Attendance Record Summary:
| Student Name | Roll Number | Current Attendance % | Status | Minimum Classes Required to Reach 75% |
| :--- | :--- | :--- | :--- | :--- |
| **Karan Singh** | \`22CSE0188\` | **68.5%** | ⚠️ Debarment Critical | Must attend next 8 consecutive sessions |
| **Sneha Reddy** | \`22CSE0192\` | **71.0%** | ⚠️ Below Cutoff | Must attend next 5 consecutive sessions |

#### ⚠️ Consequences of Non-Compliance:
1. **Debarment from Examinations:** Students failing to achieve 75% by the close of instruction will be automatically debarred from taking the semester theory and lab examinations.
2. **Loss of Semester Credits:** Debarred students must re-register for the course in the subsequent academic cycle.
3. **Condonation Criteria:** Medical condonation (between 65% and 74.9%) is strictly subject to submission of valid authorized medical certificates to the Dean of Academic Affairs before the deadline.

#### 📝 Mandatory Action Required:
1. Students listed above must report to **Prof. Rajesh Sharma (Faculty Advisor)** during designated office hours (Mon-Wed 2:00 PM - 4:00 PM, Cabin 402).
2. A formal academic undertaking countersigned by parents must be submitted to the Department Office no later than **Friday, 5:00 PM**.

---

**Prof. Rajesh Sharma**  
*Course Instructor & Faculty Coordinator*  
*Department of Computer Science & Engineering*  
*EduReach College of Engineering & Technology*`;
  }

  // ==================== 2. SYLLABUS GENERATOR ====================
  if (taskType === "syllabus") {
    if (domain === "DSA") {
      return `### 📚 12-Week Comprehensive Course Syllabus: ${course}
**Department:** Computer Science & Engineering | **Credits:** 4.0 | **Lecture Hours:** 45 hrs + 30 Lab hrs

---

* **Week 1–2 (Unit 1): Asymptotic Analysis & Linear Data Structures**
  * Algorithm analysis: Big-O, Omega, Theta notations. Time vs Space complexity tradeoffs.
  * Arrays, Dynamic arrays, Singly Linked Lists, Doubly Linked Lists, Circular Linked Lists.
  * *Lab 1:* Pointer-based implementation of Doubly Linked Lists with reverse and cycle detection routines.

* **Week 3–4 (Unit 2): Stacks, Queues & Recursion**
  * Stacks: Array and linked representations, Infix to Postfix conversion, Postfix evaluation, Backtracking.
  * Queues: Circular Queue, Double-Ended Queue (Deque), Priority Queue using arrays.
  * *Lab 2:* Expression syntax parsing and balanced parentheses validator using Stacks.

* **Week 5–6 (Unit 3): Trees & Self-Balancing Search Trees**
  * Binary Trees: Traversals (Inorder, Preorder, Postorder, Level-Order).
  * Binary Search Trees (BST): Insert, Delete, Search operations.
  * Self-Balancing Trees: AVL Trees (Single and Double rotations, Balance factors), Red-Black Tree principles.
  * Binary Heaps: Min-Heap, Max-Heap, HeapSort implementation.
  * *Lab 3:* C++/Java implementation of an AVL Tree with auto-rebalancing on node deletion.

* **Week 7–8 (Unit 4): Divide & Conquer and Sorting Algorithms**
  * Sorting algorithms: MergeSort, QuickSort (Randomized pivot), HeapSort, RadixSort.
  * Master Theorem for recurrence relations. Binary Search and variations.
  * *Mid-Term Examination & Competitive Programming Assessment.*

* **Week 9–10 (Unit 5): Graph Algorithms & Network Flow**
  * Graph representations: Adjacency Matrix, Adjacency List.
  * Traversals: Breadth-First Search (BFS), Depth-First Search (DFS), Topological Sort.
  * Shortest Paths: Dijkstra's Algorithm, Bellman-Ford Algorithm.
  * Minimum Spanning Trees (MST): Prim's and Kruskal's Algorithms with Disjoint Set Union (DSU).
  * *Lab 4:* Routing simulation using Dijkstra's algorithm and Min-Heap priority queue.

* **Week 11–12 (Unit 6): Dynamic Programming & Greedy Algorithms**
  * Greedy Strategy: Fractional Knapsack, Activity Selection, Huffman Coding.
  * Dynamic Programming: Memoization vs Tabulation, 0/1 Knapsack, Longest Common Subsequence (LCS), Matrix Chain Multiplication.
  * Introduction to P, NP, and NP-Complete problems.
  * *Final Course Project Review & Viva-Voce.*`;
    }

    if (domain === "OS") {
      return `### 📚 12-Week Comprehensive Course Syllabus: ${course}
**Department:** Computer Science & Engineering | **Credits:** 4.0 | **Lecture Hours:** 45 hrs + 30 Lab hrs

---

* **Week 1–2 (Unit 1): Operating System Architecture & System Calls**
  * OS services, Dual-mode execution (User vs Kernel mode), Interrupt handling, Hardware protection.
  * Process Control Blocks (PCB), Process states, Context switching, System calls (fork, exec, wait, pipe).
  * *Lab 1:* Linux system calls programming in C (process creation & inter-process communication using pipes).

* **Week 3–4 (Unit 2): CPU Scheduling & Dispatching**
  * CPU-I/O burst cycle, Preemptive vs Non-preemptive scheduling.
  * Algorithms: FCFS, Shortest Job First (SJF), Shortest Remaining Time First (SRTF), Priority Scheduling, Round Robin, Multilevel Feedback Queues.
  * *Lab 2:* Simulating CPU scheduling algorithms & calculating average turnaround and waiting times.

* **Week 5–6 (Unit 3): Process Synchronization & Concurrency**
  * Race conditions, Critical section problem, Requirements (Mutual exclusion, Progress, Bounded waiting).
  * Peterson's solution, Hardware atomic instructions (TestAndSet, CompareAndSwap).
  * Semaphores (Counting & Binary), Mutexes, Classic synchronization problems: Producer-Consumer, Dining Philosophers, Readers-Writers.
  * *Lab 3:* Multi-threaded synchronization in C/Pthreads using semaphores and mutex locks.

* **Week 7–8 (Unit 4): Deadlock Characterization & Handling**
  * Four necessary conditions for deadlock (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait).
  * Deadlock prevention, Deadlock avoidance (Resource Allocation Graph, Banker's Algorithm).
  * Deadlock detection and recovery schemes.
  * *Mid-Term Examination & Lab Practical Assessment.*

* **Week 9–10 (Unit 5): Memory Management & Virtual Memory**
  * Logical vs Physical address spaces, Dynamic linking, Contiguous allocation, Fragmentation (Internal vs External).
  * Paging: Page tables, Translation Lookaside Buffer (TLB), Multi-level paging, Segmentation.
  * Virtual memory: Demand paging, Page fault handling, Page replacement algorithms (FIFO, Optimal, LRU, Clock).
  * *Lab 4:* Simulating page replacement algorithms (FIFO vs LRU) and computing page fault rates.

* **Week 11–12 (Unit 6): Storage, File Systems & I/O Protection**
  * Disk scheduling algorithms (FCFS, SSTF, SCAN, C-SCAN, LOOK).
  * File system structure: Inodes, Allocation methods (Contiguous, Linked, Indexed), Free space management.
  * *Final Course Project Review & Examination Preparation.*`;
    }

    if (domain === "DBMS") {
      return `### 📚 12-Week Comprehensive Course Syllabus: ${course}
**Department:** Computer Science & Engineering | **Credits:** 4.0 | **Lecture Hours:** 45 hrs + 30 Lab hrs

---

* **Week 1–2 (Unit 1): Relational Architecture & Conceptual Design**
  * 3-Schema architecture, Data independence, Relational data model fundamentals.
  * Entity-Relationship (ER) modeling, Extended ER features, ER-to-Relational schema mapping.
  * *Lab 1:* Designing enterprise ER diagrams & initializing PostgreSQL/MySQL schema tables.

* **Week 3–4 (Unit 2): Advanced Relational Algebra & Structured Query Language (SQL)**
  * Relational algebra operations: Selection, Projection, Cartesian Product, Natural & Outer Joins.
  * Complex SQL queries: Subqueries, Correlated subqueries, Aggregate functions, GROUP BY, HAVING, Window functions.
  * *Lab 2:* Writing multi-table analytical SQL queries and database views.

* **Week 5–6 (Unit 3): Relational Database Design & Normalization Theory**
  * Functional dependencies, Inference rules (Armstrong's Axioms), Minimal covers.
  * Normal Forms: 1NF, 2NF, 3NF, Boyce-Codd Normal Form (BCNF). Lossless-join and dependency-preserving decomposition.
  * *Lab 3:* Schema normalization case study: Decomposing unnormalized college administrative tables into BCNF.

* **Week 7–8 (Unit 4): Transaction Processing & ACID Properties**
  * Transaction states, ACID properties (Atomicity, Consistency, Isolation, Durability).
  * Serializability: Conflict serializability, Precedence graphs, View serializability.
  * *Mid-Term Examination & Practical SQL Assessment.*

* **Week 9–10 (Unit 5): Concurrency Control & Database Recovery**
  * Lock-based protocols: Shared/Exclusive locks, Two-Phase Locking (2PL), Strict 2PL, Rigorous 2PL.
  * Deadlock handling: Prevention (Wait-Die, Wound-Wait), Detection (Wait-For Graph), and Recovery.
  * Write-Ahead Logging (WAL), Checkpoints, ARIES recovery algorithm.
  * *Lab 4:* Simulating concurrent transactions & observing dirty read / non-repeatable read isolation levels.

* **Week 11–12 (Unit 6): Storage, Indexing & Query Optimization**
  * File organization: Heap files, Sorted files, Hashing (Static & Dynamic).
  * Indexing structures: Primary, Secondary, Clustered indexes, B-Trees and B+ Tree operations.
  * Query execution plans (EXPLAIN), Cost estimation, Overview of NoSQL databases (MongoDB).
  * *Final Course Project Review & Viva-Voce.*`;
    }

    if (domain === "NETWORKS") {
      return `### 📚 12-Week Comprehensive Course Syllabus: ${course}
**Department:** Computer Science & Engineering | **Credits:** 4.0 | **Lecture Hours:** 45 hrs + 30 Lab hrs

---

* **Week 1–2 (Unit 1): Computer Network Architecture & Physical Layer**
  * Network topologies (Mesh, Star, Bus, Ring), Transmission media (Twisted pair, Coaxial, Fiber optics).
  * Layered architecture: OSI 7-Layer Reference Model vs TCP/IP Protocol Suite.
  * *Lab 1:* Network cable crimping (CAT6 RJ-45) and packet propagation delay measurement.

* **Week 3–4 (Unit 2): Data Link Layer & Medium Access Control (MAC)**
  * Framing, Error detection (Parity, Checksum, Cyclic Redundancy Check - CRC), Flow control (Stop-and-Wait, Go-Back-N, Selective Repeat).
  * Multiple access: ALOHA, CSMA, CSMA/CD (Ethernet IEEE 802.3), CSMA/CA (WiFi IEEE 802.11).
  * *Lab 2:* Simulating CRC error detection and Sliding Window protocol in C/Python.

* **Week 5–6 (Unit 3): Network Layer & IP Addressing**
  * IPv4 vs IPv6 addressing, Classful vs Classless addressing (CIDR), Subnetting & Supernetting, VLSM.
  * Address Resolution Protocol (ARP), Internet Control Message Protocol (ICMP), DHCP, NAT.
  * *Lab 3:* Packet inspection using Wireshark: Analyzing ARP requests, ICMP echo pings, and IP packet headers.

* **Week 7–8 (Unit 4): Routing Protocols & Algorithms**
  * Routing principles: Distance Vector (Bellman-Ford / RIP), Link-State (Dijkstra / OSPF), Path Vector (BGP).
  * Congestion control: Leaky Bucket and Token Bucket algorithms.
  * *Mid-Term Examination & Lab Routing Simulator Assessment.*

* **Week 9–10 (Unit 5): Transport Layer & End-to-End Reliability**
  * User Datagram Protocol (UDP) vs Transmission Control Protocol (TCP).
  * TCP connection establishment (3-Way Handshake) and termination (4-Way FIN/ACK).
  * TCP congestion control: Slow Start, Congestion Avoidance, Fast Retransmit, Fast Recovery (Tahoe/Reno).
  * *Lab 4:* Socket programming in Python: Building a multi-client TCP chat application.

* **Week 11–12 (Unit 6): Application Layer Protocols & Network Security**
  * Domain Name System (DNS), HTTP/1.1 vs HTTP/2 vs HTTP/3, SMTP/POP3/IMAP, FTP.
  * Network security foundations: Symmetric vs Asymmetric cryptography (RSA), SSL/TLS handshake, Firewalls.
  * *Final Course Project Review & University Examination Preparation.*`;
    }

    // Default AIML Syllabus
    return `### 📚 12-Week Comprehensive Course Syllabus: ${course}
**Department:** Computer Science & Engineering | **Credits:** 4.0 | **Lecture Hours:** 45 hrs + 30 Lab hrs

---

* **Week 1–2 (Unit 1): Foundations of AI & Problem Formulation**
  * Intelligent agents, state space representation, uninformed search (BFS, DFS).
  * Heuristic search algorithms: A* Search, Greedy Best-First, Admissibility ($h(n) \\le h^*(n)$), Minimax & Alpha-Beta Pruning.
  * *Lab 1:* Python search agent implementation (8-Puzzle problem using A* with Manhattan distance).

* **Week 3–4 (Unit 2): Supervised Classical Machine Learning**
  * Linear & Logistic Regression, Decision Trees (ID3, CART), Information Gain, Random Forests, Support Vector Machines (SVM).
  * Cost functions, Gradient Descent optimization, Learning rate tuning.
  * *Lab 2:* Scikit-learn pipelines: Binary classification on student placement dataset with feature scaling.

* **Week 5–6 (Unit 3): Deep Learning & Neural Network Architectures**
  * Perceptrons, Multi-Layer Perceptrons (MLP), Forward propagation, Backpropagation with Chain Rule.
  * Activation functions: Sigmoid, Tanh, ReLU, Leaky ReLU, Softmax. Vanishing gradient mitigation.
  * *Lab 3:* Building and training a deep neural network from scratch using PyTorch/TensorFlow.

* **Week 7–8 (Unit 4): Model Evaluation, Regularization & Mid-Term Checkpoint**
  * Confusion matrix metrics: Precision, Recall, F1-Score, ROC-AUC curves.
  * Bias-Variance tradeoff, Overfitting prevention: L1 (Lasso), L2 (Ridge) Regularization, Dropout, Early Stopping.
  * *Mid-Term Examination & Lab Coding Assessment.*

* **Week 9–10 (Unit 5): Computer Vision & Natural Language Processing**
  * Convolutional Neural Networks (CNNs): Kernels, Pooling, Strides, Image Classification (VGG, ResNet).
  * NLP foundations: Word Embeddings (Word2Vec), Recurrent Neural Networks (RNNs, LSTMs), Attention Mechanisms & Transformers.
  * *Lab 4:* Image classification on CIFAR-10 / Text sentiment analysis using HuggingFace Transformers.

* **Week 11–12 (Unit 6): Unsupervised Learning & End-to-End Model Deployment**
  * K-Means Clustering, Principal Component Analysis (PCA) for dimensionality reduction.
  * Reinforcement learning basics (Markov Decision Processes, Q-Learning).
  * Production deployment: Packaging ML models into REST APIs using FastAPI and Streamlit.
  * *Final Capstone Project Presentations & University Examination Revision.*`;
  }

  // ==================== 3. QUIZ GENERATOR ====================
  if (taskType === "quiz") {
    if (domain === "DSA") {
      return `### 📋 5-Question Pop Quiz: ${course}
**Focus Topic:** ${t || "Binary Trees, AVL Trees & Search Algorithms"} | **Total Marks:** 25

---

**Q1 (Multiple Choice - 3 Marks):**
What is the maximum number of nodes in a binary tree of height $h$, assuming the root node is at height $h = 0$?
* [A] $2^h$
* [B] $2^{h+1} - 1$
* [C] $2^h - 1$
* [D] $2^{h+1}$
* **Correct Answer:** **[B]**
* *Explanation:* At level $k$, there are at most $2^k$ nodes. Summing the geometric series from $k=0$ to $h$ yields $\\sum_{k=0}^{h} 2^k = 2^{h+1} - 1$.

**Q2 (Multiple Choice - 3 Marks):**
Given the following tree traversal sequences of a binary tree:
* **Pre-order:** \`A, B, D, E, C, F\`
* **In-order:** \`D, B, E, A, F, C\`
Which sequence represents the correct **Post-order** traversal?
* [A] \`D, E, B, F, C, A\`
* [B] \`D, E, B, C, F, A\`
* [C] \`E, D, B, F, C, A\`
* [D] \`D, B, E, F, C, A\`
* **Correct Answer:** **[A]**
* *Explanation:* Root is \`A\`. Left subtree contains \`{D, B, E}\` with root \`B\` (left child \`D\`, right child \`E\`). Right subtree contains \`{F, C}\` with root \`C\` (left child \`F\`). Traversing Left-Right-Root yields \`D, E, B, F, C, A\`.

**Q3 (Analytical Problem - 6 Marks):**
In a self-balancing **AVL Tree**, what is the valid range of the **Balance Factor** ($BF = \\text{height}(\\text{left}) - \\text{height}(\\text{right})$)? If a node $N$ has $BF = +2$ and its left child has $BF = -1$, identify the required rotation.
* **Solution:**
  * Valid AVL Balance Factor range: $\\{-1, 0, +1\\}$.
  * Imbalance Type: **Left-Right (LR) Imbalance** ($N$ is left-heavy $+2$, child is right-heavy $-1$).
  * **Restoration:** Perform a **Left Rotation on the Left Child**, followed by a **Right Rotation on Node $N$** (LR Double Rotation).

**Q4 (Time Complexity - 6 Marks):**
Compare the worst-case and average-case time complexities of searching in a standard Binary Search Tree (BST) versus an AVL Tree with $N$ nodes. Explain why AVL trees prevent degeneration.
* **Solution:**
  * **Standard BST:** Average = $O(\\log N)$, Worst-case = $O(N)$ (occurs when elements are inserted in monotonic sorted order, resulting in a degenerate linked-list shape).
  * **AVL Tree:** Average = $O(\\log N)$, Worst-case = $O(\\log N)$ strictly, because tree height is mathematically constrained by $h < 1.44 \\log_2(N + 2)$.

**Q5 (Coding Question - 7 Marks):**
Write a clean recursive C++ function \`int maxDepth(TreeNode* root)\` that computes the maximum height/depth of a Binary Tree. Include base cases and complexity analysis.
\`\`\`cpp
int maxDepth(TreeNode* root) {
    if (root == nullptr) return 0;
    return 1 + std::max(maxDepth(root->left), maxDepth(root->right));
}
// Time Complexity: O(N) where N is number of nodes. Space Complexity: O(H) for call stack.
\`\`\``;
    }

    if (domain === "OS") {
      return `### 📋 5-Question Pop Quiz: ${course}
**Focus Topic:** ${t || "Deadlocks, Process Synchronization & Paging"} | **Total Marks:** 25

---

**Q1 (Multiple Choice - 3 Marks):**
Which of the following is NOT one of the four necessary Coffman conditions required for a deadlock to occur?
* [A] Mutual Exclusion
* [B] Hold and Wait
* [C] Preemptive Resource Allocation
* [D] Circular Wait
* **Correct Answer:** **[C]**
* *Explanation:* The four Coffman conditions are Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait. If resource preemption is enforced, deadlocks cannot form.

**Q2 (Analytical - 6 Marks):**
In **Banker's Algorithm**, a system has 5 processes ($P_0$ to $P_4$) and 3 resource types ($A, B, C$). Available = \`[3, 3, 2]\`. The $Need$ matrix is defined as $Need[i][j] = Max[i][j] - Allocation[i][j]$.
How does the OS determine if the system is in a **Safe State**?
* **Solution:**
  * Initialize $Work = Available$ and $Finish[i] = false$ for all $i$.
  * Find an index $i$ such that $Finish[i] == false$ and $Need_i \\le Work$.
  * Set $Work = Work + Allocation_i$, $Finish[i] = true$, and repeat until all processes finish.
  * If all $Finish[i] == true$, a Safe Execution Sequence exists (e.g., $\\langle P_1, P_3, P_4, P_0, P_2 \\rangle$), guaranteeing no deadlock.

**Q3 (Multiple Choice - 3 Marks):**
What is the primary difference between a Counting Semaphore and a Binary Semaphore (Mutex)?
* [A] Binary Semaphore allows multiple concurrent threads, Counting allows one
* [B] Counting Semaphore integer value can range over an unrestricted domain (handling resource pools of size $K$)
* [C] Counting Semaphores cannot be used in user space
* [D] Binary Semaphores do not utilize wait() and signal() operations
* **Correct Answer:** **[B]**

**Q4 (Calculation - 6 Marks):**
Calculate the **Effective Memory Access Time (EMAT)** in a paged virtual memory architecture given:
* TLB Hit Ratio = $90\\%$ ($0.90$)
* TLB Access Latency = $20\\text{ ns}$
* Main Memory Access Latency = $100\\text{ ns}$
* **Solution:**
  * $\\text{Time}_{\\text{hit}} = 20 + 100 = 120\\text{ ns}$ (TLB lookup + memory access)
  * $\\text{Time}_{\\text{miss}} = 20 + 100 + 100 = 220\\text{ ns}$ (TLB lookup + page table walk + memory access)
  * $\\text{EMAT} = (0.90 \\times 120) + (0.10 \\times 220) = 108 + 22 = \\mathbf{130\\text{ ns}}$.

**Q5 (Coding / Algorithm - 7 Marks):**
Write the algorithm for **Peterson's Solution** in C demonstrating critical-section mutual exclusion for two processes $P_0$ and $P_1$ using \`flag[2]\` and \`turn\`. Explain why progress is satisfied.`;
    }

    if (domain === "NETWORKS") {
      return `### 📋 5-Question Pop Quiz: ${course}
**Focus Topic:** ${t || "TCP/IP, Subnetting, Routing & OSI Model"} | **Total Marks:** 25

---

**Q1 (Multiple Choice - 3 Marks):**
An organization is allocated the IPv4 address block \`192.168.10.0/24\`. The administrator creates 4 equal subnets using a \`/26\` prefix. What is the maximum number of usable host addresses per subnet?
* [A] 64
* [B] 62
* [C] 30
* [D] 126
* **Correct Answer:** **[B] (62 hosts)**
* *Explanation:* With a \`/26\` mask ($32 - 26 = 6$ host bits), total IP addresses = $2^6 = 64$. Subtracting 2 (Network ID and Broadcast address) gives $64 - 2 = 62$ usable host addresses.

**Q2 (Analytical - 6 Marks):**
Describe the **TCP 3-Way Handshake** connection establishment sequence between Client $C$ and Server $S$. Include the SYN, ACK flags and sequence number synchronization.
* **Solution:**
  * Step 1: $C \\rightarrow S$: \`SYN\` segment with client Initial Sequence Number $ISN_C$.
  * Step 2: $S \\rightarrow C$: \`SYN-ACK\` segment with server sequence number $ISN_S$ and $ACK = ISN_C + 1$.
  * Step 3: $C \\rightarrow S$: \`ACK\` segment with sequence number $ISN_C + 1$ and $ACK = ISN_S + 1$. Connection is now established.

**Q3 (Multiple Choice - 3 Marks):**
At which layer of the OSI reference model do Routers make forwarding decisions based on IP destination addresses?
* [A] Data Link Layer (Layer 2)
* [B] Network Layer (Layer 3)
* [C] Transport Layer (Layer 4)
* [D] Session Layer (Layer 5)
* **Correct Answer:** **[B] Network Layer**

**Q4 (Protocol Analysis - 6 Marks):**
Compare **Distance Vector Routing** (Bellman-Ford / RIP) vs **Link-State Routing** (Dijkstra / OSPF). Explain the Count-to-Infinity problem and how Split Horizon mitigates it.

**Q5 (Calculation - 7 Marks):**
Given a link bandwidth of 10 Mbps and Round-Trip Time (RTT) of 40 ms, calculate the **Bandwidth-Delay Product (BDP)**. How many bytes must a TCP sender transmit to fully utilize the link without stalling?`;
    }

    if (domain === "DBMS") {
      return `### 📋 5-Question Pop Quiz: ${course}
**Focus Topic:** ${t || "Normalization, SQL & Concurrency Control"} | **Total Marks:** 25

---

**Q1 (Multiple Choice - 3 Marks):**
A relation schema $R(A, B, C, D)$ has the functional dependency $A \\rightarrow B$. For this schema to be in **Boyce-Codd Normal Form (BCNF)**, which condition must hold?
* [A] $A$ must be part of a composite foreign key
* [B] $A$ must be a Super Key of relation $R$
* [C] $B$ must be a prime attribute
* [D] The relation must already satisfy 4NF
* **Correct Answer:** **[B]**
* *Explanation:* BCNF requires that for every non-trivial functional dependency $X \\rightarrow Y$, the determinant $X$ must be a super key.

**Q2 (Multiple Choice - 3 Marks):**
In database transaction management, what does the **Two-Phase Locking (2PL)** protocol guarantee?
* [A] Freedom from Deadlocks
* [B] Conflict Serializability of concurrent schedules
* [C] Zero lock contention
* [D] Immediate disk write persistence
* **Correct Answer:** **[B]**
* *Explanation:* 2PL guarantees conflict serializability, but it does NOT guarantee freedom from deadlocks (deadlocks can still occur under standard 2PL).

**Q3 (Analytical - 6 Marks):**
Given the following concurrent transaction schedule:
\`\`\`text
T1: Read(A)
T2: Write(A)
T1: Write(A)
T2: Commit
T1: Commit
\`\`\`
Draw or describe the Precedence Graph. Is this schedule conflict serializable?
* **Solution:**
  * Conflict 1: $T1 \\rightarrow T2$ (T1 Read(A) precedes T2 Write(A))
  * Conflict 2: $T2 \\rightarrow T1$ (T2 Write(A) precedes T1 Write(A))
  * The precedence graph contains a cycle ($T1 \\rightleftharpoons T2$). Therefore, the schedule is **NOT conflict serializable**.

**Q4 (Short Answer - 6 Marks):**
Why do modern relational database engines (like InnoDB) use B+ Trees rather than standard Binary Search Trees (BST) or B-Trees for disk indexing?

**Q5 (SQL Assessment - 7 Marks):**
Write a single SQL query using a window function (\`DENSE_RANK()\`) to find the 2nd highest student score for each department.`;
    }

    // Default AIML / General Quiz
    return `### 📋 5-Question Pop Quiz: ${course}
**Focus Topic:** ${t || "Machine Learning & Neural Network Foundations"} | **Total Marks:** 25

---

**Q1 (Multiple Choice - 3 Marks):**
What mathematical condition must a heuristic function $h(n)$ satisfy to guarantee that the A* Search algorithm always returns an optimal path?
* [A] $h(n) \\ge h^*(n)$ (Overestimation)
* [B] $h(n) \\le h^*(n)$ (Admissibility / Never overestimates the true cost to the goal)
* [C] $h(n) = 0$ for all non-goal nodes
* [D] $h(n)$ must strictly follow exponential decay
* **Correct Answer:** **[B]**
* *Explanation:* An admissible heuristic never overestimates the actual cost to reach the goal, ensuring that the first time a goal node is expanded, the path found is guaranteed to be optimal.

**Q2 (Multiple Choice - 3 Marks):**
Which activation function is most effective at preventing the vanishing gradient problem in deep hidden layers of neural networks?
* [A] Sigmoid function: $f(x) = \\frac{1}{1 + e^{-x}}$
* [B] Hyperbolic Tangent (Tanh)
* [C] Rectified Linear Unit (ReLU): $f(x) = \\max(0, x)$
* [D] Linear Step function
* **Correct Answer:** **[C]**
* *Explanation:* ReLU has a constant derivative of 1 for all positive inputs ($x > 0$), preventing gradients from decaying exponentially during backpropagation through deep layers.

**Q3 (Analytical Calculation - 6 Marks):**
A machine learning medical diagnostic model produces the following Confusion Matrix on a test set:
* **True Positives (TP):** 90
* **False Positives (FP):** 10
* **False Negatives (FN):** 5
* **True Negatives (TN):** 895

Calculate the **Precision** and **Recall (Sensitivity)** of this model:
* **Solution:**
  * $\\text{Precision} = \\frac{\\text{TP}}{\\text{TP} + \\text{FP}} = \\frac{90}{90 + 10} = 90.0\\%$
  * $\\text{Recall} = \\frac{\\text{TP}}{\\text{TP} + \\text{FN}} = \\frac{90}{90 + 5} = \\frac{90}{95} \\approx 94.74\\%$

**Q4 (Conceptual - 6 Marks):**
Explain why L2 Regularization (Ridge) shrinks weights toward zero without setting them to absolute zero, whereas L1 Regularization (Lasso) produces sparse weight vectors.

**Q5 (Code Implementation - 7 Marks):**
Write the mathematical vector update equation for weights $W$ and bias $b$ in Batch Gradient Descent given learning rate $\\alpha$, predictions $\\hat{Y}$, true labels $Y$, and dataset size $m$.`;
  }

  // ==================== 3. ASSIGNMENT GENERATOR ====================
  if (taskType === "assignment") {
    if (domain === "DSA") {
      return `### 📝 Assignment Problem Set: ${course}
**Course:** ${course} | **Total Marks:** 100 | **Deadline:** 7 Calendar Days
**Topic Focus:** ${t || "Self-Balancing AVL Trees, Graph Shortest Path & Dynamic Programming"}

---

#### Problem 1: Self-Balancing AVL Tree Rotations (35 Marks)
Implement a fully functional, self-balancing **AVL Tree** in C++ or Java:
1. Implement the node insertion routine maintaining height balancing.
2. Program all 4 rebalancing rotations:
   * Left-Left (LL Single Right Rotation)
   * Right-Right (RR Single Left Rotation)
   * Left-Right (LR Double Rotation)
   * Right-Left (RL Double Rotation)
3. Implement node deletion with automatic rebalancing propagation to the root.
4. **Deliverables:** Provide unit tests verifying that after inserting 1,000 random integers, the maximum tree height never exceeds $1.44 \\log_2(N + 2)$.

#### Problem 2: Shortest Path Routing with Dijkstra & Min-Heap (35 Marks)
Given a weighted, directed campus transit graph with $V$ junctions and $E$ pathways:
1. Implement **Dijkstra's Algorithm** using an adjacency list and a custom Min-Heap Priority Queue.
2. Analyze the runtime complexity: prove that the binary-heap implementation achieves $O((V + E) \\log V)$.
3. Extend the program to detect if negative edge weights are present and throw an explicit \`InvalidEdgeWeightException\`.

#### Problem 3: Dynamic Programming Matrix Chain Multiplication (30 Marks)
1. Write a program solving the **Matrix Chain Multiplication (MCM)** problem for a sequence of $n$ matrices $\\langle A_1, A_2, \\dots, A_n \\rangle$.
2. Implement both the recursive memoized top-down approach and the iterative bottom-up tabulation approach.
3. Print the optimal parenthesization string (e.g., \`((A1 x (A2 x A3)) x A4)\`) for the given matrix dimensions.`;
    }

    if (domain === "OS") {
      return `### 📝 Assignment Problem Set: ${course}
**Course:** ${course} | **Total Marks:** 100 | **Deadline:** 7 Calendar Days
**Topic Focus:** ${t || "Deadlock Avoidance, Producer-Consumer Semaphores & Paging"}

---

#### Problem 1: Banker's Algorithm Deadlock Avoidance in C (35 Marks)
Implement the **Banker's Algorithm** for Deadlock Avoidance in C:
1. Read the Allocation, Maximum, and Available matrices from a formatted configuration file.
2. Implement the Safety Algorithm to determine whether the system is currently in a safe state. If safe, output the complete execution sequence.
3. Implement the Resource-Request Algorithm: when process $P_i$ requests resources $Request_i$, determine if granting it immediately leaves the system in a safe state.

#### Problem 2: Multi-Threaded Producer-Consumer with Semaphores (35 Marks)
Implement a multi-threaded solution to the classic **Bounded Buffer Producer-Consumer Problem** in C using POSIX Threads (\`pthread\`) and POSIX Semaphores:
* Buffer capacity: 5 items.
* Threads: 3 Producer threads, 2 Consumer threads.
* Synchronization tools: Use \`sem_t empty\`, \`sem_t full\`, and \`pthread_mutex_t mutex\`.
* Guarantee freedom from race conditions and data corruption under continuous execution.

#### Problem 3: Virtual Memory Page Replacement Simulator (30 Marks)
Write a Python/C program that simulates Demand Paging on a memory reference trace of 10,000 addresses:
1. Implement the **FIFO (First-In-First-Out)** algorithm.
2. Implement the **LRU (Least Recently Used)** algorithm using an active timestamp doubly linked list.
3. Implement the **Optimal (OPT)** algorithm as an upper-bound benchmark.
4. Vary the available frame pool from 3 to 8 frames and plot Page Fault Rate vs Frame Count to observe **Belady's Anomaly** in FIFO.`;
    }

    if (domain === "NETWORKS") {
      return `### 📝 Assignment Problem Set: ${course}
**Course:** ${course} | **Total Marks:** 100 | **Deadline:** 7 Calendar Days
**Topic Focus:** ${t || "Socket Programming, Subnet Design & Packet Analysis"}

---

#### Problem 1: Multi-Client TCP Chat Server in Python (35 Marks)
Build a multi-client chat server using Python's \`socket\` and \`threading\` modules:
1. Server listens on port 8080 and handles up to 20 concurrent client connections.
2. When a client sends a message, broadcast it to all other connected clients with a timestamp.
3. Handle graceful client disconnections without crashing the server.

#### Problem 2: Enterprise Subnetting & CIDR Design (35 Marks)
EduReach University is allocated the CIDR block \`172.16.0.0/16\`. Design a VLSM subnet hierarchy for 4 departments:
* Computer Science Lab: 500 hosts
* Electronics Lab: 250 hosts
* Administrative Staff: 120 hosts
* Server Farm & WiFi Guest: 60 hosts
Provide the Network Address, Subnet Mask, Usable Host Range, and Broadcast Address for each department.

#### Problem 3: Wireshark Packet Capture & Protocol Analysis (30 Marks)
Capture network traffic using Wireshark and submit screenshots and analysis answering:
1. Locate the 3-Way TCP Handshake (SYN, SYN-ACK, ACK) and identify the sequence and acknowledgment numbers.
2. Analyze the difference in payload visibility between an unencrypted HTTP GET request and an HTTPS TLS handshake.`;
    }

    if (domain === "DBMS") {
      return `### 📝 Assignment Problem Set: ${course}
**Course:** ${course} | **Total Marks:** 100 | **Deadline:** 7 Calendar Days
**Topic Focus:** ${t || "Schema Normalization, Complex SQL & Concurrency"}

---

#### Problem 1: Relational Schema Normalization (35 Marks)
Consider the universal relation $R(A, B, C, D, E, F, G)$ with functional dependencies:
$$\\mathcal{F} = \\{ A \\rightarrow B,\\, BC \\rightarrow D,\\, D \\rightarrow E,\\, E \\rightarrow A,\\, F \\rightarrow G \\}$$
1. Find all candidate keys of relation $R$.
2. Determine the highest normal form satisfied by relation $R$.
3. Decompose $R$ into a collection of **BCNF** relations ensuring lossless-join decomposition. Specify which functional dependencies are preserved and which are lost.

#### Problem 2: Enterprise SQL Analytics & Query Tuning (35 Marks)
Given an e-commerce schema with tables \`Customers\`, \`Orders\`, \`OrderItems\`, and \`Products\`:
1. Write a query to find the top 3 customers who spent the highest total amount in each geographic region during Q3 2026.
2. Write a query to identify all products that were purchased together in the same order more than 50 times (Market Basket analysis).
3. Run \`EXPLAIN ANALYZE\` on your query and add appropriate B+ Tree indexes to eliminate full table scans.

#### Problem 3: Transaction Concurrency & Locking Simulation (30 Marks)
Implement a multi-threaded Python/Java simulation of a banking transfer between two accounts using explicit row-level locking (\`SELECT FOR UPDATE\`).
* Demonstrate how an uncoordinated transfer can trigger a deadlock.
* Implement a deadlock-free ordering protocol (e.g., always acquire locks in ascending order of Account ID) and verify zero deadlocks under 1,000 concurrent transfers.`;
    }

    // Default AIML Assignment
    return `### 📝 Assignment Problem Set: ${course}
**Course:** ${course} | **Total Marks:** 100 | **Deadline:** 7 Calendar Days
**Topic Focus:** ${t || "Search Algorithms, Supervised Learning & CNNs"}

---

#### Problem 1: Heuristic Search Implementation (30 Marks)
Implement the **A* Search algorithm** in Python to solve the classic 8-Puzzle sliding tile problem.
1. Formulate the state space, transition model, and goal test.
2. Implement and compare two heuristics:
   * $h_1(n)$: Number of misplaced tiles.
   * $h_2(n)$: Total Manhattan distance of all tiles to their goal positions.
3. **Deliverables:** Plot a comparison table showing total nodes expanded and execution time across 10 random solvable puzzle configurations. Prove mathematically that $h_2(n)$ dominates $h_1(n)$.

#### Problem 2: Vectorized Logistic Regression from Scratch (35 Marks)
Without using Scikit-Learn or any high-level machine learning library:
1. Write a Python class \`CustomLogisticRegression\` using only **NumPy**.
2. Implement:
   * Sigmoid activation: $\\sigma(z) = \\frac{1}{1 + e^{-z}}$
   * Binary Cross-Entropy loss function: $J(w, b) = -\\frac{1}{m} \\sum [y \\log(\\hat{y}) + (1-y)\\log(1-\\hat{y})]$
   * Vectorized gradient computation: $\\frac{\\partial J}{\\partial w} = \\frac{1}{m} X^T (\\hat{Y} - Y)$
3. Train on the provided student academic dataset and evaluate Accuracy, Precision, and Recall on an 80/20 train-test split.

#### Problem 3: Deep Learning & Computer Vision Case Study (35 Marks)
Design and train a Convolutional Neural Network (CNN) using PyTorch or TensorFlow for image classification on CIFAR-10.
* Architecture requirements: At least 3 Convolutional blocks with BatchNorm, ReLU, MaxPooling, and Dropout (0.3).
* Add L2 weight decay ($10^{-4}$) to mitigate overfitting.
* **Deliverables:** Submit training vs validation loss curves over 25 epochs and a confusion matrix analyzing the top 3 most confused classes.`;
  }

  // ==================== 4. COPILOT ADVICE GENERATOR ====================
  if (domain === "DSA") {
    return `### 💡 Faculty Copilot Recommendations for ${course}
**Inquiry / Topic:** ${t || "Data Structures, Algorithms & Problem Solving"}

---

1. **Teaching Analogy for AVL Tree Rotations:**
   * Compare tree balancing to a **two-pan mechanical balance scale**:
     * If the left pan is too heavy (Left-Left), perform a single right tilt.
     * If an elbow bend occurs (Left-Right zigzag), straighten the elbow first (Left Rotate child), then balance the scale (Right Rotate root).
   * Having students trace balance factor changes ($-1 \\to +2 \\to 0$) on graph paper solidifies the concept before writing C++ code.

2. **Tackling Common Student Pitfalls in Recursion:**
   * Over 60% of students struggle with tree recursion because they try to visualize all recursive calls simultaneously in their head.
   * *Pedagogical tip:* Teach them the **"Recursive Leap of Faith"** — assume the recursive calls on left and right subtrees already return the correct answer, and focus purely on the root node combination logic.

3. **Active Whiteboard Challenge:**
   * Start your class with a 5-minute Dijkstra trace challenge on an 8-node graph. Let two students race on the board. Active peer-instruction increases engagement by over 50%.

4. **Lab Alignment:**
   * Ensure students code the weekly tree and graph assignments within 48 hours of theory delivery to prevent conceptual decay.`;
  }

  if (domain === "OS") {
    return `### 💡 Faculty Copilot Recommendations for ${course}
**Inquiry / Topic:** ${t || "Operating Systems Concurrency & Memory Management"}

---

1. **Intuitive Analogy for Deadlocks & Semaphores:**
   * *Deadlock Analogy:* A gridlocked four-way traffic intersection where four cars arrive simultaneously, each needing the road space currently occupied by the vehicle to its left.
   * *Counting Semaphore Analogy:* A library with 5 private study rooms and a key rack with 5 keys. Entering takes a key (\`wait\`), exiting returns a key (\`signal\`). When empty, incoming students wait in a FIFO queue.

2. **Interactive Lab Demonstration:**
   * Run a live multithreaded C program with two threads incrementing a shared counter without a mutex 1,000,000 times.
   * Let students see the unpredictable count (e.g. 1,428,503 instead of 2,000,000). Experiencing a real race condition makes the necessity of atomic synchronization unforgettable!

3. **Curriculum Pacing:**
   * Virtual memory paging and TLB calculations require dedicated numerical practice. Dedicate one full recitation session to EMAT and page fault rate math before the mid-term examination.`;
  }

  if (domain === "NETWORKS") {
    return `### 💡 Faculty Copilot Recommendations for ${course}
**Inquiry / Topic:** ${t || "Computer Networks, Protocols & Lab Strategy"}

---

1. **Packet Encapsulation Envelope Analogy:**
   * Explain protocol layer encapsulation using the **Russian Matryoshka Doll** or nested envelope analogy:
     * Application Data &rarr; Sealed in Transport envelope (TCP port) &rarr; Sealed in Network envelope (IP address) &rarr; Sealed in Link envelope (MAC address).

2. **Live Wireshark Classroom Capture:**
   * Capture live DNS and HTTP packets in class. Filter by \`dns\` to show how a URL lookup translates to an IP address in under 15 milliseconds. Seeing live packets demystifies the entire protocol stack!

3. **Subnetting Mental Math Shortcuts:**
   * Teach students the **"Power of 2" anchor method** ($/24 = 256$, $/25 = 128$, $/26 = 64$, $/27 = 32$, $/28 = 16$). Students who memorize the block sizes calculate subnet ranges 3x faster on university exams.`;
  }

  if (domain === "DBMS") {
    return `### 💡 Faculty Copilot Recommendations for ${course}
**Inquiry / Topic:** ${t || "Database Architecture & Classroom Engagement"}

---

1. **Demystifying Complex Concepts (Normalization & BCNF):**
   * Use an intuitive spreadsheet analogy: show an unnormalized Excel table with repeated student names and phone numbers for every course enrolled.
   * Ask students: *"What happens if a student changes their phone number?"* (Update Anomaly). *"What if the only student in a course drops out?"* (Deletion Anomaly). This makes the motivation for 3NF and BCNF immediately obvious.

2. **Interactive Classroom Technique:**
   * Run live SQL query competitions using an interactive browser-based database terminal. Show the difference in execution time between an unindexed table scan ($O(N)$) and a B+ Tree index lookup ($O(\\log N)$) on a 1-million-row dataset.

3. **At-Risk Student Intervention:**
   * 4 students currently fall below the 75% attendance threshold in your DBMS lectures.
   * Recommendation: Post the SQL Joins cheat-sheet on the EduReach Course Materials tab and schedule an optional 15-minute tutorial before next week's lab.`;
  }

  // Default AIML Copilot
  return `### 💡 Faculty Copilot Recommendations for ${course}
**Inquiry / Topic:** ${t || "Pedagogical Delivery & Machine Learning Lab Strategy"}

---

1. **Intuitive Concept Explanation Strategy:**
   * When teaching **${t || "Machine Learning & Neural Networks"}**, start with visual geometric intuition before writing equations:
   * *Analogy for Gradient Descent:* Imagine a blindfolded hiker standing on a foggy mountain trying to find the valley floor by feeling the steepest slope beneath their feet.
   * *Analogy for Overfitting:* A student who memorizes past exam questions word-for-word but cannot solve a slightly rephrased question on the actual test.

2. **Hands-On Lab Alignment (Active Learning):**
   * Have students run live experiments with Google Colab or Jupyter notebooks where they intentionally introduce high variance (overfitting) by setting decision tree depth to infinity, and then watch the validation error spike.
   * Visualizing loss curves in real-time increases conceptual retention by over 45%.

3. **Curriculum Pacing Suggestion:**
   * Dedicate at least 2 full lecture hours to **Matrix Calculus and Vectorization** prior to introducing Backpropagation. Most students struggle with deep learning because of tensor dimensions rather than the underlying concepts.

4. **Student Assessment & Project Idea:**
   * Assign a mini-project where students must deploy their trained model behind a live REST API using FastAPI. This bridges the gap between pure academic math and real-world software engineering!`;
}
