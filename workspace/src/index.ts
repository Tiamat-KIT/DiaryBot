import {Hono} from 'hono'
import { type ExportedHandlerScheduledHandler } from "@cloudflare/workers-types"
import {Client,LogLevel} from "@notionhq/client"
import {formatToTimeZone} from "date-fns-timezone"
  

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

app.post("/new",async (c) => {
  try {
    const notion = new Client({
      auth: c.env.NOTION_TOKEN,
      logLevel: LogLevel.INFO
    })
    const NewDiary = await notion.pages.create({
      parent: {
        database_id: c.env.DATABASE_ID
      },
      icon: {
        emoji: "📘"
      },
      properties: {
        "名前": {
          title: [
            {
              text: {
                content: `${formatToTimeZone(new Date(),"YYYY/MM/DD",{timeZone: "Asia/Tokyo"})}`
              }
            }
          ]
        }
      }
    })
  } catch(err: unknown){
    console.error(err)
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
  }/* else if(event.cron === "0 19 * * *"){
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
            "text": "寝ないとヤバくないか？"
          }
        ],
        "notificationDisabled": false
      })
    })
  } */else if(event.cron === "0 */4 * * *"){
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
            "text": `現在、${new Date().getHours().toLocaleString("ja-JP")}時です`
          }
        ],
        "notificationDisabled": false
      })
    })
  }else if(event.cron === "0 15 * * *"){
    try {
      const notion = new Client({
        auth: env.NOTION_TOKEN,
        logLevel: LogLevel.INFO
      })
      const NewDiary = await notion.pages.create({
        parent: {
          database_id: env.DATABASE_ID
        },
        icon: {
          emoji: "📘"
        },
        properties: {
          "名前": {
            title: [
              {
                text: {
                  content: `${formatToTimeZone(new Date(),"YYYY/MM/DD",{timeZone: "Asia/Tokyo"})}`
                }
              }
            ]
          }
        }
      })
    } catch(err: unknown){
      console.error(err)
    }
  }
}


export default {
  fetch: app.fetch,
  scheduled
}
