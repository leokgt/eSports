import express, { application, request, response } from "express";
import cors from 'cors';
import { PrismaClient } from '@prisma/client'
import { convertHourStringToMinutes } from "./utils/convert-hour-string-to-minutes";
import { convertMinutesToHourString } from "./utils/convert-minutes-to-hour-string";

const app = express()

app.use(express.json())
app.use(cors())

const prisma = new PrismaClient({
    log: ['query']
})

//mninhaapi.com/"ADS"
//localhost:3333/ads
//HTTP methods / API RESTful (GET, POST, PUT, PATCH, DELETE) //HTTP Codes =>(Qual o tipo de resposta do Back-End)
//'houtEnd' => horsEnd 

const options: cors.CorsOptions = {
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'X-Access-Token',
    ],
    credentials: true,
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin: 'http://127.0.0.1:5173', // <- aqui vai a sua url que está pedindo os dados.
    preflightContinue: false,
  };

app.get('/games', async (request, response) => {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true,
                }

            }
        }
    })
    return response.json(games);
})
app.post('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;
    const body: any = request.body;

    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hourStart: convertHourStringToMinutes (body.hourStart),
            houtEnd: convertHourStringToMinutes (body.houtEnd),
            useVoiceChannel: body.useVoiceChannel,


        }
    })

    return response.status(201).json(ad);
})

app.get('/games/:id/ads', async (request, response) => {

    const gameId = request.params.id;
    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hourStart: true,
            houtEnd: true,

        },
        where: {
            gameId,
        },

        orderBy: {
            creatAt: 'desc'
        }

    })

    return response.json(ads.map(ad => {
        return {
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart: convertMinutesToHourString (ad.hourStart),
            houtEnd: convertMinutesToHourString (ad.houtEnd),
        }
    }))



})
app.get('/ads/:id/discord', async (request, response) => {

    const adId = request.params.id;
    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true,
        },
        where:{
            id: adId,
        }
    })

    return response.json({
        discord: ad.discord,
    })

})
app.listen(3333)

