// import the packages
import express from 'express'
import morgan from 'morgan'
import { engine } from 'express-handlebars'
import { v4 as uuidv4 } from 'uuid'
import { EventSource } from 'express-ts-sse'

// set port from env var or default if not specified
const port = process.env.PORT || 3000

// create an instance of SSE
const sse = new EventSource()

// create an instance of the application
const app = express()

// configure render
// associate handlebar engine with html (suffix of the file)
// supports only 1 rendering
app.engine('html', engine({ defaultLayout: false }))
app.set('view engine', 'html')

// log incoming request
app.use(morgan('combined'))

// all logic between logs and static file

// POST /chess
// inform express what kind of data you're sending to server
app.post('/chess', express.urlencoded({ extended: true }), 
    (req, resp) => {
        // generate game Id
        const gameId = uuidv4().substring(0, 8)

        // colour of player e.g. white/black
        const orientation = 'white'

        // response is the status 200 and 'chess' page
        resp.status(200).render('chess', { gameId, orientation })
})

// GET /chess?gameId=abc123
app.get('/chess',
    (req, resp) => {

        // get gameId from request body
        const gameId = req.query.gameId

        const orientation = 'black'

        resp.status(200).render('chess', { gameId, orientation })
    }
)

// PATCH /chess/:gameId
// : informs that gameId is a variable
app.patch('/chess/:gameId', express.json(), 
    (req, resp) => {
        // get gameId from path
        const gameId = req.params.gameId

        // get move from payload
        const move = req.body

        console.info(`Game ID: ${gameId}: `, move)

        sse.send({ 
            event: gameId, // event name is the gameId
            data: move // data to send over is the move
            // data sent via SSE will be in text
            // we will need to stringify the data object to send via SSE (except here as this library does it for us)
        })
        
        resp.status(201).json({ timestamp: (new Date()).getTime() })
    })

// GET /chess/stream
app.get('/chess/stream', sse.init)

// serve files from static
// dirname is the navigation point of the folder
app.use(express.static(__dirname + '/static'))

// start express
app.listen(port, 
    () => console.info(`Application bound to port ${port} at ${new Date()}`))

