import {Hono} from 'hono'
import { type ExportedHandlerScheduledHandler } from "@cloudflare/workers-types"

const app = new Hono<{
  Bindings: {
    LINE_CHANNEL_ACCESS_TOKEN: string,
    LINE_CHANNEL_SECRET: string,
    MY_USER_ID: string
  }
}>()

app.post("/",async (c) => {
  const response = await fetch("https://api.line.me/v2/bot/message/push",{
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
  if(response.ok){
    const result = await response.json()
    c.json({result},200)
  }
})


const scheduled:ExportedHandlerScheduledHandler<Env>  = async(event, env, ctx) => {
  if(event.cron === "* 12 * * *") {
    await fetch("https://api.line.me/v2/bot/message/push",{
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
  }else if(event.cron === "* 21 * * * *") {
    await fetch("https://api.line.me/v2/bot/message/push",{
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
  }else if(event.cron === "* 19 * * *"){
    await fetch("https://api.line.me/v2/bot/message/push",{
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
  }else if(event.cron === "* */4 * * *"){
    await fetch("https://api.line.me/v2/bot/message/push",{
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
  }
}


export default {
  fetch: app.fetch,
  scheduled
}
