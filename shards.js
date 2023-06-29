const { ShardingManager, WebhookClient } = require('discord.js');
const webhookStart = new WebhookClient({ id: "1102171150420807801", token: "Ov4pwBIEXwLPT7SGrgXfG_EVfRJrUEhPqAQ_xSWMKEnD4ZXdbE_78eMZLB6YmjJzU0Ws" })
new ShardingManager('./index.js', {
    shardList : [0, 1],
    totalShards : 2,
    mode: 'process',
    respawn: true,
    token: 'OTkzOTk2NzY3MjA3MTAwNDU2.G3u1tt.tJVWKM_rAqDcfmw22ArcN3GoGVCu0qEhxgKYSI'
}).on('shardCreate', shardCreateID => {
    shardCreateID
        .on('ready', () => webhookStart.send(`La shard \`n°${shardCreateID.id}\` est prêt.`))
        .on('reconnecting', () => webhookStart.send(`La shard \`n°${shardCreateID.id}\` se reconnecte.`))
        .on('death', () => webhookStart.send(`La shard \`n°${shardCreateID.id}\` est mort.`))
        .on('disconnect', () => webhookStart.send(`La shard \`n°${shardCreateID.id}\` s'est déconnecté.`));
    return webhookStart.send(`La shard \`n°${shardCreateID.id}\` est entrain de démarrer.`)
}).spawn({
    delay: 10000
});