# Grizzlar, a fork of Bearer/Pizzly

This project is a fork of [Bearer/Pizzly](https://github.com/Bearer/Pizzly) - which is no longer maintained by the original author.

## New features added in Grizzlar

1. Added support for AWS Lambda, just set the environment variable to lambda in your Lambda configuration
2. Added support for AWS Elastic Beanstalk.

## Bug fixes

1. Upgraded the Slack integration to support the latest API v2.
2. Allowing the MailChimp proxy to specify MailChimp data center. When making an API call to the MailChimp proxy, add a "Chimp-Dc" header in the request, with the value being the MailChimp data center name(us1, us2, etc.).

---

<a href="https://heroku.com/deploy?template=https://github.com/wayneshn/grizzlar" rel="nofollow"><img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy to Heroku" height="26"></a>
<a href="https://console.platform.sh/projects/create-project/?template=https://github.com/wayneshn/grizzlar&utm_campaign=deploy_on_platform?utm_medium=button&utm_source=affiliate_links&utm_content=https://github.com/wayneshn/grizzlar" rel="nofollow"><img src="https://platform.sh/images/deploy/deploy-button-lg-blue.svg" alt="Deploy with Platform.sh" height="26"></a>
<a href="https://www.bearer.com/?ref=pizzly"><img src="/views/assets/img/badges/bearer-badge.png?raw=true" alt="The #1 data security as code platform" height="26"></a>

# Grizzlar 🐻 - An OAuth Integration Proxy

<div align="center">

<img src="/views/assets/img/logos/grizzlar.jpg" width="300">

[How it works?](#how-it-works) - [Getting started](#getting-started) - [Documentation](#documentation)  
[Examples](#examples) - [Supported APIs](#supported-apis) - [Contributing](#contributing)

</div>

**Grizzlar makes it fast and reliable to build API integrations**. It allows you to integrate your app with any third-party platforms that use OAuth2. Think of something like Zapier, allowing users to connect their third-party accounts to your app and enabling your app to perform actions on behalf of the user.

Currently, the project allows you to integrate with dozens of services like Slack, Google Sheets, Hubspot, Linkedin, and Twitter. But it is very easy for you to add your own integration -- as simple as a JSON configuration file.

# Orignal Pizzly Readme file

The following is the original Pizzly Readme file. It allows you to get started quickly with Grizzlar as we prepare for our own version.

## How it works?

At the heart of Pizzly is a Node.js application that uses PostgreSQL as a database. Once deployed on your servers, each instance of Pizzly provides multiple tools to help developers with their API integrations, including:

- **a dashboard** - _to enable and configure APIs_;
- **an auth service** - _to handle the OAuth-dance_;
- **a proxy** - _to perform authenticated requests to an API_;
- a JS library - _to connect a user and perform requests from your frontend_;
- and its own API - _to programmatically do what you can do with the dashboard_.

[![Integrate with many APIs, right from Pizzly's dashboard](views/assets/img/docs/pizzly-dashboard-all-apis.png?raw=true)](https://demopizzly.herokuapp.com/dashboard/all)

## Getting started

Pizzly can be installed anywhere (AWS, Heroku, Platform.sh, etc.). Here's a quick guide:

1. First, deploy your own instance of Pizzly by clicking a deploy button below:

   | Heroku                                                                                                                                                                                                                  | Platform.sh                                                                                                                                                                                                                                                                                                                                                                         |
   | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | <a href="https://heroku.com/deploy?template=https://github.com/Bearer/Pizzly" rel="nofollow" target="_blank"><img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy to Heroku" width="184" height="40"></a> | <a href="https://console.platform.sh/projects/create-project/?template=https://github.com/Bearer/Pizzly&utm_campaign=deploy_on_platform?utm_medium=button&utm_source=affiliate_links&utm_content=https://github.com/Bearer/Pizzly" rel="nofollow"><img src="https://platform.sh/images/deploy/deploy-button-lg-blue.svg" alt="Deploy with Platform.sh" width="180" height="40"></a> |

2. Once deployed, open your app. You will land on Pizzly's dashboard.
3. Click on "Open Dashboard" and select the API you want to integrate with.
4. Now, configure the API by entering your credentials and scopes. That's all it takes to configure a new API.
5. To connect a user to this API, _in your frontend_, install [`pizzly-js`](src/clients/javascript):

   ```bash
   npm install pizzly-js
   ```

6. Then open your frontend app and copy-paste the following code:

   ```js
   import Pizzly from 'pizzly-js'

   const pizzly = new Pizzly({ host: 'pizzly.example.org' }) // Initialize Pizzly
   const myAPI = pizzly.integration('xxx-api-name') // Replace with the API slugname

   myAPI
     .connect()
     .then(({ authId }) => console.log('Sucessfully connected!', authId))
     .catch(console.error)
   ```

   This snippet code will open a popup in your browser to start an authorization flow with the provided API. On success you will obtain an `authId` which will be be used in the next step.

7. _In your frontend again_, use the previously obtained `authId` to perform a request to the API using the code below:

   ```js
   myAPI
     .auth('xxx-auth-id') // Replace with the authId previously obtained
     .get('/xxx-endpoint') // Replace with a valid endpoint of the API
     .then(response => console.log(response))
     .catch(console.error)
   ```

   This example will perform a GET request to `/endpoint` of the API and will use the provided authId to authenticate the request.

## Documentation

Guides, tutorials and references are all available on the [Docs](/docs).

## Examples

We have several examples [in the docs](/docs/examples.md) with different APIs. Here is the first one to get you started:

```js
const pizzly = new Pizzly({ host: 'pizzly.example.org' }) // Initialize Pizzly
const github = pizzly.integration('github')

github
  .connect() // Connect to GitHub
  .then(({ authId }) => console.log('Sucessfully connected! with the authId:', authId))
  .catch(error => console.error('It failed!', error))
```

This example will trigger an OAuth dance to the GitHub API.

💡 You'll notice that when a user is successfully connected, we received an `authId`; it's a power concept introduced by Pizzly. The `authId` acts as a reference to the OAuth payload (i.e. the `access_token` and `refresh_token`). While the `access_token` and `refresh_token` expire and/or change over time, the `authId` is always the same. Think of it as something like a user identity.

## Supported APIs

[![Some pre-configured APIs with Pizzly](/views/assets/img/docs/pizzly-preconfigured-apis.jpg)](/docs/supported-apis.md)

More than 50 APIs are preconfigured to work out-of-the-box. Including:

- **Communication**: Gmail, Microsoft Teams, Slack, Zoom;
- **CRM**: Front, Hubspot, Salesforce, etc.
- **Developer tools**: BitBucket, GitHub, GitLab, etc.
- **Finance**: Xero, Sellsy, Zoho Books, etc.
- **Productivity**: Asana, Google Drive, Google Sheets, Jira, Trello, etc.
- **Social**: Facebook, LinkedIn, Reddit, etc.
- **[and more...](/docs/supported-apis.md)**

Each API consists of a JSON configuration file, stored within the `/integrations` directory. Here's an example with the GitHub configuration file ([`/integrations/github.json`](/integrations/github.json)):

```json
{
  "name": "GitHub",
  "auth": {
    "authorizationURL": "https://github.com/login/oauth/authorize",
    "tokenURL": "https://github.com/login/oauth/access_token",
    "authType": "OAUTH2",
    "tokenParams": {},
    "authorizationParams": {},
    "auth": { "accessType": "offline" }
  },
  "request": {
    "baseURL": "https://api.github.com/",
    "headers": {
      "Accept": "application/vnd.github.v3+json",
      "Authorization": "token ${auth.accessToken}",
      "User-Agent": "Pizzly"
    }
  }
}
```

And adding new APIs is straightforward. Just create a new configuration file within the `/integrations` folder of your Pizzly's instance. If you feel like sharing, you can even create a PR so that other developers will be able to use it as well!

## Why Pizzly?

Pizzly originally started at Bearer as a way to simplify the developer's journey and ease the building of API integrations. OAuth is a great framework, but the difficulty and wide range of implementation makes it painful to use and tends to slow down the ability to integrate with new APIs.

_But seriously, why Pizzly? We're fan of bears and fell in love with this [sweet hybrid](https://en.wikipedia.org/wiki/Grizzly–polar_bear_hybrid) one 🐻_

## Contributing

While Pizzly is actively backed by Bearer's engineering team, the main purpose of this repository is to continue to improve Pizzly, making it larger and easier to use. We are grateful to each contributors and encourage you to participate by reporting bugs, ask for improvements and propose changes to the code.

### Covenant Code of Conduct

Pizzly has adopted the Contributor Covenant Code of Conduct (version 2.0), available at https://www.contributor-covenant.org/version/2/0/code_of_conduct.html. We expect project participants to adhere to.

### Contributing Guide

All work on Pizzly happens directly on [GitHub](https://github.com/bearer/pizzly). Both Bearer.sh team members and external contributors send pull requests which go through the same review process. Submit all changes directly to the [`master branch`](https://github.com/bearer/pizzly/tree/master). We don’t use separate branches for development or for upcoming releases.

To report a bug or a feedback, use [GitHub Issues](https://github.com/bearer/pizzly/issues). We keep a close eye on this and try to label each new request. If you're fixing a bug or working on a new feature, submit a [pull request](https://github.com/Bearer/Pizzly/pulls) with detail on which changes you've made.

While there are no templates yet when opening a PR or an issue, we still recommend to provide as much detail as possible. Consider that someone external to the project should understand your request at first glance.

### License

Pizzly is MIT licensed. See the [LICENSE file](https://github.com/Bearer/Pizzly/blob/master/LICENSE.md) for more information.

## Sponsor

Pizzly is proudly sponsored by Bearer, a solution to implement [data security as code](https://www.bearer.com) processes in developers' workflows and automate data detection and data flow mapping.
