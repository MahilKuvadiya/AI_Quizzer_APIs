import express from 'express'
import http from 'http'
import cors from 'cors'
import  bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import compression  from 'compression'
import mongoose from 'mongoose'

import router from './router'
import redisClient from 'helper/redis-client/redis-client'
// import { port } from '../env-config'

const app = express()

//middlewares
app.use(cors({
    "credentials" : true
}))
app.use(compression())
app.use(cookieParser())
app.use(bodyParser.json())

app.use('/',router())

const server = http.createServer(app);

app.get('/',(req : express.Request, res : express.Response) => {
    res.send("Hello world")
})

server.listen(process.env.PORT,()=>{
    console.log('server listning... on ' + process.env.PORT)
})  

mongoose.Promise = Promise
mongoose.connect(process.env.MONGO_URL)
mongoose.connection.on('connected',() =>{
    console.log('connected')
})
mongoose.connection.on('error', (error : Error) =>{
    console.log(error)
})
