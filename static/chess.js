// access the <body> element in chess.html
// make sure the document has been loaded before accessing the data
const body = document.querySelector('body')

// access the data attribute to retrieve gameId and orientation
const gameId = body.dataset.gameId
const orientation = body.dataset.orientation

console.info(`gameId: ${gameId}, orientation: ${orientation}`)

// handle on drop
const onDrop = (src, dest, piece) => {
    console.info(`source = ${src}, destination = ${dest}, piece = ${piece}`)

    // construct the move
    const move = { src, dest, piece }

    // PATCH /chess/:gameId
    // for making partial updates or modifications to an existing resource on a web server
    fetch(`/chess/${gameId}`, 
        {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(move) 
        })
    .then(resp => console.info(`RESPONSE: `, resp))
    .catch(resp => console.error(`ERROR: `, err))
}

// create a chess configuration
const config = {
    draggable: true,
    position: 'start',
    orientation, // sets orientation of board depending on player's colour
    onDrop
}

// create an instace of chess
const chess = Chessboard('chess', config)

// create an SSE connection
const sse = new EventSource('/chess/stream')

// receive move for gameId
// ensure that the listener only listens for responses regarding the particular gameId
sse.addEventListener(gameId, msg => {
    console.info('>>> SSE message: ', msg)

    // parse data from text to object
    const { src, dest, piece } = JSON.parse(msg.data)
    console.info(`source: ${src}, destination: ${dest}, piece: ${piece}`)

    chess.move(`${src}-${dest}`)
})

