<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest
  
  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications, heavily inspired by <a href="https://angular.io" target="blank">Angular</a>.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://api.travis-ci.org/nestjs/nest.svg?branch=master" alt="Travis" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://img.shields.io/travis/nestjs/nest/master.svg?label=linux" alt="Linux" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#5" alt="Coverage" /></a>
<a href="https://gitter.im/nestjs/nestjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge"><img src="https://badges.gitter.im/nestjs/nestjs.svg" alt="Gitter" /></a>
<a href="https://opencollective.com/nest#backer"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec"><img src="https://img.shields.io/badge/Donate-PayPal-dc3d53.svg"/></a>
  <a href="https://twitter.com/nestframework"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ yarn
```
## Local Development
This app currently uses AWS KMS for encryption and requires that the AWS CLI is installed/configured.
After installing the AWS CLI, configure it to use your credentials:
```shell
$ aws configure
AWS Access Key ID [None]: <YOUR_AWS_ACCESS_KEY_ID>
AWS Secret Access Key [None]: <YOUR_AWS_SECRET_ACCESS_KEY>
Default region name [None]: <YOUR_AWS_REGION>
Default output format [None]: json
```
Next start the database:
```bash
# Start database
docker-compose up
```

Sample app config is available in `.env.example`.  Copy this to a new file that is ignored by version control:  
  
```bash
# Copy config to a file that's ignored by version control
cp .env.example .env
```

Finally, run the app:
```bash
# watch mode
yarn dev
```
If you see errors about missing config values, ask your team members for any missing secrets.

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn dev

# production mode
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

  Nest is [MIT licensed](LICENSE).
  
## Roadmap
BE App Framework
- [x] API (GQL)
- [x] DRY models (nest)
- [x] ORM (typeorm)
- [x] Reusable resolvers (for typeorm)
- [x] N+1 problem (for typeorm queries, single sql query per gql query)
- [x] Role-based authorization
- [x] Dependency injection
- [x] Owned-record and other advanced authorization schemes
- [x] Authentication (email/password, oauth2, store/revoke tokens)
- [x] Resolver with REST data source
- [x] Env config (@nestjs/config)
- [ ] Query pagination
- [ ] Query filtering
- [ ] Query sorting
- [ ] File upload (streaming?)
- [ ] File download (non-gql REST endpoint?)
- [ ] Subscriptions (instead of FE polling where live data is desired)
- [ ] Logging
- [ ] Observability (e.g. latency stats, error counts, etc)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Forgot password flow (email sender?)
- [x] Encrypted db field (e.g. ssn)

BE Infra
- [x] Dockerize
- [x] RDMS (postgres on AWS RDS)
- [x] Set up k8s on AWS (EKS)
- [x] CI/CD


FE App Framework
- [x] React
- [x] GQL client lib (apollo)
- [x] State management (mobx state tree?)
- [ ] Hooks
- [x] Email/password authentication flow
- [ ] Oauth2 authentication flow
- [ ] Collection views (posts/comments/users)
- [x] Styling framework
- [ ] Subscriptions (depends on BE scheme)
- [ ] Testing

FE Infra
- [x] Static file server (s3? cdn?)
- [x] CI/CD