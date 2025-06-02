# Aufgabenplaner
Jira: https://taskathon.atlassian.net/jira/software/projects/SCRUM/summary

Story Map: https://miro.com/welcomeonboard/ZW4zaXBPTm9rUTFRZ0NseG4vMnVtQm1STDB6akszdUpQVkFFSk5xci8zRmNrQUc4d2liUk54WnVSM3JlQVpCdWpDaVJaMS9PL1BtMFRHRG10dysyYXdEZDVVVVk3TXZhTW1YNUkyT2IvT1lHUExKUjVvUlFzdjhDdFZpTDJTVFZ0R2lncW1vRmFBVnlLcVJzTmdFdlNRPT0hdjE=?share_link_id=97173206759

## Table of Contents  
[Setting up the CI/CD-Pipeline (Windows)](#setting-up-ci-cd-pipeline-windows)
- [Installing Docker](#installing-docker)  
- [Setting up the GitLab-Runner in a Docker Container](#setting-up-gitlab-runner)

[Building the project manually](#building-the-project-manually)

[Starting an app container](#starting-an-app-container) 

## Setting up the CI/CD-Pipeline (Windows)
### <a name="setting-up-ci-cd-pipeline-windows"></a>

### Installing Docker
### <a name="installing-docker"></a>
In order too run the GitLab-Runner in a docker container we need to have docker installed.

#### Download Docker Desktop:

- Go to the official Docker website to download Docker Desktop for Windows: [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)

#### Run the Installer:

- Once the Docker Desktop installer is downloaded, double-click on the `.exe` file to start the installation.

- Follow the prompts in the installer. Make sure to check the option that says "Install required Windows components for WSL 2" (Windows Subsystem for Linux version 2) if it is prompted during installation. Docker Desktop relies on WSL 2 for Linux-based container support.


#### Restart the Computer:

- Once Docker Desktop is installed, restart your computer if prompted to do so.

#### Start Docker Desktop:

- After rebooting, Docker Desktop will automatically start.

- You can also open Docker Desktop by searching for `Docker Desktop` in the Start Menu.

#### Run Docker Command:

- Open a Command Prompt or PowerShell window and type the following command to verify that Docker is correctly installed:

    
    ```bash 
    docker --version
    ```
- If Docker is installed correctly, you should see the version of Docker that was installed, for example:

    ```nginx
    Docker version 20.10.7, build f0df350
    ```

### Setting up the GitLab-Runner in a Docker Container
### <a name="setting-up-gitlab-runner"></a>
GitLab-Runners are responsible for executing jobs within the CI/CD-Pipeline.
In this case we use the option of running the GitLab-Runner within a docker container. 
This means not having to install the runner itself locally.
Idealy this section will deprecate as soon as the runner can be hosted on AWS, ...

#### Creating a docker volume
```bash
docker volume create gitlab-runner-config
```

#### Getting and running the latest GitLab-Runner Docker Container
```bash
docker run -d --name gitlab-runner --restart always -v /var/run/docker.sock:/var/run/docker.sock -v gitlab-runner-config:/etc/gitlab-runner gitlab/gitlab-runner:latest
```
- Make sure the container is running by opening Docker Desktop and navigating to the `Container`-tab in the left sidebar.
- Here you should see a container named **gitlab-runner** with a green dot next to it indicating the container is running.
    
#### Register the GitLab-Runner
```bash
docker exec -it gitlab-runner gitlab-runner register
```
**Following you have to enter parameters to configure the runner:**

- *Enter the GitLab instance URL (for example, https://gitlab.com/):*

    `https://git.oth-aw.de/`

- *Enter the registration token:*
    
    `glrt-t3_Lx8fCRQtvR-FygP3aBd6`

- *Enter a name for the runner. This is stored only in the local config.toml file:*
    
    Confirm by pressing `Enter`.

- *Enter an executor: docker-autoscaler, instance, custom, ssh, virtualbox, docker-windows, docker+machine, kubernetes, shell, parallels, docker:*

    `docker`

- *Enter the default Docker image (for example, ruby:2.7):*

    `ruby:2.7`
#### Granting privileges to the GitLab-Runner
- Open Docker Desktop
- Navigate to the `Container`-tab in the left sidebar.
- Click on the `Name` of the **gitlab-runner** container.
- Navigate to the `Files`-tab within the container.
- Navigate to **etc > gitlab-runner**.
- Right-click on `config.toml` and select **Edit file**.
- In the newly opened file-editor scroll down to `privileged` and change its value from **false** to **true**.
- Save the change by pressing **Strg + S** or clicking in the saving-symbol in the top right corner of the file-editor.
- Close the file-editor.

## Downloading the docker image directly 
### <a name="downloading-the-docker-image-directly"></a>

### Getting the docker container
The available container versions can be found here: https://hub.docker.com/repository/docker/sebastianburesch/aufgabenplaner/general

- Pull a container:
```bash
docker pull sebastianburesch/aufgabenplaner:app-1.0
```

[Here](#starting-an-app-container) you can find information on how to start the container.

## Building the project manually
### <a name="building-the-project-manually"></a>

This section is meant to instruct on how to build the project locally into a docker container without relying on the CI/CD-Pipeline.
### Prerequisites
- Make sure you have [Docker Desktop installed](#installing-docker).
- You have installed a [Git client](https://git-scm.com/downloads).

### Cloning the repository
- Open Command Prompt or PowerShell window and navigate to the location you want to clone the repository to:
```bash
ls <path>/<to>/<desired>/<location>
```

- Clone the repository:
```bash
git clone https://git.oth-aw.de/softwareprojekt-gruppe-4/aufgabenplaner.git
```

- Change into the cloned repository:
```bash
cd aufgabenplaner
```

### Building the project to a docker image
```bash
# afterwards docker downloads all missing "layers" and images and builds a docker image.
# -t flag tags the image with "aufgabenplaner"
# . tells docker to look for the dockerfile in the current directory

docker build -t aufgabenplaner .
``` 

[Here](#starting-an-app-container) you can find information on how to start the container.

## Starting an app container
### <a name="starting-an-app-container"></a>
Now that you have an image, you can run the application in a container using the docker run command.

- Run your container using the `docker run` command and specify the name of the image you just created:
```bash
# -d (--detach) runs the container in the background
# -p (--publish) creates a port mapping between the host and the container

docker run -d -p 127.0.0.1:5000:5000 <image-name> #e.g. aufgabenplaner
```
- Wait  a few seconds.
- Open your web browser to http://localhost:5000.

For more information visit https://docs.docker.com/get-started/workshop/02_our_app/.

