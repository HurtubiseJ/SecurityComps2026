# Security Comps Winter 2026
## Team

This project was developed by:

- **Feraidon AbdulRahimzai**
- **John Hurtubise**
- **Beshir Said**

---
## Project Overview

This repository contains the work for our **Security Comps (Winter 2026)** project.

Our project focuses on building a **DDoS mitigation testing environment** that allows us to simulate distributed denial-of-service attacks and evaluate how different defense techniques perform in practice.

Denial of Service (DoS) attacks occur when a system is overwhelmed with malicious traffic, preventing legitimate users from accessing services. Our system recreates this scenario in a controlled environment so we can observe both the **attacker perspective and the defensive mechanisms used to mitigate attacks**. :contentReference[oaicite:0]{index=0}

The goal of this project is to better understand how different layers of defense interact, including:

- Network-layer mitigations 
- Application-layer defenses
- Reverse proxy filtering
- Traffic monitoring and logging
- Attack simulation using distributed attacker nodes

Our testbed allows us to generate attack traffic, route it through a proxy defense layer, and measure how well the backend target system handles legitimate requests during an attack.

---
Link to presentation: https://www.figma.com/deck/6T84Oh5Xp50c284qefc9a2 
