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

export function apply(ctx: Context, cfg: Config) {

  // 查询服务器信息
  ctx.command("#marne")
    .action(async () => {
      let content = await ctx.http.get(`${cfg.marneApi}/${cfg.serverId}`);

      let message = `=======  服务器Id ${content.id}  =======`;
      message += `\n名称:  ${content.name}`;
      message += `\n简介:  ${content.description}`;
      message += `\n地区:  ${content.region} - ${content.country}`;
      message += `\n地图:  ${modeDb[content.gameMode]} - ${mapDb[content.mapName]}`;
      message += `\n人数:  ${content.currentPlayers} / ${content.maxPlayers} [${content.currentSpectators}]`;

      return message;
    });

  // 查询服务器Mod信息
  ctx.command("#mod")
    .action(async () => {
      let content = await ctx.http.get(`${cfg.marneApi}/${cfg.serverId}`);

      let message = `=======  服务器Id ${content.id}  =======`;
      message += `\n名称:  ${content.name}`;
      message += `\n地图:  ${modeDb[content.gameMode]} - ${mapDb[content.mapName]}`;
      message += `\n人数:  ${content.currentPlayers} / ${content.maxPlayers} [${content.currentSpectators}]`;

      if (content.modList.length == 0) {
        message += "\n\n当前服务器无模组";
        return message;
      }

      message += `\n=======  模组数量 ${content.modList.length}  =======`;
      for (const mod of content.modList) {
        message += `\n名称:  ${mod.name}`;
        message += `\n类型:  ${mod.category}`;
        message += `\n文件:  ${mod.file_name}`;
        message += `\n版本:  ${mod.version}`;
        message += `\n下载:  ${mod.link}`;
      }

      return message;
    });

  // 查询服务器玩家列表信息
  ctx.command("#player")
    .action(async () => {
      let content = await ctx.http.get(`${cfg.marneApi}/${cfg.serverId}`);

      let message = `=======  服务器Id ${content.id}  =======`;
      message += `\n名称:  ${content.name}`;
      message += `\n地图:  ${modeDb[content.gameMode]} - ${mapDb[content.mapName]}`;
      message += `\n人数:  ${content.currentPlayers} / ${content.maxPlayers} [${content.currentSpectators}]`;

      if (content.playerList.length == 0) {
        message += "\n\n当前服务器无玩家";
        return message;
      }

      const team1Players = content.playerList.filter(player => player.team === 1);
      const team2Players = content.playerList.filter(player => player.team === 2);

      message += `\n=======  队伍1 ${team1Players.length}  =======`;
      for (const [index, player] of team1Players.entries()) {
        message += `\n${(index + 1).toString().padStart(2, "0")}.  ${player.name} (${player.pid})`;
      }

      message = `\n=======  队伍2 ${team2Players.length}  =======`;
      for (const [index, player] of team2Players.entries()) {
        message += `\n${(index + 1).toString().padStart(2, "0")}.  ${player.name} (${player.pid})`;
      }

      return message;
    });

  // 查询服务器地图列表信息
  ctx.command("#map")
    .action(async () => {
      let content = await ctx.http.get(`${cfg.marneApi}/${cfg.serverId}`);

      let message = `=======  服务器Id ${content.id}  =======`;
      message += `\n名称:  ${content.name}`;
      message += `\n地图:  ${modeDb[content.gameMode]} - ${mapDb[content.mapName]}`;
      message += `\n人数:  ${content.currentPlayers} / ${content.maxPlayers} [${content.currentSpectators}]`;

      if (content.rotation.length == 0) {
        message += "\n\n当前服务器无地图";
        return message;
      }

      message += `\n=======  地图数量 ${content.rotation.length}  =======`;
      for (const [index, map] of content.rotation.entries()) {
        message += `\n${(index + 1).toString().padStart(2, "0")}.  ${modeDb[map.modeLongName]} - ${mapDb[map.mapLongName]}`;
      }

      return message;
    });

}

