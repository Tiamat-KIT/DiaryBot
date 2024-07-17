import {Hono} from 'hono'
import { type ExportedHandlerScheduledHandler } from "@cloudflare/workers-types"
import {Client,LogLevel} from "@notionhq/client"
import {formatToTimeZone} from "date-fns-timezone"
import { CreateDiaryPage } from './utils'


const app = new Hono<{
  Bindings: {
    LINE_CHANNEL_ACCESS_TOKEN: string,
    LINE_CHANNEL_SECRET: string,
    MY_USER_ID: string,
    NOTION_TOKEN: string,
    DATABASE_ID:string
  }
}>()

app.post("/",async (c) => {
  const response = await fetch("https://api.line.me/v2/bot/message/push",{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${c.env.LINE_CHANNEL_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      "to": `${c.env.MY_USER_ID}`,
      "messages": [
        {
          "type": "text",
          "text": "テスト！"
        }
      ],
      "notificationDisabled": false
    })
  })
  if(response.ok){
    const result = await response.json()
    c.json({result},200)
  }else {
    const status:number  = response.status 
    const text = response.statusText
    console.log(`Code: ${status}: ${text}`)
  }
})

const scheduled:ExportedHandlerScheduledHandler<Env>  = async(event, env, ctx) => {
  if(event.cron === "0 12 * * *") {
    await fetch("https://api.line.me/v2/bot/message/push",{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        "to": `${env.MY_USER_ID}`,
        "messages": [
          {
            "type": "text",
            "text": "日記書けよ"
          }
        ],
        "notificationDisabled": false
      })
    })
  }else if(event.cron === "*/30 * * * *"){
    console.log("Worker Works!")
  }else if(event.cron === "0 21 * * * *") {
    await fetch("https://api.line.me/v2/bot/message/push",{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        "to": `${env.MY_USER_ID}`,
        "messages": [
          {
            "type": "text",
            "text": "おはよう。朝だな！"
          }
        ],
        "notificationDisabled": false
      })
    })
  }else if(event.cron === "0 15 * * *"){
    CreateDiaryPage(env)
  }
}


export default {
  fetch: app.fetch,
  scheduled
}
