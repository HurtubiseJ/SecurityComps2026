# CONTRIBUTING for DDoS Project

## Application Level

## Folder Structure
**ALL** files/folders related to the project **MUST** be within the `/project` directory. 

### `nodes`
Each folder within `nodes` represent a different **Node** within the network. **ALL** functionality **MUST** be contained within the corresponding project folder.

Configuration files exists in project root. Application logic is within app/ folder.
**SEE `/nodes/target1/`** 

- `MASTER_CONFIG.json` contains the configuration for a given node. 
- `.env.<node>` environment file for node
- `requirements.txt` Node requirements
- `dependencies.txt` Outlines external dependencies for the NODE. Ex. PostgresQL (target) NGinx (proxy) 
- `Dockerfile` Per process isolation and setup
- `docker-compose.yaml` Configures multiple processes ON THE SAME MACHINE. Ex: Proxy - FastAPI + NGinx

### `shared`
This folder contains functionality which is used across 2 or more nodes in the network. 
Ex. node_monitoring which is present on all nodes. 


## Version Control
This REPO uses **Git Feature Branch** version control. Please read through the following resource.
> https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow

***ALWAYS*** run git status to check for upadate of your branch. Also just changes to version remote frequently.

As a short refresher/overview:

##### Main Branch
The "main" branch is reserved for production ready release builds. Most of the time this all commits to
this branch will be production releases that are actually deployed. This will be slightly more lax in the beginning.

**MUST Follow on Main**
Rules for Main: 
- All main commits **MUST** build, deploy, and contain all core functionality
- All main commits **MUST** be able to be production ready, although they may no be deployed
- All main commits **MUST** contain a corresponding tag with the release version Ex. "Release 1.0" **IF AND ONLY IF** this main commit is being deployed to production.
- All main commits **MUST** reference the **PRODUCTION** branch of supabase
- All main commits **MUST NOT** be debug or contain extrainious print statements

##### Feature Branches
Feature branches is where you will be doing your own work. Feature branches correspond to a specific deliverable/feature that we are aiming to impliment. 

**General rules, there are exceptions**
Rules for feature branches:
- In almost all cases you will own a feature branch end-to-end, from pull to merge. 
- In most cases you will pull from the main branch even if work is/has been done in other branches.
    - Only pull from branches if updated code is needed
- Features will usually correspond to a new ./core folder, if not discuss before pull
- Feature branches **MUST** follow the core naming convention Ex: If we are developing a core feature where the top level folder is playerSchoolMatching. The name of the branch **MUST** be 
feature/playerSchoolMatching

## File Naming

## Coding Conventions