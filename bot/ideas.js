const Discord = require('discord.js');

const metaData = require('../bot.js');

/** Puts the message suggestion to a vote, adding a listener to the results of the majority (if it reaches one).
 * @async
 * @param {Discord.Message} messageReceived Used to react to the message, add the listener and find the author.
 * @param {String} ideaArg Used to format the string of the idea to add.
 */
exports.add = async function add(messageReceived, ideaArg) {
    console.info('-\tAdding listeners to the idea: ' + ideaArg + '!');
    await messageReceived.react('👍');
    messageReceived.react('👎');

    let ideaAndAuthorString = ideaArg + ' (by ' + messageReceived.author.username + ')';

    let addFilter = (reaction, user) => reaction.emoji.name == '👍' && reaction.count == this.majority + 1;
    let addListener = messageReceived.createReactionCollector(addFilter, {
        time: 0,
    });

    let rejectFilter = (reaction, user) => reaction.emoji.name == '👎' && reaction.count == this.majority + 1;
    let rejectListener = messageReceived.createReactionCollector(rejectFilter, {
        time: 0,
    });

    addListener.on('collect', (reaction) => {
        console.info(ideaArg + ' has received enough votes to be added!');
        new Discord.Message(
            metaData.bot,
            {
                id: this.ideasChannel.todo,
            },
            messageReceived.channel
        )
            .fetch()
            .then((editMessage) => {
                let fields = [];
                let messageAddition = '`- [ ] ' + ideaAndAuthorString + '`';

                if (editMessage.embeds.length != 0) {
                    editMessage.embeds[0].fields.forEach((field, index, array) => {
                        if (index != array.length - 1) {
                            fields.push(field);
                        } else {
                            if (field.value.length + messageAddition.length > 1024 - 1) {
                                fields.push(field);
                                fields.push({
                                    name: 'Ideas:',
                                    value: messageAddition,
                                });
                            } else {
                                fields.push({
                                    name: 'Ideas:',
                                    value: field.value + '\n' + messageAddition,
                                });
                            }
                        }
                    });
                }

                if (fields.length == 0) {
                    fields.push({
                        name: 'Ideas:',
                        value: messageAddition,
                    });
                }

                editMessage.edit({
                    content: 'Ideas:',
                    embed: {
                        title: 'Ideas:',
                        fields: fields,
                    },
                });
                messageReceived.delete();
            });
    });

    rejectListener.on('collect', (reaction) => {
        console.info(ideaArg + ' has received enough rejections to be removed!');
        new Discord.Message(
            metaData.bot,
            {
                id: this.ideasChannel.bad,
            },
            messageReceived.channel
        )
            .fetch()
            .then((editMessage) => {
                let fields = [];
                let messageAddition = '`- ' + ideaAndAuthorString + '`';

                if (editMessage.embeds.length != 0) {
                    editMessage.embeds[0].fields.forEach((field, index, array) => {
                        if (index != array.length - 1) {
                            fields.push(field);
                        } else {
                            if (field.value.length + messageAddition.length > 1024 - 5) {
                                fields.push(field);
                                fields.push({
                                    name: 'Bad Ideas:',
                                    value: '||' + messageAddition + '||',
                                });
                            } else {
                                fields.push({
                                    name: 'Bad Ideas:',
                                    value:
                                        field.value.substring(0, field.value.length - 2) +
                                        '\n' +
                                        messageAddition +
                                        '||',
                                });
                            }
                        }
                    });
                }

                if (fields.length == 0) {
                    fields.push({
                        name: 'Bad Ideas:',
                        value: '||' + messageAddition + '||',
                    });
                }

                editMessage.edit({
                    content: 'Bad Ideas:',
                    embed: {
                        title: 'Bad Ideas:',
                        fields: fields,
                    },
                });
                messageReceived.delete();
            });
    });
};

/** Adds an idea directly to the "Todo" message, without registering for votes.
 * @param {Discord.Message} messageReceived Used to react to the message, add the listener and find the author.
 * @param {String} idea Used to format the string of the idea to add.
 */
exports.addVeto = function addVeto(messageReceived, idea) {
    console.info("-\tBypassing votes and adding the idea: '" + idea + "' to the list!");
    new Discord.Message(
        metaData.bot,
        {
            id: this.ideasChannel.todo,
        },
        messageReceived.channel
    )
        .fetch()
        .then((editMessage) => {
            let messageAddition = '`- [ ] ' + idea + ' (by ' + messageReceived.author.username + ')`';
            let fields = [];

            // Addition of new field if required
            if (editMessage.embeds.length != 0) {
                editMessage.embeds[0].fields.forEach((field, index, array) => {
                    if (index != array.length - 1) {
                        fields.push(field);
                    } else {
                        if (field.value.length + messageAddition.length > 1024 - 1) {
                            fields.push(field);
                            fields.push({
                                name: 'Ideas:',
                                value: messageAddition,
                            });
                        } else {
                            fields.push({
                                name: 'Ideas:',
                                value: field.value + '\n' + messageAddition,
                            });
                        }
                    }
                });
            }

            if (fields.length == 0) {
                fields.push({
                    name: 'Ideas:',
                    value: messageAddition,
                });
            }

            editMessage.edit({
                content: 'Ideas:',
                embed: {
                    title: 'Ideas:',
                    fields: fields,
                },
            });
        });
    messageReceived.delete();
};

/** Moves any ideas from "Todo" to "Completed" that include the query string.
 * @param {Discord.Message} messageReceived The message the command was sent in.
 * @param {String} queryIdea The query string to check if its included in an idea.
 */
exports.completed = function completed(messageReceived, queryIdea) {
    console.info("-\tMarking anything with the string '" + queryIdea + "' as a completed idea!");
    new Discord.Message(
        metaData.bot,
        {
            id: this.ideasChannel.todo,
        },
        messageReceived.channel
    )
        .fetch()
        .then((todoMessage) => {
            let todoFields = [];
            let completedFields = [];
            let todoStringsArray = [];
            let completedStringsArray = [];
            let ideasMatch;
            let regex = this.ideaRegex;

            // Convert the old format
            while ((ideasMatch = regex.exec(todoMessage.content))) {
                if (ideasMatch[1].includes(queryIdea)) {
                    completedStringsArray.push('`- [x] ' + ideasMatch[1] + '`');
                } else {
                    todoStringsArray.push('`- [ ] ' + ideasMatch[1] + '`');
                }
            }

            // New embed format
            if (todoMessage.embeds.length != 0) {
                todoMessage.embeds[0].fields.forEach((field, index, array) => {
                    while ((ideasMatch = regex.exec(field.value))) {
                        if (ideasMatch[1].includes(queryIdea)) {
                            completedStringsArray.push('`- [x] ' + ideasMatch[1] + '`');
                        } else {
                            if (todoStringsArray.join('\n').length + ('`- [ ] ' + ideasMatch[1] + '`').length > 1024) {
                                todoFields.push({
                                    name: 'Ideas:',
                                    value: todoStringsArray.join('\n'),
                                });
                                todoStringsArray = [];
                            }
                            todoStringsArray.push('`- [ ] ' + ideasMatch[1] + '`');
                        }
                    }

                    if (index == array.length - 1 && todoStringsArray.join('\n') != '') {
                        todoFields.push({
                            name: 'Ideas:',
                            value: todoStringsArray.join('\n'),
                        });
                    }
                });
            } else {
                todoFields.push({
                    name: 'Ideas:',
                    value: todoStringsArray.join('\n'),
                });
            }

            todoMessage
                .edit({
                    content: 'Ideas:',
                    embed: {
                        title: 'Ideas:',
                        fields: todoFields,
                    },
                })
                .then(() => {
                    new Discord.Message(
                        metaData.bot,
                        {
                            id: this.ideasChannel.completed,
                        },
                        messageReceived.channel
                    )
                        .fetch()
                        .then((completedMessage) => {
                            if (completedMessage.embeds.length != 0) {
                                completedMessage.embeds[0].fields.forEach((field, index, array) => {
                                    if (index != array.length - 1) {
                                        completedFields.push(field);
                                    } else {
                                        if (field.value.length + completedStringsArray.join('\n').length > 1024 - 1) {
                                            completedFields.push(field);
                                            completedFields.push({
                                                name: 'Completed:',
                                                value: '||' + completedStringsArray.join('\n') + '||',
                                            });
                                        } else {
                                            completedFields.push({
                                                name: 'Completed:',
                                                value:
                                                    field.value.substring(0, field.value.length - 2) +
                                                    '\n' +
                                                    completedStringsArray.join('\n') +
                                                    '||',
                                            });
                                        }
                                    }
                                });
                            }

                            if (completedFields.length == 0) {
                                completedFields.push({
                                    name: 'Completed:',
                                    value: '||' + completedStringsArray.join('\n') + '||',
                                });
                            }

                            completedMessage.edit({
                                content: 'Completed:',
                                embed: {
                                    title: 'Completed:',
                                    fields: completedFields,
                                },
                            });
                        });
                });
        });
    messageReceived.delete();
};

/** Moves any ideas from "Completed" to "Todo" that include the query string.
 * @param {Discord.Message} messageReceived The message the command was sent in.
 * @param {String} queryIdea The query string to check if its included in an idea.
 */
exports.unfinished = function unfinished(messageReceived, queryIdea) {
    console.info("-\tMarking anything with the string '" + queryIdea + "' as an unfinished idea!");
    new Discord.Message(
        metaData.bot,
        {
            id: this.ideasChannel.completed,
        },
        messageReceived.channel
    )
        .fetch()
        .then((completedMessage) => {
            let todoFields = [];
            let completedFields = [];
            let todoStringsArray = [];
            let completedStringsArray = [];
            let ideasMatch;
            let regex = this.ideaRegex;

            // Converting from old method
            while ((ideasMatch = regex.exec(completedMessage.content))) {
                if (ideasMatch[1].includes(queryIdea)) {
                    todoStringsArray.push('`- [ ] ' + ideasMatch[1] + '`');
                } else {
                    completedStringsArray.push('`- [x] ' + ideasMatch[1] + '`');
                }
            }

            // New method using embeds
            if (completedMessage.embeds.length != 0) {
                completedMessage.embeds[0].fields.forEach((field, index, array) => {
                    while ((ideasMatch = regex.exec(field.value))) {
                        if (!ideasMatch[1].includes(queryIdea)) {
                            if (
                                completedStringsArray.join('\n').length + ('`- [x] ' + ideasMatch[1] + '`').length >
                                1024 - 4
                            ) {
                                completedFields.push({
                                    name: 'Completed:',
                                    value: '||' + completedStringsArray.join('\n') + '||',
                                });
                                completedStringsArray = [];
                            }
                            completedStringsArray.push('`- [x] ' + ideasMatch[1] + '`');
                        } else {
                            todoStringsArray.push('`- [ ] ' + ideasMatch[1] + '`');
                        }
                    }
                    if (index == array.length - 1 && completedStringsArray.join('\n') != '') {
                        completedFields.push({
                            name: 'Completed:',
                            value: '||' + completedStringsArray.join('\n') + '||',
                        });
                    }
                });
            } else {
                completedFields.push({
                    name: 'Completed:',
                    value: '||' + completedStringsArray.join('\n') + '||',
                });
            }

            completedMessage
                .edit({
                    content: 'Completed:',
                    embed: {
                        title: 'Completed:',
                        fields: completedFields,
                    },
                })
                .then(() => {
                    new Discord.Message(
                        metaData.bot,
                        {
                            id: this.ideasChannel.todo,
                        },
                        messageReceived.channel
                    )
                        .fetch()
                        .then((todoMessage) => {
                            if (todoMessage.embeds.length != 0) {
                                todoMessage.embeds[0].fields.forEach((field, index, array) => {
                                    if (index != array.length - 1) {
                                        todoFields.push(field);
                                    } else {
                                        if (field.value.length + todoStringsArray.join('\n').length > 1024 - 1) {
                                            todoFields.push(field);
                                            todoFields.push({
                                                name: 'Ideas:',
                                                value: todoStringsArray.join('\n'),
                                            });
                                        } else {
                                            todoFields.push({
                                                name: 'Ideas:',
                                                value: field.value + '\n' + todoStringsArray.join('\n'),
                                            });
                                        }
                                    }
                                });
                            }

                            if (todoFields.length == 0 && todoStringsArray.join('\n') != '') {
                                todoFields.push({
                                    name: 'Ideas:',
                                    value: todoStringsArray.join('\n'),
                                });
                            }

                            todoMessage.edit({
                                content: 'Ideas:',
                                embed: {
                                    title: 'Ideas:',
                                    fields: todoFields,
                                },
                            });
                        });
                });
        });
    messageReceived.delete();
};

/** Removes an idea from "Todo" from the list.
 * @param {Discord.Message} messageReceived The message the command was sent in.
 * @param {String} queryIdea The query string to check if its included in an idea.
 */
exports.remove = function remove(messageReceived, queryIdea) {
    console.info("-\tRemoving anything with the string '" + queryIdea + "' as a todo idea!");
    new Discord.Message(
        metaData.bot,
        {
            id: this.ideasChannel.todo,
        },
        messageReceived.channel
    )
        .fetch()
        .then((todoMessage) => {
            let fields = [];
            let todoStringsArray = [];
            let ideasMatch;

            // convert from current format if required
            while ((ideasMatch = this.ideaRegex.exec(todoMessage.content))) {
                if (ideasMatch[1].includes(queryIdea)) {
                    if (todoStringsArray.join('\n').length + ('`- [ ] ' + ideasMatch[1] + '`').length > 1024) {
                        fields.push({
                            name: 'Ideas:',
                            value: todoStringsArray.join('\n'),
                        });
                        todoStringsArray = [];
                    }
                    todoStringsArray.push('`- [ ] ' + ideasMatch[1] + '`');
                }
            }

            // Using new embeds
            if (todoMessage.embeds.length != 0) {
                todoMessage.embeds[0].fields.forEach((field, index, array) => {
                    while ((ideasMatch = this.ideaRegex.exec(field.value))) {
                        if (!ideasMatch[1].includes(queryIdea)) {
                            if (todoStringsArray.join('\n').length + ('`- [ ] ' + ideasMatch[1] + '`').length > 1024) {
                                fields.push({
                                    name: 'Ideas:',
                                    value: todoStringsArray.join('\n'),
                                });
                                todoStringsArray = [];
                            }
                            todoStringsArray.push('`- [ ] ' + ideasMatch[1] + '`');
                        }
                    }

                    if (index == array.length - 1 && todoStringsArray.join('\n') != '') {
                        fields.push({
                            name: 'Ideas:',
                            value: todoStringsArray.join('\n'),
                        });
                    }
                });
            } else {
                fields.push({
                    name: 'Ideas:',
                    value: todoStringsArray.join('\n'),
                });
            }

            todoMessage.edit({
                content: 'Ideas:',
                embed: {
                    title: 'Ideas:',
                    fields: fields,
                },
            });
        });
    messageReceived.delete();
};

/** Resets the idea messages to the defaults.
 * @param {Discord.Message} messageReceived The message the command was sent in.
 */
exports.reset = function reset(messageReceived) {
    console.info('-\tResetting the entire todo list!');
    new Discord.Message(
        metaData.bot,
        {
            id: this.ideasChannel.todo,
        },
        messageReceived.channel
    )
        .fetch()
        .then((todoMessage) => {
            todoMessage.edit({
                content: 'Ideas:',
                embed: {
                    title: 'Ideas:',
                },
            });
        });

    new Discord.Message(
        metaData.bot,
        {
            id: this.ideasChannel.bad,
        },
        messageReceived.channel
    )
        .fetch()
        .then((badIdeasMessage) => {
            badIdeasMessage.edit({
                content: 'Bad Ideas:',
                embed: {
                    title: 'Bad Ideas:',
                },
            });
        });

    new Discord.Message(
        metaData.bot,
        {
            id: this.ideasChannel.completed,
        },
        messageReceived.channel
    )
        .fetch()
        .then((completedMessage) => {
            completedMessage.edit({
                content: 'Completed:',
                embed: {
                    title: 'Completed:',
                },
            });
        });

    messageReceived.delete();
};

/** Initialises the static variables used throughout this module (from the config files).
 */
exports.init = function init() {
    for (let channel of metaData.channels) {
        if (channel.name == 'Ideas') {
            this.ideasChannel = channel;
            this.majority = channel.majority;
        }
    }

    this.ideaRegex = /(?:`- \[[ x]\] )([\w \S]+)(?:`)/g;
};
