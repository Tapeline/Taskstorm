![Taskstorm Logo](.assets/taskstorm-color-plate.png)

**Taskstorm** - A universal and collaborative task-tracker. 

![GitHub License](https://img.shields.io/github/license/Tapeline/Taskstorm)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/Tapeline/Taskstorm/deploy.yml)
![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/Tapeline/Taskstorm)

<!-- TOC -->
  * [Features](#features)
    * [Upcoming:](#upcoming)
  * [Deploying](#deploying)
    * [Requirements](#requirements)
    * [Running](#running)
    * [Providing SSL certificate](#providing-ssl-certificate)
    * [Launching without SSL certificate (local only)](#launching-without-ssl-certificate-local-only)
  * [Docs](#docs)
  * [Tech stack](#tech-stack)
    * [Backend](#backend)
    * [Frontend](#frontend)
    * [Other](#other)
  * [Screenshots](#screenshots)
  * [Developer](#developer)
  * [License](#license)
<!-- TOC -->

## Features
- Workspace system to separate tasks for different projects
- Task tags and categories
- GitLab-style tag filtering for tasks
- Workflow stages to differentiate readiness statuses
- Customizing task list that should be notification targets
- Auto-closing tasks that are moved to stage that counts as
  finish
- Commenting tasks
- GitLab-style activity list in tasks
- GitHub-flavored Markdown in task descriptions and comments
- Kanban board
- Documents with live collaborative rich-text editing
- Calendar for user's tasks
- Statistics in profile
- Task recommendation

### Upcoming:
- [ ] Notification caching
- [ ] Linked and child tasks

## Deploying
### Requirements
- Docker (w/ Docker Compose)

### Running
Taskstorm is using Docker Compose for deployment, so 
you can just clone this repo and start containers:
```sh
git clone https://github.com/Tapeline/Taskstorm.git
cd Taskstorm
docker compose up -d
```
Except you should provide SSL certificate and then access web interface via standard 443
browser port.

Also do not forget to provide environment variables:
- `VAPID_PUBLIC` and `VAPID_PRIVATE` - VAPID keys. They are
  needed for webpush notifications to work properly.
- `SECRET_KEY` - API secret key (signing JWT, etc.)

### Providing SSL certificate
SSL certificate files should be placed in `~/sslcert/` 
directory. For example, using a LetsEncrypt cert:
```
~/
|- sslcert
   |- fullchain.pem
   |- privkey.pem
```
> **Attention!**
> Taskstorm is configured to use exactly these file names.
> If they differ, you can:
> 1. Rename them
> 2. Create a symbolic link with other name
> 3. Configure Nginx service in `docker-compose.yml` to
>    use different files

### Launching without SSL certificate (local only)

If you want to test Taskstorm on your machine, you might
not want to provide SSL cert. In this case, you can use
this command:
```shell
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d
```

## Docs
[Link to docs](docs/index.md)

## Tech stack
### Backend
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=green)
![DRF (Django Rest Framework)](https://img.shields.io/badge/django--rest--framework-3.14.0-blue?style=for-the-badge&labelColor=333333&logo=django&logoColor=white&color=blue)
![Celery](https://img.shields.io/static/v1?style=for-the-badge&message=Celery&color=37814A&logo=Celery&logoColor=FFFFFF&label)
![RabbitMQ](https://img.shields.io/badge/-rabbitmq-%23FF6600?style=style=for-the-badge&logo=rabbitmq&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Django Channels](https://img.shields.io/badge/-Django_Channels-46a2f1?style=for-the-badge&logo=Django)
![Postgres](https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white)
### Frontend
![React.js](https://shields.io/badge/react-black?logo=react&style=for-the-badge)
![Vite](https://img.shields.io/badge/-Vite-%23646CFF?style=for-the-badge&logo=vite&logoColor=ffffff)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)
### Other
![Nginx](https://img.shields.io/badge/NGINX-009639?style=for-the-badge&logo=NGINX&logoColor=white)
![Docker](https://img.shields.io/badge/Tech-Docker-informational?style=for-the-badge&logo=docker&color=2496ED)

## Screenshots
![](.assets/task_list.png)
![](.assets/task_detail.png)
![](.assets/kanban.png)
![](.assets/docs.png)
![](.assets/profile.png)

## Developer
Project is being developed by [@Tapeline](https://www.github.com/Tapeline)

## License
This work is licensed under GNU General Public License v3.0
