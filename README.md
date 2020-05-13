# ~BKKK Discord Bot

This repository is used for the Discord Bot used in ~BKKK Server. The server is dedicated to friends of the Authors. The bot is used for any features that we wanted to implement into our server without including other bots, to have a fully customisable experience.

## Contents

- [~BKKK Discord Bot](#bkkk-discord-bot)
  - [Contents](#contents)
  - [Getting Started](#getting-started)
  - [Branches and Process Flow](#branches-and-process-flow)
    - [Branches](#branches)
    - [Process Flow](#process-flow)
      - [Envrionment setup](#envrionment-setup)
      - [Process of moving from Development to Release](#process-of-moving-from-development-to-release)
  - [Todo](#todo)
  - [Directory Structure](#directory-structure)
  - [Latest Addition](#latest-addition)
  - [Contributing](#contributing)
  - [Authors](#authors)

## Getting Started

This is a discord bot that uses "[discord.js](https://discord.js.org/#/)" library. To get started, you will need node and npm installed. Then install discord.js by using the command

```bash
npm install discord.js
```

You will then need you discord bot's authentication token (found under the "click to reveal token" on the [https://discordapp.com/developers/applications/${YOUR_APPLICATION_ID}/bot/](https://discordapp.com/developers/applications/)). Once you have this, create a folder in the bots location named "local" and place you key in a file named `auth.json` formatted as follows (this prevents others for stealing your bot):

```json
{
  "token": "authentication_token"
}
```

Once you have done this, and configured the Channels.json file to your server, you are ready to run the bot with

```bash
node bot.js
```

or

```bash
npm start
```

Further information on how to set up the Channels.json and other relevant configuration files will be produced later in the project.

## Branches and Process Flow

### Branches

- Release (Default)
- master

### Process Flow

#### Environment setup

Before running through the individual setup process you must ensure that your "./bot/Channels.json" is independent to your branch.
To do this, all you have to do is run the configuration line:

```bash
git config --global merge.ours.driver true
```

In the first line of the Channels.json you should put a tag as the following:

```json
{
  "Branch_name": "Branch_name",
  "ChannelsInfo":{...}
}
```

Doing this ensure that there is a merge error on this file with any other branch (the differential can check if `"varaibleA":"a"` is changed to `"variableA":"b"` as the tag is the same, the different tag ensures the conflict). Once this is completed, you may then edit the Channels.json as you require.

When it is time to merge to the master dev branch DO NOT merge via the web or any VCS, instead open the terminal and run the following (where "x" are your relevant variables):

```bash
git checkout master
git merge "your_branch"
```

If you have completed the steps correctly, and there are no other conflicts in your merge that you have not resolved, then the merge will retain the branch-specific Channels.json, enabling for a local and release development environment. Make sure that once you are finished, you run `git checkout "your_branch"` to return to your dev environment, otherwise you will be trying to change either the master directly (this is not a good idea).

Another important part of the code is checking if `process.env.botToken` is set DO NOT REMOVE IT. In the release environment it is, in yours it should not be, for your local key, following the [Getting Started](#getting-started) guide for authentication.

Merging from the master to the release must be completed on the web side of git, this ensures another person reviews it before it is released. Unfortunately this removes the automatic resolution of Channels.json, but this can be handled manually in the conflict resolution (as the review has to happen anyway).

#### Process of moving from Development to Release

1. Create a branch from master of the implementation you want to implement
2. Implement the solution
3. Merge to master
4. Request merge from master to release
5. Assign another member to review the merge
6. If approved, will be pushed to AWS
7. If deploy has failed, the old version will stay live, Eamonn will look at debugging
8. If succeeded, the bot will be live on release

## Todo

- [ ] toxicity ranking
- [ ] modularity in games scoreboard
- [ ] quotes meta-data
- [ ] format the quotes automatically
- [ ] call meta-data stats
- [x] bot tracks ideas page
- [ ] automatic gif replies
- [ ] reminders
- [ ] crushampton feed
- [ ] spotify integration
- [ ] insult when you @ the bot
- [ ] bulk remove messages
- [ ] help for a list of commands per channel (or generally)
- [ ] log bad ideas for a reminder
- [ ] automatic command list message pinned to channel
- [ ] a kind of "read" react so messages can be deleted in channels that we want to keep clean
- [ ] test mode to see server in non-admin mode

## Directory Structure

```notepad
Discord Bot
|-- package.json               [node package settings for bot]
|-- package-lock.json          [automatically node generated file]
|-- bot.js                     [main bot functionality code implementation]
|-- appspec.yml                [appspec information for codedeploy transfer of files]
|-- .gitignore                 [git ignore for the local permission keys]
|-- scripts
|    |-- install_dependencies  [node install for ubuntu (latest version, not using apt-get)]
|    |-- post_install          [npm install for required node modules]
|    |-- start_server          [forever start code for codedeploy AWS spin up]
|    `-- stop_server           [forever stop code for codedeploy AWS spin down]
`-- node_modules               [Node modules automatically generated]
```

## Latest Addition

Author: Eamonn Trim  - [ect1u17](mailto:ect1u17@soton.ac.uk)

Action: Adding process flow, branches and getting started section

Date: 02/05/2020

## Contributing

Eamonn Trim  - [ect1u17](mailto:ect1u17@soton.ac.uk)

Anurag Sahare - [aps1g17](mailto:aps1g17@soton.ac.uk)

## Authors

| Name              | Actions                                     |
| ----------------- | ------------------------------------------- |
| **Anurag Sahare** | *Edited Readme file*                        |
| **Eamonn Trim**   | *Leaderboard Functions, edited Readme file* |
| **Josh Bullock**  | *Nothing yet*                               |
| **Matt Johns**    | *Nothing yet*                               |
| **Gavin Fish**    | *Nothing yet*                               |
