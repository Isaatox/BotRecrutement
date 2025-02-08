const utils = require("../src/utils");
const threads = require("../src/data/threads.js");
const { getOrFetchChannel } = require("../src/utils");
const connection = require("./database")
const { SendMessage, GetIDByUUID } = require("./messages")
const etapes = {
    0: `__**Accusé de Réception de Candidature**__

Madame, Monsieur,

Nous vous confirmons la **réception** de votre candidature au sein de notre service. Votre dossier a été pris en compte, et nous vous en remercions.

Nous procéderons à **l'examen** de votre candidature dans les plus brefs délais. Si votre profil correspond à nos besoins, nous vous contacterons pour la suite du processus de **recrutement**.
    
En attendant, nous vous souhaitons une excellente journée, et nous vous remercions de **l'intérêt** que vous portez.`, // Depot

    1: `__**Candidature Retenue pour l'Étape Suivante**__
Madame, Monsieur,

Votre candidature pour le poste a été **retenue** pour **l'étape suivante** du processus de recrutement. Nous vous contacterons bientôt avec plus de détails.

Si vous avez des questions en attendant, n'hésitez pas à nous contacter. En attendant, nous vous souhaitons une excellente journée.`, // Test sportif

    2: `__**Candidature Retenue pour l'Intégration au Service**__

**Madame, Monsieur,**
    
Nous sommes **heureux** de vous informer que la candidature pour le poste a été **retenue**. Cette étape marque le début de l'**intégration**.

Nous préparons actuellement les détails du processus d'**intégration** et nous vous fournirons toutes les informations nécessaires dans les prochains jours.
    
Si vous avez des **questions** en attendant, n'hésitez pas à nous contacter. Nous sommes là pour vous aider dans cette **transition**.
    
**Félicitations** et à bientôt au sein de notre équipe !.`, // Intégration

    3: `__**Candidature Non Retenue**__

**Madame, Monsieur,**
    
Nous tenons à vous informer que votre candidature pour le poste n'a pas été **retenue**.

Nous vous remercions d'avoir pris le temps de postuler et d'exprimer votre **intérêt** pour notre service.
    
Si vous avez des **questions** ou besoin de commentaires supplémentaires concernant votre candidature, n'hésitez pas à nous contacter.
    
Nous vous remercions de votre **compréhension**.`, // Refusé

    4: `__**Candidature Acceptée**__

**Madame, Monsieur,**
    
Nous avons le **plaisir** de vous informer que votre candidature pour le poste a été **acceptée**.

Nous préparons actuellement les détails du processus **d'intégration** et nous vous fournirons toutes les informations nécessaires dans les prochains jours. Vous êtes sur le point de rejoindre notre service.
    
Si vous avez des **questions** ou avez besoin de plus amples informations, n'hésitez pas à nous contacter.
    
Nous vous remercions de votre **confiance** en notre entreprise.`, // Accepté
};

module.exports = async ({ bot, knex, config, commands }) => {
    connection.query('LISTEN ajout_candidature');
    connection.query('LISTEN etapes_modification');

    // Réagissez aux notifications
    connection.on('notification', (notification) => {
        if (notification.channel === "ajout_candidature") {
            const payload = JSON.parse(notification.payload);
            OpenModMail(payload.id_discord, payload)
        } else if (notification.channel === "etapes_modification") {
            const payload = JSON.parse(notification.payload);
            SendMessageEtapes(payload)
        };
    });

    // Gérez les erreurs de connexion
    connection.on('error', (error) => {
        console.error('Erreur de connexion à la base de données:', error);
    });

    async function OpenModMail(userID, payload) {
        try {
            const channelLogs = bot.getChannel(config.logChannelId);
            let thread = null
            const user = bot.users.get(userID) || await bot.getRESTUser(userID).catch(() => null);

            if (!user) {
                utils.postSystemMessageWithFallback(channelLogs, thread, `Impossible d'ouvrir le ticket du candidat ${payload.nom} - ${payload.id_discord}`);
                return;
            }

            if (user.bot) {
                utils.postSystemMessageWithFallback(channelLogs, thread, "Can't create a thread for a bot")
                return;
            }

            const existingThread = await threads.findOpenThreadByUserId(userID);
            if (existingThread) {
                const channel = await getOrFetchChannel(bot, existingThread.channel_id);

                new SendMessage(bot.guilds.get(config.mainServerId), existingThread.channel_id, "1035312433486635128", "Secrétaire Susan").SetMessageEmbed(bot, userID, {
                    "content": `**(Secrétaire Administrative) Secrétaire Susan:** `, "embeds": [
                        {
                            "id": 12470767,
                            "title": `Bonjour ${payload.nom}`,
                            "description": `${etapes[0]}`,
                            "color": 20873,
                            "footer": {
                                "text": "Cordialement, U.S. Homeland Security Academy",
                                "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Seal_of_the_U.S._Department_of_Homeland_Security.svg/1200px-Seal_of_the_U.S._Department_of_Homeland_Security.svg.png"
                            },
                            "thumbnail": {
                                "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Seal_of_the_U.S._Department_of_Homeland_Security.svg/1200px-Seal_of_the_U.S._Department_of_Homeland_Security.svg.png"
                            },
                            "fields": []
                        }
                    ],
                })

                await channel.createMessage(`Lien de la candidature [ici](https://join-hls.ovh/pages/panel/candidat?id=${payload.uuid})`);
            } else {
                const createdThread = await threads.createNewThreadForUser(user, {
                    quiet: true,
                    ignoreRequirements: true,
                    ignoreHooks: true,
                    source: "command",
                });

                const channel = await getOrFetchChannel(bot, createdThread.channel_id);

                new SendMessage(bot.guilds.get(config.mainServerId), createdThread.channel_id, "1035312433486635128", "Secrétaire Susan").SetMessageEmbed(bot, userID, {
                    "content": `**(Secrétaire Administrative) Secrétaire Susan:** `, "embeds": [
                        {
                            "id": 12470767,
                            "title": `Bonjour ${payload.nom}`,
                            "description": `${etapes[0]}`,
                            "color": 20873,
                            "footer": {
                                "text": "Cordialement, U.S. Homeland Security Academy",
                                "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Seal_of_the_U.S._Department_of_Homeland_Security.svg/1200px-Seal_of_the_U.S._Department_of_Homeland_Security.svg.png"
                            },
                            "thumbnail": {
                                "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Seal_of_the_U.S._Department_of_Homeland_Security.svg/1200px-Seal_of_the_U.S._Department_of_Homeland_Security.svg.png"
                            },
                            "fields": []
                        }
                    ],
                })

                await channel.createMessage(`Lien de la candidature [ici](https://join-hls.us/pages/panel/candidat?id=${payload.uuid})`);
            }
        } catch (error) {
            console.error(`Ligne de code ${error.stack.split('\n')[1].trim()} : ${error}`);
        }
    }

    async function SendMessageEtapes(uuid) {
        if (uuid.position_candidature === 0) return;

        const result = await new GetIDByUUID(uuid.candid_uuid).Get();
        const existingThread = await threads.findOpenThreadByUserId(result.id_discord);
        const channelLogs = bot.getChannel(config.logChannelId);

        if (result) {
            try {
                if (existingThread) {
                    try {
                        new SendMessage(bot.guilds.get(config.mainServerId), existingThread.channel_id, "1035312433486635128", "Secrétaire Susan").SetMessageEmbed(bot, result.id_discord, {
                            "content": `**(Secrétaire Administrative) Secrétaire Susan:** `, "embeds": [
                                {
                                    "id": 12470767,
                                    "title": `Bonjour ${result.nom}`,
                                    "description": `${etapes[uuid.position_candidature]}`,
                                    "color": 20873,
                                    "footer": {
                                        "text": "Cordialement, U.S. Homeland Security Academy",
                                        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Seal_of_the_U.S._Department_of_Homeland_Security.svg/1200px-Seal_of_the_U.S._Department_of_Homeland_Security.svg.png"
                                    },
                                    "thumbnail": {
                                        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Seal_of_the_U.S._Department_of_Homeland_Security.svg/1200px-Seal_of_the_U.S._Department_of_Homeland_Security.svg.png"
                                    },
                                    "fields": []
                                }
                            ],
                        })
                    } catch (error) {
                        console.error(`Ligne de code ${error.stack.split('\n')[1].trim()} : ${error}`);
                    }
                } else {
                    try {
                        utils.postSystemMessageWithFallback(channelLogs, null, `Impossible d'emettre le message du changement d'étapes dans le ticket du candidat comportant le nom : ${result.nom}`);
                    } catch (error) {
                        console.error(`Ligne de code ${error.stack.split('\n')[1].trim()} : ${error}`);
                    }
                }
            } catch (error) {
                console.error(`Ligne de code ${error.stack.split('\n')[1].trim()} : ${error}`);
            }
        } else {
            try {
                if (existingThread) {
                    utils.postSystemMessageWithFallback(channelLogs, null, `Impossible d'emettre le message du changement d'étapes du ticket <#${existingThread.channel_id}>`);
                } else {
                    utils.postSystemMessageWithFallback(channelLogs, null, `Impossible d'emettre le message du changement d'étapes dans le ticket du candidat comportant cette id de candidature : ${uuid.candid_uuid}`);
                }
            } catch (error) {
                console.error(`Ligne de code ${error.stack.split('\n')[1].trim()} : ${error}`);
            }
        }
    }
}