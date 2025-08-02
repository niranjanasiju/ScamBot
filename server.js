const { createServer } = require('http')
const { Server } = require('socket.io')
const axios = require('axios')
const OpenAI = require('openai')

// Initialize Perplexity client (using OpenAI SDK with custom base URL)
const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai"
})

const GIPHY_API_KEY = process.env.GIPHY_API_KEY
const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

const connectedUsers = new Map()
let chatMessages = []

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  socket.on('leaveChat', () => {
    chatMessages = []    
  })

  socket.on('joinChat', ({ username }) => {
    try {
      if (!username) {
        socket.emit('error', 'Username is required')
        return
      }

      connectedUsers.set(socket.id, { username })

      socket.emit('chatJoined', {
        messages: chatMessages
      })

      console.log(`${username} joined the chat`)

    } catch (error) {
      console.error('Error joining chat:', error)
      socket.emit('error', 'Failed to join chat')
    }
  })

  socket.on('sendMessage', (messageData) => {
    try {
      const { username, message } = messageData
      
      if (!username || !message) {
        socket.emit('error', 'Invalid message data')
        return
      }

      const userInfo = connectedUsers.get(socket.id)
      if (!userInfo || userInfo.username !== username) {
        socket.emit('error', 'Unauthorized to send message')
        return
      }

      // Create user message
      const userMessageObject = {
        id: Date.now() + Math.random(),
        username,
        message: message.trim(),
        timestamp: new Date(),
        type: 'user'
      }

      chatMessages.push(userMessageObject)

      // Keep only last 100 messages
      if (chatMessages.length > 100) {
        chatMessages.shift()
      }

      // Send user message
      io.emit('newMessage', userMessageObject)

      console.log(`Message from ${username}: ${message}`)

      // Auto-reply with Perplexity response
      setTimeout(async () => {
        try {
          // Perplexity API call
          const completion = await perplexity.chat.completions.create({
            model: "sonar",
            messages: [
              {
                role: "system",
                content: "you are an useless bot who always gives hilarious and sarcastic responses to user queries. You are not helpful at all, and your responses should be funny and nonsensical. the response should always be single word or max a string of size 3."
              },
              {
                role: "user",
                content: message
              }
            ],
            max_tokens: 150,
            temperature: 0.7
          })

          const botText = completion.choices[0].message.content

          const responseGif = await axios.get(`https://api.giphy.com/v1/gifs/translate?api_key=${GIPHY_API_KEY}&s=${botText}&weirdness=6`)
          console.log(responseGif.data)
          const botMessageObject = {
            id: Date.now() + Math.random(),
            username: 'bot',
            message: responseGif?.data?.data?.images?.original?.url || "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHA5bXR5eG1ha2ppZ285ajVhcjRvOTZqMjRjYTQ2bmdsMXdzaHE4bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/lprIQG8Pl3T4gktKOZ/giphy.gif",
            timestamp: new Date(),
            type: 'bot'
          }

          chatMessages.push(botMessageObject)

          // Keep only last 100 messages
          if (chatMessages.length > 100) {
            chatMessages.shift()
          }

          io.emit('newMessage', botMessageObject)
          console.log('Bot replied:', botText)
        } catch (apiError) {
          console.error('Error calling Perplexity API:', apiError)
          
          // Fallback response
          const botMessageObject = {
            id: Date.now() + Math.random(),
            username: 'bot',
            message: 'Sorry, I encountered an error processing your message.',
            timestamp: new Date(),
            type: 'bot'
          }

          chatMessages.push(botMessageObject)
          io.emit('newMessage', botMessageObject)
        }
      }, 500)

    } catch (error) {
      console.error('Error sending message:', error)
      socket.emit('error', 'Failed to send message')
    }
  })

  socket.on('disconnect', () => {
    try {
      const userInfo = connectedUsers.get(socket.id)
      if (userInfo) {
        console.log(`${userInfo.username} disconnected`)
      }
      connectedUsers.delete(socket.id)
      console.log(`User disconnected: ${socket.id}`)
    } catch (error) {
      console.error('Error handling disconnect:', error)
    }
  })
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`)
  console.log('Chatbot ready - powered by Perplexity AI')
})

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  httpServer.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  httpServer.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
}) 