const connection = require("./database")
const threads = require("../src/data/threads");

class SendMessage {
    constructor(guild, salon, user, nickname) {
        this.guild = guild
        this.salon = salon;
        this.user = user;
        this.nickname = nickname;
    }

    async SetMessage(message) {
        const guild = await this.guild;
        const thread = await threads.findOpenThreadByChannelId(this.salon)
        const member = await guild.members.get(this.user);
        member.nick = this.nickname

        return await thread.replyToUser(member, message);
    }

    async SetMessageEmbed(bot, userId, message) {
        const user = await bot.users.get(userId);

        if (user) {
            // Utilisez la méthode createMessage sur l'objet utilisateur pour envoyer un DM
            user.getDMChannel().then((channel) => {
                channel.createMessage(message).then(async () => {
                    const thread = await threads.findOpenThreadByChannelId(this.salon)
                    const channel = bot.getChannel(thread.channel_id)

                    if (channel) {
                        bot.createMessage(channel.id, message).then(() => {
                            console.log(`Message envoyé dans le salon ${channel.name}`);
                        }).catch((error) => {
                            console.error(`Erreur lors de l'envoi du message : ${error}`);
                        });
                    } else {
                        console.error(`Salon avec l'ID ${channel.id} introuvable.`);
                    }

                    console.log(`Message DM envoyé à l'utilisateur avec l'ID ${userId}`);
                }).catch((error) => {
                    console.error(`Erreur lors de l'envoi du message DM : ${error}`);
                });
            }).catch((error) => {
                console.error(`Erreur lors de la récupération du canal DM : ${error}`);
            });
        } else {
            console.error(`Utilisateur avec l'ID "${userId}" introuvable.`);
        }
    }
}

class GetIDByUUID {
    constructor(uuid) {
        this.uuid = uuid
    }

    async Get() {
        const reponse = await connection.query(`SELECT r.* FROM etapes e INNER JOIN recrutement r ON e.candid_uuid = r.uuid WHERE e.candid_uuid = '${this.uuid}';`)
        return await reponse.rows[0]
    }
}

module.exports = {
    SendMessage,
    GetIDByUUID,
};