import { Context, Schema } from 'koishi'
import { mapDb, modeDb } from './data'

export const name = 'marne-bot'

// https://api.battlefield.vip/srvlst
// 23623
export interface Config {
  marneApi: string,
  serverId: number
}

export const Config: Schema<Config> = Schema.object({
  marneApi: Schema.string().description("马恩API地址").required(),
  serverId: Schema.number().description("马恩服务器Id")
}).description("配置项");

async function getServerList(ctx: Context, cfg: Config) {
  return await ctx.http.get(`${cfg.marneApi}`)
}

async function getServerInfo(ctx: Context, cfg: Config) {
  return await ctx.http.get(`${cfg.marneApi}/${cfg.serverId}`)
}

export function apply(ctx: Context, cfg: Config) {

  ctx.command("server")
    .action(async () => {
      let content = await getServerList(ctx, cfg);

      let message = "";
      if (content.servers.length == 0) {
        message += "当前无服务器在线";
        return message;
      }

      for (const [index, server] of content.servers.entries()) {
        message += `\n=======  服务器 (${index + 1})  =======`;
        message += `\n编号:  ${server.id}`;
        message += `\n名称:  ${server.name}`;
        message += `\n地区:  ${server.region} - ${server.country}`;
        message += `\n网络:  NAT${server.natType}`;
        message += `\n地图:  ${modeDb[server.gameMode]} - ${mapDb[server.mapName]}`;
        message += `\n人数:  ${server.currentPlayers} / ${server.maxPlayers} [${server.currentSpectators}]`;
      }

      return message;
    });

  ctx.command("bind <message>")
    .action((_, message) => {
      cfg.serverId = parseInt(message);
      return `已绑定服务器Id ${message}`;
    });

  // 查询服务器信息
  ctx.command("marne")
    .action(async () => {
      let content = await getServerInfo(ctx, cfg);

      let message = `=======  服务器Id (${content.id})  =======`;
      message += `\n名称:  ${content.name}`;
      message += `\n简介:  ${content.description}`;
      message += `\n地区:  ${content.region} - ${content.country}`;
      message += `\n地图:  ${modeDb[content.gameMode]} - ${mapDb[content.mapName]}`;
      message += `\n人数:  ${content.currentPlayers} / ${content.maxPlayers} [${content.currentSpectators}]`;

      return message;
    });

  // 查询服务器Mod信息
  ctx.command("mod")
    .action(async () => {
      let content = await getServerInfo(ctx, cfg);

      let message = `=======  服务器Id (${content.id})  =======`;
      message += `\n名称:  ${content.name}`;
      message += `\n地图:  ${modeDb[content.gameMode]} - ${mapDb[content.mapName]}`;
      message += `\n人数:  ${content.currentPlayers} / ${content.maxPlayers} [${content.currentSpectators}]`;

      if (content.modList.length == 0) {
        message += "\n\n当前服务器无模组";
        return message;
      }

      for (const [index, mod] of content.modList.entries()) {
        message += `\n=======  模组 (${index + 1})  =======`;
        message += `\n名称:  ${mod.name}`;
        message += `\n类型:  ${mod.category}`;
        message += `\n文件:  ${mod.file_name}`;
        message += `\n版本:  ${mod.version}`;
        message += `\n下载:  ${mod.link}`;
      }

      return message;
    });

  // 查询服务器玩家列表信息
  ctx.command("player")
    .action(async () => {
      let content = await getServerInfo(ctx, cfg);

      let message = `=======  服务器Id (${content.id})  =======`;
      message += `\n名称:  ${content.name}`;
      message += `\n地图:  ${modeDb[content.gameMode]} - ${mapDb[content.mapName]}`;
      message += `\n人数:  ${content.currentPlayers} / ${content.maxPlayers} [${content.currentSpectators}]`;

      if (content.playerList.length == 0) {
        message += "\n\n当前服务器无玩家";
        return message;
      }

      const team1Players = content.playerList.filter(player => player.team === 1);
      const team2Players = content.playerList.filter(player => player.team === 2);

      message += `\n=======  队伍1 (${team1Players.length})  =======`;
      for (const [index, player] of team1Players.entries()) {
        message += `\n${(index + 1).toString().padStart(2, "0")}.  ${player.name}  (${player.pid})`;
      }

      message += `\n=======  队伍2 (${team2Players.length})  =======`;
      for (const [index, player] of team2Players.entries()) {
        message += `\n${(index + 1).toString().padStart(2, "0")}.  ${player.name}  (${player.pid})`;
      }

      return message;
    });

  // 查询服务器地图列表信息
  ctx.command("map")
    .action(async () => {
      let content = await getServerInfo(ctx, cfg);

      let message = `=======  服务器Id ${content.id}  =======`;
      message += `\n名称:  ${content.name}`;
      message += `\n地图:  ${modeDb[content.gameMode]} - ${mapDb[content.mapName]}`;
      message += `\n人数:  ${content.currentPlayers} / ${content.maxPlayers} [${content.currentSpectators}]`;

      if (content.rotation.length == 0) {
        message += "\n\n当前服务器无地图";
        return message;
      }

      message += `\n=======  地图数量 (${content.rotation.length})  =======`;
      for (const [index, map] of content.rotation.entries()) {
        message += `\n${(index + 1).toString().padStart(2, "0")}.  ${modeDb[map.modeLongName]} - ${mapDb[map.mapLongName]}`;
      }

      return message;
    });

}
