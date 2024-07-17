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