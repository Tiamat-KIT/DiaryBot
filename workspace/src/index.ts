import {Hono} from 'hono'
import { type ExportedHandlerScheduledHandler } from "@cloudflare/workers-types"
import { Client, LogLevel } from "@notionhq/client"
import { formatToTimeZone } from "date-fns-timezone"

export async function CreateDiaryPage(env: Env){
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
                title: [{
                        text: {
                            content: `${formatToTimeZone(new Date(),"YYYY/MM/DD",{timeZone: "Asia/Tokyo"})}`
                        }
                    }]
                }
            }
        })
    } catch(err: unknown){
        console.error(err)
    }
}

export async function LineMessagePost(env: Env,user_id: string,message: string){
    await fetch("https://api.line.me/v2/bot/message/push",{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
            "to": user_id,
            "messages": [
            {
                "type": "text",
                "text": message
            }
            ],
            "notificationDisabled": false
        })
    })
} 

export async function DiaryWhitedCheck(env: Env) {
    try {
        const notion = new Client({
            auth: env.NOTION_TOKEN,
            logLevel: LogLevel.INFO
        })
        const page = await notion.databases.query({
            database_id: env.DATABASE_ID,
            filter: {
                and: [{
                    property: "書き終えた！",
                    checkbox: {
                        equals: true
                    }}
                ,{
                    property: "名前",
                    title: {
                        equals: `${formatToTimeZone(new Date(),"YYYY/MM/DD",{timeZone: "Asia/Tokyo"})}`
                    }
                }]
            }
        })
        
    } catch(err: unknown){
        console.error(err)
    }
}



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
