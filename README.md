<div align="center" style="margin-bottom:20px">
  <img style="width: 250px" src="assets/logo.png" alt="booking-microservices-nestjs" />
  <h2 style="font-weight:700">My Collection</h2>
    <div align="center">
                       <a href="https://github.com/dungcodejob/my-collection/blob/production/LICENSE.md"><img src="https://img.shields.io/github/license/dungcodejob/my-collection?color=%234275f5&style=flat-square"/></a>
    </div>
</div>
           
> **A modern and efficient web bookmark application for organizing and managing your favorite links with advanced features like categorization, tagging, sharing, and more.** 🚀

> 💡 **This project focuses on providing a user-friendly interface and robust functionality to enhance your bookmarking experience.**

# Table of Contents

- [The Goals of This Project](#the-goals-of-this-project)
- [Plan](#plan)
- [Technologies - Libraries](#technologies---libraries)
- [How to Use Migrations](#how-to-use-migrations)
- [How to Run](#how-to-run)
  - [Docker-Compose](#docker-compose)
  - [Build](#build)
  - [Run](#run)
  - [Test](#test)
- [Documentation Apis](#documentation-apis)
- [Support](#support)
- [License](#license)

## The Goals of This Project

- :sparkle: Provide a seamless and intuitive user experience for bookmarking.
- :sparkle: Enable efficient organization and management of bookmarks with tags and folders.
- :sparkle: Support user authentication and secure access to bookmarks.
- :sparkle: Facilitate easy sharing and collaboration on bookmark collections.
- :sparkle: Integrate with popular web browsers for convenient bookmarking.
- :sparkle: Ensure data security and privacy for users.

## Plan

> 🌀This project is a work in progress, new features will be added over time.🌀

High-level plan is represented in the table

| Feature           | Status         |
| ----------------- | -------------- |
| **Sign Up/Login:** Allow users to create accounts and log in securely  | Completed ✔️   |
| **OAuth Integration:** Support for logging in via Google, Facebook, etc    |   |
| **Add/Edit/Delete Bookmarks:** Users should be able to easily add, edit, and delete bookmarks | Completed ✔️   |
| **Categorization/Tags:** Allow users to categorize bookmarks with folders or tags for better organization.   | Completed ✔️   |
| **Search and Filter:** Feature to find bookmarks and filters to sort them based on date, tags, popularity, etc   |    |
| **Responsive Design**: Ensure the application works well on both desktop and mobile devices   |    |
| **Drag-and-Drop:** Enable drag-and-drop functionality for organizing bookmarks   | Completed ✔️   |
| **Customization:** Allow users to customize the look and feel of their bookmark lists   |    |
| **Import/Export:** Allow users to import bookmarks from other services (e.g., browser bookmarks, Pocket)   |    |
| **Sharing Options:** Enable users to share bookmarks or folders with others via email or social media   |    |
| **Collaborative Lists:** Allow multiple users to collaborate on a shared list of bookmarks   |    |
| **Usage Statistics:** Provide insights into bookmark usage, such as most visited bookmarks, popular tags, etc   |    |
| **Broken Link Checker:** Automatically check for and notify users about broken or outdated links   |    |
| **Cloud Sync:** Allow bookmarks to sync across multiple devices using cloud storage   |    |
| **Browser Extensions:** Develop extensions for popular browsers (Chrome, Firefox, etc.)   |    |
| **Mobile App:** Create a mobile application for on-the-go bookmarking and access   |    |
| **Integration with Other Services:** Integrate with other productivity tools (e.g., Trello, Evernote)   |    |




## Technologies - Libraries
- ✔️ **[`microsoft/TypeScript`](https://github.com/microsoft/TypeScript)** - TypeScript is a language for application-scale JavaScript.
- ✔️ **[`eslint/eslint`](https://github.com/eslint/eslint)** - ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code
- ✔️ **[`prettier/prettier`](https://github.com/prettier/prettier)** - Opinionated Code Formatter

### Client
- ✔️ **[`angular/angular`](https://github.com/angular/angular)** - A platform for building mobile and desktop web applications.
- ✔️ **[`ngrx/signals`](https://github.com/ngrx/signals)** - Reactive state management using signal for Angular applications.
- ✔️ **[`ng-icons`](https://github.com/ng-icons/ng-icons)** - A library of customizable icons for Angular applications.
- ✔️ **[`spartan-ng/ui`](https://github.com/goetzrobin/spartan)** - A collection of high-quality UI components for Angular.
- ✔️ **[`tailwindcss`](https://github.com/tailwindlabs/tailwindcss)** - A utility-first CSS framework for rapidly building custom designs.

### Server
- ✔️ **[`nestjs/nest`](https://github.com/nestjs/nest)** - Nest is a framework for building efficient, scalable Node.js server-side applications
- ✔️ **[`nestjs/cqrs`](https://github.com/nestjs/cqrs)** - A lightweight CQRS module for Nest framework (node.js)
- ✔️ **[`nestjs/swagger`](https://github.com/nestjs/swagger)** - OpenAPI (Swagger) module for Nest
- ✔️ **[`nestjs/jwt`](https://github.com/nestjs/jwt)** - JWT utilities module for Nest framework.
- ✔️ **[`mikro-orm`](https://github.com/mikro-orm/mikro-orm)** - TypeScript ORM for Node.js based on Data Mapper, Unit of Work, and Identity Map patterns.
- ✔️ **[`nestjs/passport`](https://github.com/nestjs/passport)** - Passport utilities module for Nest
- ✔️ **[`cheerio`](https://github.com/cheeriojs/cheerio)** - Fast, flexible, and lean implementation of core jQuery designed specifically for the server.
- ✔️ **[`class-transformer`](https://github.com/typestack/class-transformer)** - Library to transform plain object to class instances and vice versa.
- ✔️ **[`uuid`](https://github.com/uuidjs/uuid)** - Simple, fast generation of RFC4122 UUIDS.
  
## How to Use Migrations
> Note: For easy using of migrations commands in typeorm, I add some scripts in `package.json` and base on these scripts we can use below commands to generate and run migrations easily.

For `generating` a new migration use this command in the root of each microservice:

```bash
npm run migration:generate -- src/data/migrations/new-migration-name
```

Also for `running` migration use this command in the root of each microservice:
```bash
npm run migration:run  
```

## How to Run


> ### Docker Compose

Use the command below to run our `infrastructure` with `docker` using the [infrastructure.yaml](./deployments/docker-compose/infrastructure.yaml) file at the `root` of the app:

```bash
docker-compose -f ./deployments/docker-compose/infrastructure.yaml up -d
```
##### Todo
I will add `docker-compsoe` for up and running whole app here in the next...

> ### Build
To `build` each microservice, run this command in the root directory of each microservice where the `package.json` file is located:
```bash
npm run build
```

> ### Run
To `run` each microservice, run this command in the root of the microservice where `package.json` is located:
```bash
npm run dev
```

> ### Test

To `test` each microservice, run this command in the root directory of the microservice where the `package.json` file is located:
```bash
npm test
```

### Documentation Apis

Each microservice has a `Swagger OpenAPI`. Browse to `/swagger` for a list of endpoints.

As part of API testing, I created the [booking.rest](./booking.rest) file which can be run with the [REST Client](https://github.com/Huachao/vscode-restclient) `VSCode plugin`.

# Support

If you like my work, feel free to:

- ⭐ this repository. And we will be happy together :)

Thanks a bunch for supporting me!


## Project References & Credits

- [https://github.com/angular/angular](https://github.com/angular/angular)
- [https://github.com/nestjs](https://github.com/nestjs)


## License
This project is made available under the MIT license. See [LICENSE](https://github.com/dungcodejob/my-collection/blob/production/LICENSE.md) for details.
