import {Hono} from 'hono'
import { type ExportedHandlerScheduledHandler } from "@cloudflare/workers-types"
import { CreateDiaryPage, LineMessagePost } from './utils'


const app = new Hono<{
  Bindings: {
    LINE_CHANNEL_ACCESS_TOKEN: string,
    LINE_CHANNEL_SECRET: string,
    MY_USER_ID: string,
    NOTION_TOKEN: string,
    DATABASE_ID:string
  }
}>()

const scheduled:ExportedHandlerScheduledHandler<Env>  = async(event, env, ctx) => {
  if(event.cron === "0 12 * * *") {

    LineMessagePost(env,env.MY_USER_ID,"日記かけよ！")
  }else if(event.cron === "*/30 * * * *"){
    console.log("Worker Works!")
  }else if(event.cron === "0 21 * * * *") {
    LineMessagePost(env,env.MY_USER_ID,"おはよう！朝だな！")
  }else if(event.cron === "0 15 * * *"){
    CreateDiaryPage(env)
  }
}


export default {
  fetch: app.fetch,
  scheduled
}
