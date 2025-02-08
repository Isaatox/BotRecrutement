const threads = require("../src/data/threads");
const connection = require("./database")

module.exports = ({ bot, knex, config, commands }) => {
    commands.addInboxThreadCommand("verif", [], async (msg, args, thread) => {
        try {
            const channel = bot.getChannel("918521075581718578");

            if (channel) {
                try {
                    const infos = await getInfos(thread.user_id);
    
                    const textTrad = {
                        usss: "United States Secret Service",
                        fib: "Federal Bureau of Investigation",
                        usms: "United States Marshals Service",
                    };

                    if (infos) {
                        thread.postSystemMessage("La demande de vérification de cette personne vient d'être faite ici : <#918521075581718578>");

                        await channel.createMessage({
                            "content": `<@&847949172803764304>`,
                            "embeds": [
                                {
                                    "type": "rich",
                                    "title": `Vérification d'un utilisateur`,
                                    "description": `Salut,\nPourriez-vous faire la vérification de cette personne s'il vous plaît.`,
                                    "color": 0x313338,
                                    "fields": [
                                        {
                                            "name": `Demandeur`,
                                            "value": `${msg.author.id} - <@${msg.author.id}>`
                                        },
                                        {
                                            "name": `Demandé`,
                                            "value": `${thread.user_id} - <@${thread.user_id}>`
                                        },
                                        {
                                            "name": `Service souhaité`,
                                            "value": `${textTrad[infos.carriere] !== undefined ? textTrad[infos.carriere] : "Service inconnu"}`
                                        }
                                    ]
                                }
                            ],
                            components: [
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 2,
                                            style: 1,
                                            label: `Récupérer l'id`,
                                            custom_id: 'copier',
                                        }, {
                                            type: 2,
                                            style: 1,
                                            label: `Récupérer le numéro de téléphone`,
                                            custom_id: 'phone_number',
                                        },
                                    ],
                                },
                            ],
                            allowedMentions: {
                                roles: true
                            }
                        });
                    } else {
                        thread.postSystemMessage("La demande de vérification de cette personne vient d'être faite ici : <#918521075581718578>");

                        await channel.createMessage({
                            "content": `<@&847949172803764304>`,
                            "embeds": [
                                {
                                    "type": "rich",
                                    "title": `Vérification d'un utilisateur`,
                                    "description": `Salut,\nPourriez-vous faire la vérification de cette personne s'il vous plaît.`,
                                    "color": 0x313338,
                                    "fields": [
                                        {
                                            "name": `Demandeur`,
                                            "value": `${msg.author.id} - <@${msg.author.id}>`
                                        },
                                        {
                                            "name": `Demandé`,
                                            "value": `${thread.user_id} - <@${thread.user_id}>`
                                        },
                                        {
                                            "name": `Service souhaité`,
                                            "value": `Service inconnu`
                                        }
                                    ]
                                }
                            ],
                            components: [
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 2,
                                            style: 1,
                                            label: `Récupérer l'id`,
                                            custom_id: 'copier',
                                        }, {
                                            type: 2,
                                            style: 1,
                                            label: `Récupérer le numéro de téléphone`,
                                            custom_id: 'phone_number',
                                        },
                                    ],
                                },
                            ],
                            allowedMentions: {
                                roles: true
                            }
                        });
                    }
                } catch (error) {
                    thread.postSystemMessage(error.message ? error.message : "Merci de contacter un administrateur")
                }
            }
        } catch (error) {
            console.error(`Ligne de code ${error.stack.split('\n')[1].trim()} : ${error}`);
        }
    }, { aliases: ["vr"], allowSuspended: true });

    bot.on('messageCreate', async (msg) => {
        try {
            if (!msg.referencedMessage) return;

            if (msg.referencedMessage.author.bot === true) {
                try {
                    if (msg.channel.id === "918521075581718578") {
                        try {
                            const channel = bot.getChannel("918521075581718578");
                            const member = channel.guild.members.get(msg.author.id);

                            if (member.roles.includes('847949172803764304')) {
                                try {
                                    var id_discord = msg.referencedMessage.embeds[0].fields[1].value.split(' ')[0];

                                    const existingThread = await threads.findOpenThreadByUserId(id_discord);

                                    if (existingThread) {
                                        try {
                                            bot.getChannel(existingThread.channel_id).createMessage({
                                                "content": `Salut <@${msg.referencedMessage.embeds[0].fields[0].value.split(' ')[0]}>, tu peux consulter la réponse concernant la vérification de cette personne ici : https://discord.com/channels/829635065293832192/${msg.channel.id}/${msg.id}`,
                                                allowedMentions: {
                                                    users: true
                                                }
                                            });
                                        } catch (error) {
                                            console.error(`Ligne de code ${error.stack.split('\n')[1].trim()} : ${error}`);
                                        }
                                    }
                                } catch (error) {
                                    console.error(`Ligne de code ${error.stack.split('\n')[1].trim()} : ${error}`);
                                }
                            }
                        } catch (error) {
                            console.error(`Ligne de code ${error.stack.split('\n')[1].trim()} : ${error}`);
                        }
                    }
                } catch (error) {
                    console.error(`Ligne de code ${error.stack.split('\n')[1].trim()} : ${error}`);
                }
            }
        } catch (error) {
            console.error(`Ligne de code ${error.stack.split('\n')[1].trim()} : ${error}`);
        }
    });

    bot.on('interactionCreate', async (interaction) => {
        try {
            if (interaction.type === 3 && interaction.data.custom_id === 'copier') {
                try {
                    await interaction.createMessage({
                        content: interaction.message.embeds[0].fields[1].value.split(' ')[0],
                        flags: 64
                    })
                } catch (error) {
                    console.error(`Ligne de code ${error.stack.split('\n')[1].trim()} : ${error}`);
                }
            } else if (interaction.type === 3 && interaction.data.custom_id === 'phone_number') {
                try {
                    const infos = await getInfos(interaction.message.embeds[0].fields[1].value.split(' ')[0]);

                    if (infos) {
                        await interaction.createMessage({
                            content: infos.telephone,
                            flags: 64
                        })
                    }
                } catch (error) {
                    await interaction.createMessage({
                        content: error.message ? error.message : "Merci de contacter un administrateur",
                        flags: 64
                    });
                }
            }
        } catch (error) {
            console.error(`Ligne de code ${error.stack.split('\n')[1].trim()} : ${error}`);
        }
    });
}

async function getInfos(discord) {
    try {
        const result = await connection.query(`SELECT * FROM recrutement WHERE id_discord = $1 ORDER BY created_at DESC`, [discord]);

        if (result.rows.length <= 0) {
            return false;
        }

        return result.rows[0];

    } catch (err) {
        console.error('Erreur lors de la requête:', err.message);
        throw err;
    }
}

