# DDoS Mitigation Literature Review
John Hurtubise - Beshir Said - Feraidon AdbulRahimzai

## John Hurtubise

## Important Implimentation Question
Can we use a single virtualized machine to accurately simulate DDoS mitigations and attacks? 

### Use in project
While this would be a valid way to simulate DDoS attacks it limits us in the types of attacks we are able to study/impliment and also makes finding less acadamically valid. Due to this I would like to explore a 2-3 seperate machine approach while will produce more valid results while also remaining simple in implimentation.

### Citations and papers:
#### Virtually the Same: Comparing physical and virtual testbeds

https://arxiv.org/abs/1902.01937

Comments: Using a single virtualized host is able to measure and replicate somethings while it fails to accurately replicate others. High level behavior such as application responses and OS patterns can be affectively replicated but network concepts such as packet latency and throughput cannot be replicated. Another problem is HyperVisor scheduling and virtual network stack buffering. While we are able to separate hardware resources providing a valid seperation of application load we may run into problems due to CPU scheduling causing bottlenecks even when underlying resources are not saturated. 

In general a single machine would allow us to make high level generalizations but would be more difficult to argue/prove in a academic context.

## Question 1

Current research currently focuses on one mitigation technique at time. In practice multiple techniques across layers (L7, L4, L3) are used to defend and detect attacks. Our research combines various forms to mitigations techniques to examine interactions between mitigation techniques and their affects on effectiveness. 

### Citations and relavent papers
#### Mechanics in DDoS: A Study of Layer 4 and Layer 7 Threat Vectors

[https://www.scitepress.org/Papers/2025/135932/135932.pdf](https://www.scitepress.org/Papers/2025/135932/135932.pdf#:~:text=impact%20on%20network%20latency%2C%20downtime%2C,each%20attack%20type%2C%20providing%20valuable)

Comments: While this paper employs a number of mitigation techniques: Rate limiting/Traffic Shaping, AI-Based intrusion Detection, Load balancers and CDN utilization, and behavioral traffic analysis, attack types are tested in isolated setups but mitigations are used together. While they use multiple mitigation techniques together the paper fails to evaluate different mitigation combinations or interactions within systems. The paper takes a broad approach focusing on attack types and overall system affects.  

#### Cybersecurity Defense Mechanism Against DDoS Attack with Explainability 

https://mesopotamian.press/journals/index.php/CyberSecurity/article/view/678/534

Comments: This paper explores ML based mitigation techniques that employ specific mitigation techniques depending on the assessed attack. For instance IP banning on L3 attacks and CAPTCHA on L7. The paper focuses on the ability of the ML approach to asses attacks and extracting explainability from the model. It again fails to analyze mitigation techniques together focusing on ML. 

#### A Comprehensive Survey of DDoS attack defense systems for different SDN architectures

https://www.sciencedirect.com/science/article/pii/S1389128625006772#:~:text=security%20issues%20and%20defense%20solutions,These%20surveys%20offer%20detailed

Comments: While this paper explores various mitigation stacks this paper focuses on adaption of mitigation systems based on the system network architecture. It explores various attacks across these attacks and how they fit into SDN architectures. Again the paper fails to address affects between mitigation techniques/layers.

## Question 2

What metrics and visualizations assist in real-time responses? A significant amount of current research employs ML based models to detect and assist in DDoS detection and mitigation. Furthermore, some research is trying to increase explainability within these ML approaches. Extending this research our team will create a real-time dashboard to explore the various features/metrics which are currently used in real-time DDoS detection systems to analyze feature importance and increase explainability.

### Citations and papers
#### Enhancing DDoS Detection: A Novel Real-World Dataset for Generalizable Cross-Domain Training

https://www.sciencedirect.com/science/article/pii/S1389128625006772

Comments: A common problem in this research area is simulating real world DDoS attacks effectively. This paper proposes a new dataset which is more up to date and real-world. This article is relevant as it touches on concepts such as feature importance and observability in DDoS detection and mitigation techniques.

#### Real-Time DDoS flood attack monitoring and detection (RT-AMD) model for cloud computing

https://pmc.ncbi.nlm.nih.gov/articles/PMC9202629/

Comments: This paper focuses on ML based detection systems in cloud computing contexts. Through this analysis the researchers explore various features which are important in detecting attacks in real time while giving limitations of features/approaches.

--
## Beshir Said 

### Detecting transport/network-layer DDos flooding attacks in real time (Q2)
https://pmc.ncbi.nlm.nih.gov/articles/PMC9202629/#sec5 

Comments: Presents a viable ML pipeline for real-time detection of network/transport flooding attacks. The study trains and compares various algorithms on their DDoS-2020 dataset, reporting a very high detection accuracy in cloud testing

Use for our project: This would give us a concrete model for what our dashboard should show such as packet-rate/ flow rate over short windows, detection confidence, etc. It also confirms that simple streamable features can be enough to detect volumetric floods.

Limitations: Focuses on detection, not on mitigation effectiveness or interaction between L3/L4/L7 defenses. Cloud and ML-centric and also accuracy may not translate directly to our specific traffic or attack tooling.


### How can ddos attacks be detected in real time with minimal packet-level information (Q2)
https://www.sciencedirect.com/science/article/pii/S2215098622000842 

Comments: Compares multiple models for detecting flooding DDos in Software-Defined Networking (SDN) using lightweight, easily collected features( packets in/flow fluctuation over time slots). Validates results and a SDN test.

Use for our project: This would be a good baseline for real-time observability and feature selection as it supports our plan to log metrics and visualize early-warning indicators.

Limitation: SDN-specific and detection centric.Does not address mitigation strategies or deployment in non-SDN architectures.

### How DDos attacks can be detected accurately and quickly in real time using minimal packet-level information (Q2)
https://www.computer.org/csdl/journal/su/2025/02/10549828/1Xx5uwIPKcU 

Comments: Shows that DDos attacks can be detected accurately using simple real time metrics such as packet/ flow counts over short time windows. Detection in offline and online datasets with an ~99% accuracy. Validated in real testbeds.

Use for our project: supports the use of easily observable metrics. Good baseline to check mitigator and supports early-warning detection.

Limitations: Focuses solely on detection, not mitigation. SDN-centric. mainly effective for flooding/volumetric attacks.







--
